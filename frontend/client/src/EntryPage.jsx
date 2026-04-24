import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

function EntryPage() {
  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    if (!nickname.trim()) {
      alert('Please enter a nickname');
      return;
    }
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    navigate(`/lobby/${code}`, { state: { nickname, isHost: true } });
  };

  const handleJoinRoom = () => {
    if (!nickname.trim() || !roomCode.trim()) {
      alert('Please enter nickname and room code');
      return;
    }
    navigate(`/lobby/${roomCode}`, { state: { nickname, isHost: false } });
  };

  return (
    <div style={{ padding: 32, textAlign: 'center', maxWidth: 400, margin: '0 auto', backgroundColor: '#1a1a1a', color: '#e8e8e8', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <h1 style={{ color: '#ffffff', fontFamily: "'Courier New', monospace" }}>Jacobs Ladder</h1>
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', marginBottom: 8 }}>
          Nickname:
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            style={{ display: 'block', width: '100%', marginTop: 8, padding: 8, backgroundColor: '#2a2a2a', border: '1px solid #333333', color: '#e8e8e8' }}
          />
        </label>
      </div>
      <div style={{ marginBottom: 20 }}>
        <button onClick={handleCreateRoom} style={{ padding: 10, marginRight: 10, backgroundColor: '#ff6b6b', border: 'none', color: 'white', cursor: 'pointer' }}>
          Create Room
        </button>
        <div style={{ marginTop: 20 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>
            Room Code:
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              style={{ display: 'block', width: '100%', marginTop: 8, padding: 8, backgroundColor: '#2a2a2a', border: '1px solid #333333', color: '#e8e8e8' }}
            />
          </label>
          <button onClick={handleJoinRoom} style={{ padding: 10, marginTop: 10, backgroundColor: '#ff6b6b', border: 'none', color: 'white', cursor: 'pointer' }}>
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
}

export default EntryPage;