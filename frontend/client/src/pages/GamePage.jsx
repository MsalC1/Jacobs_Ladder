import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { createGame } from "../game/mainGame";
import P2PManager from "../game/systems/P2PManager";

function GamePage(){
    const gameRef = useRef(null);
    const gameInstanceRef = useRef(null);
    const connectionRef = useRef(null);

    // Adding a pause menu:
    const [isPaused, setIsPaused] = useState(false);
    const [musicVolume, setMusicVolume] = useState(0.4);
    const [sfxVolume, setSfxVolume] = useState(0.5);

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
        // const socket = io("http://localhost:5000");

        // prod
        const socket = io("https://game-backend-cagb.onrender.com/");
        const manager = new P2PManager(socket, roomCode, nickname)

        connectionRef.current = manager;

        const game = createGame(gameRef.current, {
            networkManager: manager,
            nickname,
            roomCode,
        });

        gameInstanceRef.current = game;

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
        <div className="game-and-info-container" style={{display: 'flex', flexDirection: 'column', alignItems:'center'}}>
            <div style={{ position: "relative" }}>
                <div ref={ gameRef } />
                <button 
                    onClick={pauseGame} 
                    style={{
                        position: "absolute",
                        top: "20px",
                        right: "20px",
                        zIndex: 10,
                        }}
                >Pause</button>

                {isPaused && (
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(0, 0, 0, 0.75)",
                            color: "white",
                            zIndex: 20,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "16px",
                        }}
                    >
                        <h1>PAUSED</h1>

                        <div
                            className="game-header"
                            style={{ textAlign: "center", padding: "0px" }}
                        >
                            <p>Room: {roomCode}</p>
                            <p>Players: {players.map((p) => p.nickname).join(", ")}</p>
                        </div>

                        <label>
                            Music Volume
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={musicVolume}
                                onChange={(e) => changeMusicVolume(Number(e.target.value))}
                            />
                        </label>

                        <label>
                            SFX Volume
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={sfxVolume}
                                onChange={(e) => changeSfxVolume(Number(e.target.value))}
                            />
                        </label>

                        <button onClick={resumeGame}>Resume</button>
                        <button onClick={disconnect}>Disconnect</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default GamePage;