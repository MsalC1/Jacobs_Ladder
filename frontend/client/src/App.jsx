import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import LobbyPage from "./pages/LobbyPage";
import GamePage from "./pages/GamePage";
import SignUpPage from "./pages/SignUpPage";

function App() {
  return (
    <Router>
        <Routes>
        <Route path="/"      element={<LoginPage />} />
        <Route path="/lobby" element={<LobbyPage />} />
        <Route path="/game"  element={<GamePage />}  />
        <Route path="signup" element={<SignUpPage/>} />
        </Routes>
    </Router>
  );
}

export default App;