import { useEffect, useRef } from "react";
import { createGame } from "../game/mainGame";

function GamePage(){
    const gameRef = useRef(null);
    useEffect(() => {
        const game = createGame(gameRef.current);

        return () => game.destroy(true);
    }, []);

    return <div ref={ gameRef } />
}

export default GamePage;