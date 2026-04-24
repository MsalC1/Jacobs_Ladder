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
        this.player.setDisplaySize(64, 64);
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(true);
        this.player.body.setSize(48, 48);

        this.playerDirection = 'right';
        this.player.anims.play('idle-right');

        this.keys = this.input.keyboard.addKeys("SPACE,W,A,S,D");
    }

    update() {
        const speed = 160;

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

        if ((this.keys.W.isDown || this.keys.SPACE.isDown) && this.player.body.onFloor()) {
            this.player.setVelocityY(-500);
        }
    }
}