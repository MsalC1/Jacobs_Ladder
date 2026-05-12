export default class PlayerController {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;

        this.speed = 250;
        this.friction = 0.90; // fricton coefficient

        this.keys = scene.input.keyboard.addKeys("W,A,S,D");
    }

    update() {
        const body = this.player.sprite.body;

        if (this.keys.A.isDown) {
            this.player.setVelocityX(-this.speed);
            this.player.playWalkLeft();
        } else if (this.keys.D.isDown) {
            this.player.setVelocityX(this.speed);
            this.player.playWalkRight();


        } else {
            body.velocity.x *= this.friction;

            if (Math.abs(body.velocity.x) < 5) {
                this.player.setVelocityX(0);
            }
            this.player.playIdle();
        }



        // if (this.keys.W.isDown) {
        //     this.player.setVelocityY(-1000);
        // }
    }
}