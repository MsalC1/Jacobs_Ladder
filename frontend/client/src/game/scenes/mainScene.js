import * as Phaser from "phaser"

export default class MainScene extends Phaser.Scene  {
    player;

    preload(){
        const playerRight = new URL("../../assets/PlayerCharacter/spritesheets/walk-run-facing-right-512px-x-512px-per-frame.png", import.meta.url).href;
        const playerLeft = new URL("../../assets/PlayerCharacter/spritesheets/walk-run-facing-left-512px-x-512px-per-frame.png", import.meta.url).href;

        this.load.spritesheet('player-right', playerRight, { frameWidth: 512, frameHeight: 512 });
        this.load.spritesheet('player-left', playerLeft, { frameWidth: 512, frameHeight: 512 });


    }

    create(){
        this.anims.create({
            key: 'walk-right',
            frames: this.anims.generateFrameNumbers('player-right', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'walk-left',
            frames: this.anims.generateFrameNumbers('player-left', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'idle-right',
            frames: [{ key: 'player-right', frame: 0 }],
            frameRate: 1,
            repeat: -1
        });
        this.anims.create({
            key: 'idle-left',
            frames: [{ key: 'player-left', frame: 0 }],
            frameRate: 1,
            repeat: -1
        });

        this.player = this.physics.add.sprite(400, 400, 'player-right');
        this.player.setDisplaySize(64, 64); // spite size
        // this.player.setBounce(0, 0.1);
        this.player.setCollideWorldBounds(true);

        // Hitbox uses original 512x512 sprite frame coordinates,
        // not the displayed 64x64 size.
        this.player.body.setSize(75, 410);
        this.player.body.setOffset(220, 100);

        this.playerDirection = 'right';
        this.player.anims.play('idle-right');

        this.keys = this.input.keyboard.addKeys("W,A,S,D");
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.jumpMeterActive = false;
        this.jumpMeterValue = 0;      // position in meter
        this.jumpMeterDirection = 1;  // 1 = right, -1 = left
        this.jumpMeterSpeed = 3;

        this.jumpBar = this.add.rectangle(400, 520, 220, 20, 0x222222);
        this.jumpCenter = this.add.rectangle(400, 520, 20, 24, 0x00ff00);
        this.jumpBarX = 400;
        this.jumpBarWidth = 220;

        this.jumpArrow = this.add.triangle(
            this.jumpBarX - this.jumpBarWidth / 2,
            490,
            0, 20, 10, 0, 20, 20,
            0xffff00
        );

        this.jumpBar.setScrollFactor(0);
        this.jumpCenter.setScrollFactor(0);
        this.jumpArrow.setScrollFactor(0);

        this.jumpBar.setVisible(false);
        this.jumpCenter.setVisible(false);
        this.jumpArrow.setVisible(false);
    }

    update(time, delta) {
        const speed = 160;

        const meterX = this.player.x;
        const meterY = this.player.y - 55;

        this.jumpBar.x = meterX;
        this.jumpBar.y = meterY;

        this.jumpCenter.x = meterX;
        this.jumpCenter.y = meterY;

        this.jumpArrow.y = meterY - 30;

        if (this.keys.A.isDown){
            this.player.setVelocityX(-speed);
            this.playerDirection = 'left';
            if (this.player.texture.key !== 'player-left') {
                this.player.setTexture('player-left');
            }
            this.player.anims.play('walk-left', true);
        } else if (this.keys.D.isDown) {
            this.player.setVelocityX(speed);
            this.playerDirection = 'right';
            if (this.player.texture.key !== 'player-right') {
                this.player.setTexture('player-right');
            }
            this.player.anims.play('walk-right', true);
        } else {
            this.player.setVelocityX(0);
            const idleKey = this.playerDirection === 'left' ? 'idle-left' : 'idle-right';
            this.player.anims.play(idleKey, true);
        }

        // Start holding space
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.player.body.blocked.down) {
            this.jumpMeterActive = true;
            this.jumpMeterValue = -100;
            this.jumpMeterDirection = 1;

            this.jumpBar.setVisible(true);
            this.jumpCenter.setVisible(true);
            this.jumpArrow.setVisible(true);
        }

        // While holding space
        if (this.jumpMeterActive && this.spaceKey.isDown) {
            this.jumpMeterValue += this.jumpMeterDirection * this.jumpMeterSpeed * (delta / 16);

            if (this.jumpMeterValue >= 100) {
                this.jumpMeterValue = 100;
                this.jumpMeterDirection = -1;
            }

            if (this.jumpMeterValue <= -100) {
                this.jumpMeterValue = -100;
                this.jumpMeterDirection = 1;
            }
            this.jumpArrow.x = this.player.x + this.jumpMeterValue;
        }

// Release space
        if (this.jumpMeterActive && Phaser.Input.Keyboard.JustUp(this.spaceKey)) {
            const distanceFromCenter = Math.abs(this.jumpMeterValue);

            let jumpPower;

            if (distanceFromCenter <= 5) {
                jumpPower = -650; // perfect jump
                console.log("Perfect jump!");
            } else if (distanceFromCenter <= 30) {
                jumpPower = -500; // enhanced jump
                console.log("Enhanced jump!");
            } else {
                jumpPower = -350; // normal jump
                console.log("Normal jump!");
            }

            this.player.setVelocityY(jumpPower);

            this.jumpMeterActive = false;

            this.jumpBar.setVisible(false);
            this.jumpCenter.setVisible(false);
            this.jumpArrow.setVisible(false);
        }
    }
}