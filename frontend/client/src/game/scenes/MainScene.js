import * as Phaser from "phaser"

// Player
import Player from "../entities/Player"
import PlayerController from "../systems/PlayerController";
import JumpMeter from "../systems/JumpMeter";

export default class MainScene extends Phaser.Scene  {
    preload(){
        const playerRight   = new URL("../../assets/PlayerCharacter/spritesheets/Character_WalkingRight.png", import.meta.url).href;
        const playerLeft    = new URL("../../assets/PlayerCharacter/spritesheets/Character_WalkingLeft.PNG", import.meta.url).href;


        // TileSetMap:
        const tile_art_path = new URL("../../assets/tilesets/Natural.png", import.meta.url).href;
        const tilemap_path  = new URL("../../assets/maps/Hell-Tilemap.tmj", import.meta.url).href;

        this.load.image("tiles", tile_art_path);
        this.load.tilemapTiledJSON("map", tilemap_path);

        const background    = new URL("../../assets/Locations/HELL.PNG", import.meta.url).href;

        this.load.image("HELL", background);
        this.load.spritesheet('player-right', playerRight, { frameWidth: 185, frameHeight: 240 });
        this.load.spritesheet('player-left', playerLeft, { frameWidth: 180, frameHeight: 240 });
    }

    create(){
        const bg = this.add.image(400, -950, "HELL");

        bg.setDisplaySize(800, 4300);
        bg.setScrollFactor(0);
        bg.setDepth(-10);
        
        this.createPlayerAnimations();

        const map = this.make.tilemap({ key: "map" });
        const tiles = map.addTilesetImage("Test-Hell-Tileset", "tiles");
        const platformLayer = map.createLayer("Tile Layer 1", tiles, 0, 0);

        platformLayer.setCollisionByExclusion([-1]);

        // platformLayer.setCollisionBetween(1, 200);

        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        
        this.player             = new Player(this, 400, 400);
        this.playerController   = new PlayerController(this, this.player);
        this.jumpMeter          = new JumpMeter(this, this.player);

        this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08);

        this.physics.add.collider(this.player.sprite, platformLayer);
    }

    update(time, delta) {
        this.playerController.update(time, delta);
        this.jumpMeter.update(time, delta);
    }

    createPlayerAnimations() {
        this.anims.create({
            key: 'walk-right',
            frames: this.anims.generateFrameNumbers('player-right', { start: 0, end: 5 }),
            frameRate: 14,
            repeat: -1
        });
        this.anims.create({
            key: 'walk-left',
            frames: this.anims.generateFrameNumbers('player-left', { start: 0, end: 5 }),
            frameRate: 14,
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