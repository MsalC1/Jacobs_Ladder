from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import hashlib
import os

db = SQLAlchemy()

def init_db(app):
    # Use PostgreSQL on Render, fallback to SQLite for local development
    database_url = os.environ.get('DATABASE_URL')

    if database_url:
        # Render provides PostgreSQL
        # Fix for Render's postgresql:// vs postgres://
        if database_url.startswith('postgres://'):
            database_url = database_url.replace('postgres://', 'postgresql://', 1)
        app.config['SQLALCHEMY_DATABASE_URI'] = database_url
        app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
            'pool_pre_ping': True,
            'pool_recycle': 300
        }
    else:
        # Local development with SQLite
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///game.db'
    
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
