export default class PlayerController {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.speed = 300;

        this.keys = scene.input.keyboard.addKeys("W,A,S,D");
    }

    update() {
        if (this.keys.A.isDown) {
            this.player.setVelocityX(-this.speed);
            this.player.playWalkLeft();
        } else if (this.keys.D.isDown) {
            this.player.setVelocityX(this.speed);
            this.player.playWalkRight();
        } else {
            this.player.setVelocityX(0);
            this.player.playIdle();
        }

        if (this.keys.W.isDown) {
            this.player.setVelocityY(-1000);
        }
    }
}