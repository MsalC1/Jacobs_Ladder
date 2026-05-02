import * as Phaser from "phaser";
import MainScene from "./scenes/MainScene";

export function createGame(parent) {
    const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 950,
        parent,
        scale: {
            mode: Phaser.Scale.NONE,
            autoCenter: Phaser.Scale.NO_CENTER,
        },
        scene: [MainScene],
        physics: {
            default: "arcade",
            arcade: { 
                gravity: { y : 1000 },
                fps: 60,
                fixedStep: true,
                debug: true
            },
        },
    };

    const game = new Phaser.Game(config);

    return game;
}