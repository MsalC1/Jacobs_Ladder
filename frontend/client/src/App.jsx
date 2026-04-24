import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import LobbyPage from "./pages/LobbyPage";
import GamePage from "./pages/GamePage";

function App() {
  return (
    <Router>
        <Routes>
        <Route path="/"      element={<LoginPage />} />
        <Route path="/lobby" element={<LobbyPage />} />
        <Route path="/game"  element={<GamePage />}  />
        </Routes>
    </Router>
  );
}

export default App;