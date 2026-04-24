import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

function LobbyPage() {
  const { roomCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { nickname, isHost } = location.state || {};
  const [players, setPlayers] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5000'); // Adjust to your backend URL
    setSocket(newSocket);

    newSocket.emit('joinRoom', { roomCode, nickname });
    console.log('Emitted joinRoom:', { roomCode, nickname });

    newSocket.on('roomUpdate', (roomData) => {
      console.log('Room update received:', roomData);
      setPlayers(roomData.players);
    });

    newSocket.on('gameStart', () => {
      console.log('Game start received, navigating to game');
      navigate('/game', { state: { roomCode, nickname } });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomCode, nickname, navigate]);

  const handleStartGame = () => {
    console.log('Start game button clicked');
    if (socket) {
      console.log('Emitting startGame for room:', roomCode);
      socket.emit('startGame', { roomCode });
    }
    // Temporary: navigate directly for testing
    console.log('Navigating to game');
    navigate('/game', { state: { roomCode, nickname } });
  };

  return (
    <div style={{ padding: 32, textAlign: 'center', backgroundColor: '#1a1a1a', color: '#e8e8e8', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <h1 style={{ color: '#ffffff', fontFamily: "'Courier New', monospace" }}>Lobby - Room {roomCode}</h1>
      <p>Share this code with friends: <strong>{roomCode}</strong></p>
      <p>Your nickname: {nickname}</p>
      <h2>Players:</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {players.map((player, index) => (
          <li key={index} style={{ marginBottom: 8, color: player.isHost ? '#ff6b6b' : '#e8e8e8' }}>
            {player.nickname} {player.isHost ? '(Host)' : ''}
          </li>
        ))}
      </ul>
      {true && (  // Temporarily always show for testing
        <button onClick={handleStartGame} style={{ padding: 10, backgroundColor: '#ff6b6b', border: 'none', color: 'white', cursor: 'pointer' }}>
          Start Game
        </button>
      )}
    </div>
  );
}

export default LobbyPage;