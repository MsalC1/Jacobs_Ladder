from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Store rooms in memory (for simplicity, use a dict)
rooms = {}

@socketio.on('joinRoom')
def handle_join_room(data):
    room_code = data['roomCode']
    nickname = data['nickname']
    print(f'Join room: {room_code}, nickname: {nickname}')
    
    socketio.join_room(room_code)
    
    if room_code not in rooms:
        rooms[room_code] = {'players': [], 'host': nickname}
    
    rooms[room_code]['players'].append({'nickname': nickname, 'isHost': len(rooms[room_code]['players']) == 0})
    
    print(f'Room {room_code} players: {rooms[room_code]["players"]}')
    socketio.emit('roomUpdate', rooms[room_code], room=room_code)

@socketio.on('startGame')
def handle_start_game(data):
    room_code = data['roomCode']
    print(f'Start game for room: {room_code}')
    if room_code in rooms:
        socketio.emit('gameStart', room=room_code)

if __name__ == '__main__':
    socketio.run(app, debug=True)
    app.run(debug=True)