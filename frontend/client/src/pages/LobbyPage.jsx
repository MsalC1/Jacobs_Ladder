import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function LobbyPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const { nickname } = location.state || {};
    const [roomCode, setRoomCode] = useState("");

    function createRoom() {
        const newRoomCode = Math.random().toString(36).slice(2, 7).toUpperCase();

        navigate("/game", {
        state: {
            nickname: nickname || "Guest",
            roomCode: newRoomCode,
        },
        });
    }

    function joinRoom(e) {
        e.preventDefault();

        if (!roomCode.trim()) return;

        navigate("/game", {
        state: {
            nickname: nickname || "Guest",
            roomCode: roomCode.trim().toUpperCase(),
        },
        });
    }

    return (
        <div style={styles.page}>
        <div style={styles.card}>
            <h1>Lobby</h1>
            <p>Player: {nickname || "Guest"}</p>

            <button onClick={createRoom} style={styles.button}>
            Create Room
            </button>

            <form onSubmit={joinRoom} style={styles.form}>
            <input
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="Enter room code"
                style={styles.input}
            />

            <button type="submit" style={styles.button}>
                Join Room
            </button>
            </form>
        </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        background: "#1a1a1a",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    card: {
        width: "320px",
        padding: "32px",
        borderRadius: "12px",
        background: "#2a2a2a",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        textAlign: "center",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    },
    input: {
        padding: "12px",
        fontSize: "16px",
        borderRadius: "8px",
        border: "none",
    },
    button: {
        padding: "12px",
        fontSize: "16px",
        borderRadius: "8px",
        border: "none",
        background: "#4caf50",
        color: "white",
        cursor: "pointer",
    },
};

export default LobbyPage;