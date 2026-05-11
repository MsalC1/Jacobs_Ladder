import * as Phaser from "phaser";
import MainScene from "./scenes/MainScene";

export function createGame(parent, gameData) {
    return new Phaser.Game({
        type: Phaser.AUTO,
        width: 800,
        height: 950,
        parent,
        disableVisibilityChange: true,
        scale: {
            mode: Phaser.Scale.NONE,
            autoCenter: Phaser.Scale.NO_CENTER,
        },
        scene: [MainScene],
        physics: {
            default: "arcade",
            arcade: { 
                gravity: { y : 600 },
                fps: 60,
                fixedStep: true,
                debug: false
            },
        },
        callbacks: {
            preBoot: (game) => {
                game.registry.set("networkManager", gameData.networkManager);
                game.registry.set("nickname", gameData.nickname);
                game.registry.set("roomCode", gameData.roomCode);
            }
        }
    });
}