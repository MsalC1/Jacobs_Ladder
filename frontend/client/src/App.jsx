import { Routes, Route } from 'react-router-dom';
import EntryPage from './EntryPage';
import LobbyPage from './LobbyPage';
import GamePage from './GamePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<EntryPage />} />
      <Route path="/lobby/:roomCode" element={<LobbyPage />} />
      <Route path="/game" element={<GamePage />} />
    </Routes>
  );
}

export default App;