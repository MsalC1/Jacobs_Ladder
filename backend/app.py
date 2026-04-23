from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, init_db, Player
from auth import create_token, token_required

app = Flask(__name__)
CORS(app)

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

if __name__ == '__main__':
    app.run(debug=True)