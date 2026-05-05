import { useEffect, useRef, useState } from "react";
import { useLocation} from "react-router-dom";
import { io } from "socket.io-client";
import { createGame } from "../game/mainGame";
import P2PManager from "../game/systems/P2PManager";

function GamePage(){
    const gameRef = useRef(null);
    const connectionRef = useRef(null);

    //Test
    const location = useLocation();
    const {nickname, roomCode} = location.state;
    const [players, setPlayers] = useState([])

    useEffect(() => {
        console.log("use-effect called") // debug

        // testing
        const socket = io("http://localhost:5000");
        const manager = new P2PManager(socket, roomCode, nickname)
        manager.joinRoom();

        const game = createGame(gameRef.current);

        manager.peerJoined = (gotPlayers) => {
            console.log("setting players to current players in room") //debug
            console.log(gotPlayers)
            setPlayers(prev => {return gotPlayers});
        };
        connectionRef.current = manager;

        return () => {
            console.log("cleaning game and connection")
            if (socket) socket.disconnect();
            if(game) game.destroy(true);
        }

    }, []);

    return (
        <div className="game-and-info-container" style={{display: 'flex', flexDirection: 'column', alignItems:'center'}}>
            <div ref={ gameRef } />
            <div className="game-header" style={{textAlign: 'center', padding: '20px'}}>
                <h1>{roomCode}</h1>
                <h1>{players.join(", ")}</h1>
            </div>
        </div>
    );


}

export default GamePage;