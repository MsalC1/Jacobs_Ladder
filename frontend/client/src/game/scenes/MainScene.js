import * as Phaser from "phaser"

// Player
import Player from "../entities/Player"
import PlayerController from "../systems/PlayerController";
import JumpMeter from "../systems/JumpMeter";

export default class MainScene extends Phaser.Scene  {
    preload(){
        const playerRight   = new URL("../../assets/PlayerCharacter/spritesheets/Character_WalkingRight.png", import.meta.url).href;
        const playerLeft    = new URL("../../assets/PlayerCharacter/spritesheets/Character_WalkingLeft.PNG", import.meta.url).href;

        this.load.image('background', 'assets/Locations/HELL.png');
        this.load.spritesheet('player-right', playerRight, { frameWidth: 185, frameHeight: 240 });
        this.load.spritesheet('player-left', playerLeft, { frameWidth: 180, frameHeight: 240 });
    }

    create(){

        this.add.image(1920, 1080, 'background');

        this.createPlayerAnimations();
        
        this.player             = new Player(this, 400, 400);
        this.playerController   = new PlayerController(this, this.player);
        this.jumpMeter          = new JumpMeter(this, this.player);
    }

    update(time, delta) {
        this.playerController.update(time, delta);
        this.jumpMeter.update(time, delta);
    }

    createPlayerAnimations() {
        this.anims.create({
            key: 'walk-right',
            frames: this.anims.generateFrameNumbers('player-right', { start: 0, end: 9 }),
            frameRate: 13,
            repeat: -1
        });
        this.anims.create({
            key: 'walk-left',
            frames: this.anims.generateFrameNumbers('player-left', { start: 0, end: 9 }),
            frameRate: 13,
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
    }
}