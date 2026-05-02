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

        this.barWidth = 100 * 1.5;
        this.barHeight = 40 * 1.5;

        this.bar = scene.add.image(0, 0, "jump-bar");
        this.barBg = scene.add.image(0, 0, "jump-bar-bg");

        this.barBg.setDisplaySize(this.barWidth - 10, this.barHeight - 39);
        this.bar.setDisplaySize(this.barWidth, this.barHeight);

        this.barBg.setDepth(10);
        this.bar.setDepth(12);

        this.arrow = scene.add.rectangle(0, 0, 2, 20, 0xff0000);
        this.arrow.setDepth(11);

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
        this.barBg.setPosition(meterX, meterY);
        this.arrow.y = meterY;

        if (!this.active) {
            this.arrow.x = meterX - this.barWidth / 2;
        }
    }

    start() {
        this.active = true;
        this.value = -this.barWidth / 2;
        this.direction = 1;

        this.show();
    }

    moveArrow(delta) {
        const halfRange = this.barWidth / 2;
        this.value += this.direction * this.speed * (delta / 16);

        if (this.value >= halfRange) {
            this.value = halfRange;
            this.direction = -1;
        }

        if (this.value <= -halfRange) {
            this.value = -halfRange;
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
        this.barBg.setVisible(true);
        this.arrow.setVisible(true);
    }

    hide() {
        this.bar.setVisible(false);
        this.barBg.setVisible(false);
        this.arrow.setVisible(false);
    }
}