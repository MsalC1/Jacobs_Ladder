import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

function RoomPage() {
    const socketRef = useRef(null);

    const navigate = useNavigate();
    const location = useLocation();

    const {
        nickname = localStorage.getItem("nickname") || "Guest",
        roomCode,
        token = localStorage.getItem("token"),
        URL,
    } = location.state || {};

    const [players, setPlayers] = useState([]);
    const [isReady, setIsReady] = useState(false);
    const [countdown, setCountdown] = useState(null);

    useEffect(() => {
        if (!roomCode) {
            navigate("/lobby", {
                state: { nickname, token },
            });
            return;
        }

        const socket = io(URL);
        socketRef.current = socket;

        socket.emit("join_room", {
            room: roomCode,
            username: nickname,
        });

        socket.emit("get_players", {
            room: roomCode,
        });

        socket.on("peers", (playersInRoom) => {
            setPlayers(playersInRoom);
        });

        socket.on("player_list_update", (playersInRoom) => {
            setPlayers(playersInRoom);
        });

        socket.on("player_ready_update", (data) => {
            setPlayers((prev) =>
                prev.map((player) =>
                    player.sid === data.sid
                        ? { ...player, ready: data.ready }
                        : player
                )
            );
        });

        function startCountdown() {
            if (countdown !== null) return;

            let count = 3;
            setCountdown(count);

            const interval = setInterval(() => {
                count--;

                if (count > 0) {
                    setCountdown(count);
                } else {
                    clearInterval(interval);
                    setCountdown("GO!");

                    socketRef.current?.emit("start_game", {
                        room: roomCode,
                    });
                }
            }, 1000);
        }

        socket.on("all_players_ready", () => {
            startCountdown();
        });

        socket.on("game_start", () => {
            navigate("/game", {
                state: {
                    nickname,
                    roomCode,
                    token,
                    URL,
                },
            });
        });

        socket.on("peer_left", (msg) => {
            const sid = typeof msg === "string" ? msg : msg.sid;

            setPlayers((prev) => prev.filter((player) => player.sid !== sid));
        });

        return () => {
            socket.emit("leave_room", {
                room: roomCode,
            });

            socket.disconnect();
        };
    }, [roomCode, nickname, token, navigate]);

    function toggleReady() {
        const nextReady = !isReady;
        setIsReady(nextReady);

        socketRef.current?.emit("player_ready", {
            room: roomCode,
            ready: nextReady,
        });
    }

    function leaveRoom() {
        socketRef.current?.emit("leave_room", {
            room: roomCode,
        });

        socketRef.current?.disconnect();

        navigate("/lobby", {
            state: {
                nickname,
                token,
            },
        });
    }

    return (
            <div style={styles.page}>
            <div className="menu-card room-card">
                <h1 className="room-title">Room</h1>

                <p className="room-code">Code: {roomCode}</p>

                <p className="room-count">
                    Players: {players.length}/2
                </p>

                <div className="room-player-list">
                    {players.map((player) => (
                        <div key={player.sid} style={styles.nickname} className="room-player-row">
                            <span>{player.nickname}</span>
                            <span style={player.ready ? styles.onReady : styles.notOnReady }>{player.ready ? "Ready" : "Not Ready"}</span>
                        </div>
                    ))}
                </div>

                {countdown !== null && (
                    <h2 className="room-countdown">{countdown}</h2>
                )}

                <button className="menu-button" onClick={toggleReady}>
                    {isReady ? "Unready" : "Ready Up"}
                </button>

                <button className="menu-button danger" onClick={leaveRoom}>
                    Leave Room
                </button>
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
    onReady: {
        padding: "9px",
        fontSize: "16px",
        borderRadius: "8px",
        border: "none",
        background: "#4caf50",
        color: "white",
    },
    notOnReady: {
        padding: "9px",
        fontSize: "16px",
        borderRadius: "8px",
        border: "none",
        background: "#cb202c",
        color: "white",
    },
    nickname: {
        alignItems: "center",
    }
}

export default RoomPage;