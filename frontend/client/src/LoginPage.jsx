import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isRegistering ? 'register' : 'login';
    try {
      const response = await fetch(`http://localhost:5000/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email: isRegistering ? `${username}@example.com` : undefined }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        navigate('/entry');
      } else {
        alert(data.error || 'Error');
      }
    } catch (error) {
      alert('Network error');
    }
  };

  return (
    <div style={{ padding: 32, textAlign: 'center', maxWidth: 400, margin: '0 auto', backgroundColor: '#1a1a1a', color: '#e8e8e8', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundImage: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)' }}>
      <h1 style={{ color: '#ffffff', fontFamily: "'Courier New', monospace", fontSize: '48px', marginBottom: 40, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>Jacobs Ladder</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: 20, backgroundColor: 'rgba(42,42,42,0.8)', padding: 24, borderRadius: 8, border: '1px solid #333333' }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
            Username:
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ display: 'block', width: '100%', marginTop: 8, padding: 12, backgroundColor: '#2a2a2a', border: '1px solid #333333', color: '#e8e8e8', borderRadius: 4, fontFamily: "'Courier New', monospace" }}
              required
            />
          </label>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ display: 'block', width: '100%', marginTop: 8, padding: 12, backgroundColor: '#2a2a2a', border: '1px solid #333333', color: '#e8e8e8', borderRadius: 4, fontFamily: "'Courier New', monospace" }}
              required
            />
          </label>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button type="submit" style={{ padding: '12px 24px', backgroundColor: '#ff6b6b', border: 'none', color: 'white', cursor: 'pointer', borderRadius: 4, fontFamily: "'Courier New', monospace", fontWeight: 'bold' }}>
            {isRegistering ? 'Register' : 'Login'}
          </button>
          <button type="button" onClick={() => setIsRegistering(!isRegistering)} style={{ padding: '12px 24px', backgroundColor: 'transparent', border: '1px solid #333333', color: '#e8e8e8', cursor: 'pointer', borderRadius: 4, fontFamily: "'Courier New', monospace" }}>
            {isRegistering ? 'Login Instead' : 'Register'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;