from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, init_db, Player
from auth import create_token, token_required
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)
app.config['SECRET_KEY'] = "change-me"

CORS(app) # dont know if this will mess with the line on the bottom???
socketio = SocketIO(app, cors_allowed_origins='*')

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


#-----   SOCKETIO METHODS FOR SIGNALING   -----

# note: this is really basic functionality for now

@socketio.on('join')
def on_join(data):
    # peer joins room to find counterpart
    room = data['room']
    join_room(room)
    print("User has joined a room!")
    #notify other peer
    emit('peer_joined', room=room, include_self=False)

@socketio.on('signal')
def signal(data):
    # relay WebRTC response/ice/offer to other peer
    room = data['room']

    # let other users in the room know what the response is
    emit('signal', data['signal'], room=room, include_self=False) 



if __name__ == '__main__':
    socketio.run(app)