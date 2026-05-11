from app import app
from models import db, Player, Game, GamePlayer

with app.app_context():
    print("=" * 50)
    print("DATABASE STATUS REPORT")
    print("=" * 50)
    
    # Player statistics
    player_count = Player.query.count()
    print(f"\nPLAYERS: {player_count}")
    
    if player_count > 0:
        print("\n  Player List:")
        for player in Player.query.all():
            print(f"    - ID: {player.id} | Username: {player.username} | Email: {player.email}")
            print(f"      Wins: {player.total_wins} | Games: {player.total_games} | Highest Level: {player.highest_level}")
    
    # Game statistics
    game_count = Game.query.count()
    print(f"\nGAMES: {game_count}")
    
    if game_count > 0:
        print("\n  Game List:")
        for game in Game.query.all():
            print(f"    - ID: {game.id} | Room: {game.room_code} | Status: {game.status}")
            print(f"      Max Players: {game.max_players} | Total Levels: {game.total_levels}")
    
    # GamePlayer statistics (enrollments)
    enrollment_count = GamePlayer.query.count()
    print(f"\nENROLLMENTS: {enrollment_count}")
    
    if enrollment_count > 0:
        print("\n  Enrollment Details:")
        for enrollment in GamePlayer.query.all():
            player = Player.query.get(enrollment.player_id)
            game = Game.query.get(enrollment.game_id)
            print(f"    - Player: {player.username if player else 'Unknown'} | Game: {game.room_code if game else 'Unknown'}")
            print(f"      Current Level: {enrollment.current_level} | Ready: {enrollment.is_ready}")
    
    # Summary
    print("\n" + "=" * 50)
    print("SUMMARY")
    print("=" * 50)
    print(f"Total Players: {player_count}")
    print(f"Total Games: {game_count}")
    print(f"Total Enrollments: {enrollment_count}")
    
    if player_count == 0:
        print("\nNo players found! Register a user to test:")
        print("   curl -X POST http://localhost:5000/register -H 'Content-Type: application/json' -d '{\"username\":\"test\",\"email\":\"test@test.com\",\"password\":\"password123\"}'")
    
    print("=" * 50)