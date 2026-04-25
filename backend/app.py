from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, init_db, Player
from auth import create_token, token_required
from flask_socketio import SocketIO, emit, join_room, leave_room
import os

app = Flask(__name__)

# Use the environment variable for secret key in production
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'change-me-to-a-secure-key-in-production')

# Configure CORS for production
CORS(app, origins=[
    'http://localhost:3000',
    'http://localhost:5000',
    'https://your-frontend-domain.onrender.com' # Update with your frontend Render URL
])

# Socket.IO with production settings
socketio = SocketIO(app, 
                    cors_allowed_origins='*',
                    async_mode='eventlet',
                    ping_timeout=60,
                    ping_interval=25)

#------   HTTP METHODS FOR LOGINS   -------

# Initialize database configuration
init_db(app)

# Create tables if they don't exist yet
with app.app_context():
    db.create_all()

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

rooms = {}

@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")

# Another new addtion of code for the next 9 lines
@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection and clean up rooms"""
    print(f"Client disconnected: {request.sid}")
    # Remove from any rooms
    for room_id, clients in rooms.items():
        if request.sid in clients:
            clients.remove(request.sid)
            emit('peer_left', request.sid, room=room_id)

@socketio.on('join_room')
def handle_join(data):
    # peer joins room to find counterpart
    room_id = data['room']

    join_room(room_id)

    if room_id not in rooms:
        rooms[room_id] = []

    if request.sid not in rooms[room_id]:
        rooms[room_id].append(request.sid)

    print(f"User {request.sid} has joined room {room_id}!")

    #notify other peer
    emit('peers', rooms[room_id], to=request.sid)
    emit('new_peer', request.sid, room=room_id, include_self=False) 
    # Changed 'new_peers' to 'new_peer' for consistency

@socketio.on('ready')
def handle_ready(data):
    room_id = data['room']
    emit('ready', request.sid, room=room_id, include_self=False)


@socketio.on('signal')
def handle_signal(data):
    # relay WebRTC response/ice/offer to other peer
    target = data['to']


    # let other users in the room know what the response is
    emit('signal', {
        'from': request.sid,
        'data': data['data']
    }, to=target) 

# Additions and many modifications made to the following lines of code
def handle_leave(data):
    """Handle a user leaving a room"""
    room_id = data['room']
    if room_id in rooms and request.sid in rooms[room_id]:
        rooms[room_id].remove(request.sid)
        leave_room(room_id)
        emit('peer_left', request.sid, room=room_id)
        print(f"User {request.sid} left room {room_id}")

if __name__ == '__main__':
    # Get port from environment variable (Render sets this automatically)
    port = int(os.environ.get('PORT', 5000))
    # Use host='0.0.0.0' to listen on all network interfaces (required for Render)
    socketio.run(app, host='0.0.0.0', port=port, debug=False)