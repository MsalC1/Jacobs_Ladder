import * as Phaser from "phaser"

export default class MainScene extends Phaser.Scene  {
    player;
    platform;

    preload(){
        const path = "src/assets/PlayerCharacter/"
        const player_sprite = path + "spritesheets/stand-facing-right-51p-x-512px.png";
        const platform_sprite = path + "spritesheets/stand-facing-right-51p-x-512px.png";
        this.load.image("player", player_sprite);
    }

    create(){
        this.player = this.add.sprite(1, 1, "player");
        this.player.setDisplaySize(64, 64);
        // this.physics.add.existing(this.player);
        // this.player.body.setVelocity(150, 150);
        this.player.body.setCollideWorldBounds(true, 1, 1);
    }

    update() {
        const speed = 160;

        if (this.keys.A.isDown){
            this.player.setVelocityX(-speed);
        } else if (this.keys.D.isDown) {
            this.player.setVelocityX(speed);
        } else {
            this.player.setVelocityX(0);
        }

        if (this.keys.W.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-330);
        }
    }
}