import * as Phaser from "phaser";

export default class JumpMeter {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;

        this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.active = false;
        this.value = 0;
        this.direction = 1;
        this.speed = 3;

        this.barWidth = 220;
        this.bar = scene.add.rectangle(0, 0, this.barWidth, 20, 0x222222);
        this.center = scene.add.rectangle(0, 0, 20, 24, 0x00ff00);

        this.arrow = scene.add.triangle(
            0,
            0,
            0, 20,
            10, 0,
            20, 20,
            0xffff00
        );

        this.hide();
    }

    update(time, delta) {
        this.updatePosition();

        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.player.isOnGround()) {
            this.start();
        }

        if (this.active && this.spaceKey.isDown) {
            this.moveArrow(delta);
        }

        if (this.active && Phaser.Input.Keyboard.JustUp(this.spaceKey)) {
            this.releaseJump();
        }
    }

    updatePosition() {
        const meterX = this.player.x;
        const meterY = this.player.y - 55;

        this.bar.setPosition(meterX, meterY);
        this.center.setPosition(meterX, meterY);
        this.arrow.y = meterY - 30;

        if (!this.active) {
            this.arrow.x = meterX - this.barWidth / 2;
        }
    }

    start() {
        this.active = true;
        this.value = -100;
        this.direction = 1;

        this.show();
    }

    moveArrow(delta) {
        this.value += this.direction * this.speed * (delta / 16);

        if (this.value >= 100) {
            this.value = 100;
            this.direction = -1;
        }

        if (this.value <= -100) {
            this.value = -100;
            this.direction = 1;
        }

        this.arrow.x = this.player.x + this.value;
    }

    releaseJump() {
        const distanceFromCenter = Math.abs(this.value);

        let jumpPower;

        if (distanceFromCenter <= 5) {
            jumpPower = -650;
            console.log("Perfect jump!");
        } else if (distanceFromCenter <= 30) {
            jumpPower = -500;
            console.log("Enhanced jump!");
        } else {
            jumpPower = -350;
            console.log("Normal jump!");
        }

        this.player.setVelocityY(jumpPower);

        this.active = false;
        this.hide();
    }

    show() {
        this.bar.setVisible(true);
        this.center.setVisible(true);
        this.arrow.setVisible(true);
    }

    hide() {
        this.bar.setVisible(false);
        this.center.setVisible(false);
        this.arrow.setVisible(false);
    }
}