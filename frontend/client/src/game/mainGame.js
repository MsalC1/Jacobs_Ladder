import * as Phaser from "phaser";
import MainScene from "./scenes/MainScene";

export function createGame(parent) {
    const config = {
        type: Phaser.AUTO,
        width: '50%',
        height: '90%',
        parent,
        scale: {
            mode: Phaser.Scale.NONE,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        scene: [MainScene],
        physics: {
            default: "arcade",
            arcade: { 
                gravity: { y : 600 },
                debug: true
            },
        },
    };

    const game = new Phaser.Game(config);

    return game;
}