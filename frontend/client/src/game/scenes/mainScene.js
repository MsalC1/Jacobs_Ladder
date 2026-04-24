import * as Phaser from "phaser"

export default class MainScene extends Phaser.Scene  {
    player;

    preload(){
        const player_sprite = "src/assets/PlayerCharacter/spritesheets/stand-facing-right-51p-x-512px.png";
        this.load.image("player", player_sprite);
    }

    create(){
        this.player = this.add.sprite(1, 1, "player");
        this.player.setDisplaySize(64, 64);
        this.physics.add.existing(this.player);
        // this.player.body.setVelocity(150, 150);
        this.player.body.setCollideWorldBounds(true, 1, 1);
    }

    update() {
        this.player.x = this.input.x;
    }
}