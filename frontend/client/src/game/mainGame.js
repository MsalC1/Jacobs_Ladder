import * as Phaser from "phaser";
import MainScene from "./scenes/mainScene";

export function createGame(parent) {
    const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 900,
        parent,
        scale: {
            mode: Phaser.Scale.NONE,
        },
        scene: [MainScene],
        physics: {
            default: "arcade",
            arcade: { gravity: { y : 600 } },
        },
    };

    const game = new Phaser.Game(config);

    return game;
}