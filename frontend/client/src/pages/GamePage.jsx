import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { createGame } from "../game/mainGame";
import { Pause } from "lucide-react";
import P2PManager from "../game/systems/P2PManager";

function GamePage(){
    const gameRef = useRef(null);
    const gameInstanceRef = useRef(null);
    const connectionRef = useRef(null);

    // Adding a pause menu:
    const [isPaused, setIsPaused] = useState(false);
    const [musicVolume, setMusicVolume] = useState(0.4);
    const [sfxVolume, setSfxVolume] = useState(0.5);
    
    // Adding a game over menu
    const [gameOver, setGameOver] = useState(false);
    const [endStats, setEndStats] = useState(null);

    //Test
    const location = useLocation();
    const navigate = useNavigate();

    const {
        nickname = localStorage.getItem("nickname") || "Guest",
        roomCode,
        // token = localStorage.getItem("token"),
    } = location.state || {};

    const [players, setPlayers] = useState([]);

    useEffect(() => {
        if (!gameRef.current) return;
        if (gameInstanceRef.current) return;

        // continue working on ts

        // testing
        const socket = io("http://localhost:5000");

        // prod
        // const socket = io("https://game-backend-cagb.onrender.com/");
        const manager = new P2PManager(socket, roomCode, nickname)

        connectionRef.current = manager;

        const game = createGame(gameRef.current, {
            networkManager: manager,
            nickname,
            roomCode,
        });

        gameInstanceRef.current = game;

        game.registry.set("showGameStats", async (stats) => {
            const token = localStorage.getItem("token");
            
            let profile = null;

            if (token) {
                try {
                    const res = await fetch("http://localhost:5000/profile", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (res.ok) {
                        profile = await res.json();
                    }
                } catch (err) {
                    console.error("Could not fetch updated profile:", err);
                }
            }

            setEndStats({
                ...stats,
                gamesPlayed: profile?.games_played ?? "N/A",
                gamesWon: profile?.wins ?? "N/A",
            });

            setGameOver(true);
        });

        manager.peerJoined = (gotPlayers) => {
            console.log("setting players to current players in room"); //debug
            console.log(gotPlayers);
            setPlayers(gotPlayers);
        };

        manager.peerLeft = (sid => {
            setPlayers((prev) => prev.filter((p) => p.sid !== sid));
        });

        manager.joinRoom();
        return () => {
            manager.leaveRoom?.();
            socket.disconnect();

            if (gameInstanceRef.current) {
                gameInstanceRef.current.destroy(true);
                gameInstanceRef.current = null;
            }
        };
    }, []);

    function pauseGame() {
        setIsPaused(true);

        const pauseSetter = gameInstanceRef.current?.registry.get("setLocalPaused");
        pauseSetter?.(true);
    }

    function resumeGame() {
        setIsPaused(false);

        const pauseSetter = gameInstanceRef.current?.registry.get("setLocalPaused");
        pauseSetter?.(false);
    }

    function changeMusicVolume(value) {
        setMusicVolume(value);
        
        const setter = gameInstanceRef.current?.registry.get("setMusicVolume");
        setter?.(value);
    }

    function changeSfxVolume(value) {
        setSfxVolume(value);

        const setter = gameInstanceRef.current?.registry.get("setSfxVolume");
        setter?.(value);
    }

    function disconnect() {
        connectionRef.current?.leaveRoom?.();

        if (gameInstanceRef.current) {
            gameInstanceRef.current.destroy(true);
            gameInstanceRef.current = null;
        }

        const savedToken = localStorage.getItem("token");
        const savedNickname = localStorage.getItem("nickname");

        navigate("/lobby", {
            state:
            {
                nickname: nickname || savedNickname,
                token: savedToken,
            },
        });
    }

    return (
        <main className="game-page">
            <section className="game-shell">
                <div className="game-canvas-wrap">
                    <div ref={gameRef} />

                    {!isPaused && !gameOver && (
                        <button className="pause-button" onClick={pauseGame} aria-label="Open settings">
                            <Pause size={16} />
                        </button>
                    )}

                    {isPaused && !gameOver && (
                        <div className="pause-overlay">
                            <div className="pause-card">
                                <h1 className="pause-title">Paused</h1>

                                <div className="pause-room-info">
                                    <p>Room: {roomCode}</p>
                                    <p>
                                        Players:{" "}
                                        {players.length > 0
                                            ? players.map((p) => p.nickname).join(", ")
                                            : "Waiting..."}
                                    </p>
                                </div>

                                <div className="pause-control">
                                    <label htmlFor="music-volume">Music Volume</label>
                                    <input
                                        id="music-volume"
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={musicVolume}
                                        onChange={(e) =>
                                            changeMusicVolume(Number(e.target.value))
                                        }
                                    />
                                    <span>{Math.round(musicVolume * 100)}%</span>
                                </div>

                                <div className="pause-control">
                                    <label htmlFor="sfx-volume">SFX Volume</label>
                                    <input
                                        id="sfx-volume"
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={sfxVolume}
                                        onChange={(e) =>
                                            changeSfxVolume(Number(e.target.value))
                                        }
                                    />
                                    <span>{Math.round(sfxVolume * 100)}%</span>
                                </div>

                                <div className="pause-actions">
                                    <button className="pause-action-button" onClick={resumeGame}>
                                        Resume
                                    </button>

                                    <button className="pause-action-button danger" onClick={disconnect}>
                                        Disconnect
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {gameOver && endStats && (
                        <div className="pause-overlay">
                            <div className="pause-card">
                                <h1 className="pause-title">
                                    {endStats.didIWin ? "You Win!" : "Game Over"}
                                </h1>

                                <div className="pause-room-info">
                                    <p>
                                        {endStats.didIWin
                                            ? "You reached Heaven."
                                            : `${endStats.winnerName} won.`}
                                    </p>
                                </div>

                                <div className="pause-control stats-row">
                                    <span>Deaths</span>
                                    <strong>{endStats.deathCount}</strong>
                                </div>

                                <div className="pause-control stats-row">
                                    <span>Jumps Made</span>
                                    <strong>{endStats.jumpsMade}</strong>
                                </div>

                                <div className="pause-control stats-row">
                                    <span>Games Played</span>
                                    <strong>{endStats.gamesPlayed}</strong>
                                </div>

                                <div className="pause-control stats-row">
                                    <span>Games Won</span>
                                    <strong>{endStats.gamesWon}</strong>
                                </div>

                                {endStats.didIWin && (
                                    <div className="pause-control stats-row">
                                        <span>Time Completed</span>
                                        <strong>{endStats.timeCompleted}</strong>
                                    </div>
                                )}

                                <div className="pause-actions">
                                    <button className="pause-action-button" onClick={disconnect}>
                                        Return to Lobby
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}

export default GamePage;