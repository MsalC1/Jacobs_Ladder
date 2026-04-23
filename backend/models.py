from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import hashlib

db = SQLAlchemy()

def init_db(app):
    # REPLACE THESE VALUES with your actual PythonAnywhere database details
    # Format: mysql+mysqldb://<username>:<password>@<host>/<database_name>
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqldb://youruser:yourpassword@youruser.mysql.pythonanywhere-services.com/youruser$gamedb'
    
    # PythonAnywhere drops idle connections after 5 mins; we recycle at 280s
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {'pool_recycle': 280}
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)

class Player(db.Model):
    __tablename__ = 'players'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    total_wins = db.Column(db.Integer, default=0)
    total_games = db.Column(db.Integer, default=0)
    highest_level = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_password(self, password):
        self.password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    def check_password(self, password):
        return self.password_hash == hashlib.sha256(password.encode()).hexdigest()

class Game(db.Model):
    __tablename__ = 'games'
    id = db.Column(db.Integer, primary_key=True)
    room_code = db.Column(db.String(10), unique=True, nullable=False)
    max_players = db.Column(db.Integer, default=4)
    total_levels = db.Column(db.Integer, default=10)
    status = db.Column(db.String(20), default='waiting') 
    winner_id = db.Column(db.Integer, db.ForeignKey('players.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class GamePlayer(db.Model):
    __tablename__ = 'game_players'
    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.Integer, db.ForeignKey('games.id'), nullable=False)
    player_id = db.Column(db.Integer, db.ForeignKey('players.id'), nullable=False)
    current_level = db.Column(db.Integer, default=0)
    is_ready = db.Column(db.Boolean, default=False)
    
    __table_args__ = (db.UniqueConstraint('game_id', 'player_id', name='unique_game_player'),)