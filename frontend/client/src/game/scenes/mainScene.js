import * as Phaser from "phaser"

export default class MainScene extends Phaser.Scene  {
    player;

    preload(){
        this.load.image("player", "src/assets/hero.png");
    }

    create(){
        this.player = this.add.sprite(1, 1, "player");
        this.physics.add.existing(this.player);
        this.player.body.setVelocity(150, 150);
    }

    update() {
    }
}