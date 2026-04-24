import * as Phaser from "phaser";
import MainScene from "./scenes/mainScene";

export function createGame(parent) {
    const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent,
        scale: {
            mode: Phaser.Scale.NONE,
        },
        scene: [MainScene],
        physics: {
            default: "arcade",
            arcade: { gravity: { y : 300 } },
        },
    };

    const game = new Phaser.Game(config);

    return game;
}