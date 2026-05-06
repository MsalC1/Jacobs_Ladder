import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import { createGame } from "../game/mainGame";
import P2PManager from "../game/systems/P2PManager";

function GamePage(){
    const gameRef = useRef(null);
    const gameInstanceRef = useRef(null);
    const connectionRef = useRef(null);

    //Test
    const location = useLocation();
    const {nickname, roomCode} = location.state || {};

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
            console.log("setting players to current players in room") //debug
            console.log(gotPlayers)
            setPlayers(gotPlayers);
        };

        manager.joinRoom();
        return () => {
            socket.disconnect();

            if (gameInstanceRef.current) {
                gameInstanceRef.current.destroy(true);
                gameInstanceRef.current = null;
            }
        };
    }, []);

    return (
        <div className="game-and-info-container" style={{display: 'flex', flexDirection: 'column', alignItems:'center'}}>
            <div ref={ gameRef } />
            <div className="game-header" style={{textAlign: 'center', padding: '20px'}}>
                <h1>{roomCode}</h1>
                <h1>{players.map((p) => p.nickname).join(", ")}</h1>
            </div>
        </div>
    );
}

export default GamePage;