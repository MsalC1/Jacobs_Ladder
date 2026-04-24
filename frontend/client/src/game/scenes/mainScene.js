import * as Phaser from "phaser"

export default class MainScene extends Phaser.Scene  {
    player;
    platform;

    preload(){
        const path = "src/assets/PlayerCharacter/"
        const player_sprite = path + "spritesheets/stand-facing-right-51p-x-512px.png";
        const platform_sprite = path + "spritesheets/stand-facing-right-51p-x-512px.png";
        this.load.image("player", player_sprite);
        this.load.image("platform", platform_sprite);
    }

    create(){

        this.platform = this.add.sprite(400, 600, "platform");
        this.platform.setDisplaySize(800, 100);


        this.player = this.physics.add.sprite(1, 1, "player");
        this.player.setDisplaySize(64, 64);
        // this.physics.add.existing(this.player);
        // this.player.body.setVelocity(150, 150);
        this.player.body.setCollideWorldBounds(true, 0, 0);

        this.keys = this.input.keyboard.addKeys("W,A,S,D");
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