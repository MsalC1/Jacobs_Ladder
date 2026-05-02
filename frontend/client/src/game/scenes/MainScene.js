import * as Phaser from "phaser"

// Player
import Player from "../entities/Player"
import PlayerController from "../systems/PlayerController";
import JumpMeter from "../systems/JumpMeter";

export default class MainScene extends Phaser.Scene  {
    preload(){
        const playerRight   = new URL("../../assets/PlayerCharacter/spritesheets/Character_WalkingRight.png", import.meta.url).href;
        const playerLeft    = new URL("../../assets/PlayerCharacter/spritesheets/Character_WalkingLeft.PNG", import.meta.url).href;

        const jumpBar = new URL("../../assets/jumpbar/test_bar_gauge.png", import.meta.url).href;
        const jumpBarBg  = new URL("../../assets/jumpbar/bar_background.png", import.meta.url).href;

        this.load.image("jump-bar", jumpBar);
        this.load.image("jump-bar-bg", jumpBarBg);

 
        // TileSetMap:

        // ******NOTE********
        // Tileset png image must be the same one used in Tiled and must be put in /assets/tilesets
        // The tilepam.tmj goes in the maps folder

        const tile_art_path = new URL("../../assets/tilesets/CastleTiles.png", import.meta.url).href;
        const tilemap_path  = new URL("../../assets/maps/Castle-Tilemap.tmj", import.meta.url).href;

        this.load.image("tiles", tile_art_path);
        this.load.tilemapTiledJSON("map", tilemap_path);

        const background    = new URL("../../assets/Locations/HELL.PNG", import.meta.url).href;

        this.load.image("HELL", background);
        this.load.spritesheet('player-right', playerRight, { frameWidth: 185, frameHeight: 240 });
        this.load.spritesheet('player-left', playerLeft, { frameWidth: 180, frameHeight: 240 });
    }

    create(){
        const bg = this.add.image(400, 2150, "HELL");

        bg.setDisplaySize(800, 4300);
        // bg.setScrollFactor(-10);
        bg.setDepth(-10);
        
        this.createPlayerAnimations();


        const map = this.make.tilemap({ key: "map" });
        const tiles = map.addTilesetImage("Castle-Tileset", "tiles"); // "Test-Hell-Tileset" is the same tileset name as set in Tiled
        const backgroundLayer = map.createLayer("Background-Layer", tiles);
        const platformLayer = map.createLayer("Platform-Layer", tiles, 0, 0); // "Tile Layer 1" is the must name as seen in the .tmj file or else ts wont work.

        platformLayer.setCollisionByExclusion([-1]);
        backgroundLayer.setDepth(-5);

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