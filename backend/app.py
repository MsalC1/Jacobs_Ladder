from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, init_db, Player
from auth import create_token, token_required
from flask_socketio import SocketIO, emit, join_room, leave_room
import os
import re # Added for nickname number detection

app = Flask(__name__)

# Use the environment variable for secret key in production
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'change-me-to-a-secure-key-in-production')

# Configure CORS for production
# SHOULD REMOVE THIS, REDUNDANT...
CORS(app, origins=[
    'http://localhost:3000',
    'http://localhost:5000',
    'https://your-frontend-domain.onrender.com' # don't have a front end deployed yet...
])

# Socket.IO with production settings
socketio = SocketIO(app, 
                    cors_allowed_origins='*',
                    async_mode='gevent',
                    ping_timeout=60,
                    ping_interval=25)

#------   HTTP METHODS FOR LOGINS   -------

# Initialize database configuration
init_db(app)

# Create tables if they don't exist yet
with app.app_context():
    db.create_all()

# Store room data - SIDs list and nicknames tracking
rooms = {}  # room_id -> list of SIDs
nicknames = {}  # sid -> display nickname (for duplicate name handling)

# Function to handle duplicate nicknames in a room
def get_unique_nickname(room_id, requested_name):
    """
    Check if a nickname already exists in the room.
    If it does, append a number (e.g, "Name", "Name 2", "Name 3", etc.)
    Returns a unique nickname for the room.
    """

    # Get all current nicknames in this room
    existing_nicknames = []

    if room_id in rooms:
        for sid in rooms.get(room_id, []):
            if sid in nicknames:
                existing_nicknames.append(nicknames[sid])
    
    # If the requested name doesn't exist, return it as-is
    if requested_name not in existing_nicknames:
        return requested_name
    
    # Find the next available number
    base_name = requested_name
    counter = 2

    # Extract base name if it already has a number at the end
    match = re.match(r'(.+?)(?:\s+(\d+))?$', requested_name)
    if match:
        base_name = match.group(1)
        if match.group(2):
            counter = int(match.group(2)) + 1

    # Keep trying numbers until we find an unused one
    while f"{base_name} {counter}" in existing_nicknames:
        counter += 1
        
    return f"{base_name} {counter}"

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if Player.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    new_player = Player(username=data['username'], email=data['email'])
    new_player.set_password(data['password'])
    
    db.session.add(new_player)
    db.session.commit()
    return jsonify({'message': 'Player created successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    player = Player.query.filter_by(username=data['username']).first()
    
    if player and player.check_password(data['password']):
        token = create_token(player.id, player.username)
        return jsonify({'token': token})
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/profile', methods=['GET'])
@token_required
def get_profile():
    player = Player.query.get(request.player_id)
    return jsonify({
        'username': player.username,
        'wins': player.total_wins,
        'games_played': player.total_games
    })

# New addition of code
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for Render to verify the service is running"""
    return jsonify({'status': 'healthy'}), 200

#-----   SOCKETIO METHODS FOR SIGNALING   -----

# note: this code functionally only creates the peer 2 peer relationship
#       we still need additional javascript code on front end to make
#       the webRTC connection (p2p connection)

@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")

# Another new addtion of code for the next 9 lines
@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection and clean up rooms"""
    print(f"Client disconnected: {request.sid}")
    # Remove from any rooms
    for room_id, clients in list(rooms.items()):
        if request.sid in clients:
            clients.remove(request.sid)
            # Clean up nickname entries on disconnect
            if request.sid in nicknames:
                del nicknames[request.sid]
            emit('peer_left', request.sid, room=room_id)

# Changes made to join_room to handle duplicate nicknames
@socketio.on('join_room')
def handle_join(data):
    # peer joins room to find counterpart
    room_id = data['room']
    player_username = data.get('username', 'Guest') # Get username from client

    join_room(room_id)

    if room_id not in rooms:
        rooms[room_id] = []

    # Generates a unique nickname for this player
    unique_nickname = get_unique_nickname(room_id, player_username)

    # Stores the nickname associated with this SID
    nicknames[request.sid] = unique_nickname

    if request.sid not in rooms[room_id]:
        rooms[room_id].append(request.sid)

    # Modified to updated print to show both original and nickname
    print(f"User {player_username} (as {unique_nickname}) has joined room {room_id}!")

    # Creates a list of players with their display names
    players_in_room = []
    for sid in rooms[room_id]:
        if sid in nicknames:
            players_in_room.append({
                'sid': sid,
                'nickname': nicknames[sid]
            })

    #notify other peer (MODIFIED: send nickname data instead of just SIDs)
    emit('peers', players_in_room, to=request.sid)
    # Changed 'new_peers' to 'new_peer' for consistency (MODIFIED: send nickname data)
    emit('new_peer', {
        'sid': request.sid,
        'nickname': unique_nickname
    }, room=room_id, include_self=False)
    
    # MODIFIED: Send the joining player their assigned nickname
    emit('nickname_assigned', {
        'nickname': unique_nickname,
        'original_name': player_username
    }, to=request.sid)

# MODIFIED: Updated ready to include nickname
@socketio.on('ready')
def handle_ready(data):
    room_id = data['room']
    emit('ready', {
        'sid': request.sid,
        'nickname': nicknames.get(request.sid, 'Unknown')
    }, room=room_id, include_self=False)

# MODIFIED: Updated signal to include nickname
@socketio.on('signal')
def handle_signal(data):
    # relay WebRTC response/ice/offer to other peer
    target = data['to']

    # let other users in the room know what the response is (MODIFIED: include sender nickname)
    emit('signal', {
        'from': request.sid,
        'from_nickname': nicknames.get(request.sid, 'Unknown'),
        'data': data['data']
    }, to=target)

# Additions and many modifications made to the following lines of code (MODIFIED: added decorator and nickname cleanup)
@socketio.on('leave_room')
def handle_leave(data):
    """Handle a user leaving a room"""
    room_id = data['room']
    if room_id in rooms and request.sid in rooms[room_id]:
        rooms[room_id].remove(request.sid)
        # MODIFIED: Clean up nickname entries on leave
        if request.sid in nicknames:
            del nicknames[request.sid]
        leave_room(room_id)
        emit('peer_left', request.sid, room=room_id)
        print(f"User {request.sid} left room {room_id}")

if __name__ == '__main__':
    # Get port from environment variable (Render sets this automatically)
    port = int(os.environ.get('PORT', 5000))
    # Use host='0.0.0.0' to listen on all network interfaces (required for Render)
    socketio.run(app, host='0.0.0.0', port=port, debug=False)