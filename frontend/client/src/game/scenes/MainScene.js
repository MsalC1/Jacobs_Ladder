import * as Phaser from "phaser"

// Player
import Player from "../entities/Player"
import PlayerController from "../systems/PlayerController";
import JumpMeter from "../systems/JumpMeter";

// Remote Player
import RemotePlayer from "../entities/RemotePlayer";

// Stages
import { createHellStageOrder } from "../levels/stageConfig";

// Level Manager
import LevelManager from "../systems/LevelManager";

export default class MainScene extends Phaser.Scene  {
    preload(){

        // PLAYER ASSETS
        const playerRight   = new URL("../../assets/PlayerCharacter/spritesheets/player_walking_right.png", import.meta.url).href;
        const playerLeft    = new URL("../../assets/PlayerCharacter/spritesheets/player_walking_left.png", import.meta.url).href;

        const jumpBar       = new URL("../../assets/jumpbar/test_bar_gauge.png", import.meta.url).href;
        const jumpBarBg     = new URL("../../assets/jumpbar/bar_background.png", import.meta.url).href;

        this.load.image("jump-bar", jumpBar);
        this.load.image("jump-bar-bg", jumpBarBg);

        // TILESET IMAGES
        const castle_image_path         = new URL("../../assets/tilesets/castles-tileset.png", import.meta.url).href;
        const dungeon_crawl_image_path  = new URL("../../assets/tilesets/dungeon-tileset.png", import.meta.url).href;
        const hell_image_path           = new URL("../../assets/tilesets/hell-tileset.png", import.meta.url).href;

        this.hellStageChunks = createHellStageOrder();

        for (const chunk of this.hellStageChunks) {
            this.load.tilemapTiledJSON(chunk.key, chunk.path);
        }

        this.load.image("castle-tiles", castle_image_path);
        this.load.image("decor-tiles", dungeon_crawl_image_path);
        this.load.image("hell-tiles", hell_image_path);

        // BACKGROUND
        const background = new URL("../../assets/Locations/HELL.PNG", import.meta.url).href;
        this.load.image("HELL", background);

        // PLAYER ANIMATIONS
        this.load.spritesheet('player-right', playerRight, { frameWidth: 256, frameHeight: 256 });
        this.load.spritesheet('player-left', playerLeft, { frameWidth: 256, frameHeight: 256 });
    }

    create(){
        const bg = this.add.image(400, 2150, "HELL");

        bg.setDisplaySize(800, 4320);
        bg.setDepth(-10);
        
        this.createPlayerAnimations();

        //*******************MAY NEED TO DELETE*****************/

        this.levelManager = new LevelManager(this, this.hellStageChunks);
        this.levelManager.create();

        const spawn = this.levelManager.spawnPoint;

        // Player Creation, Camera and World Collider
        this.player             = new Player(this, spawn.x, spawn.y);
        this.playerController   = new PlayerController(this, this.player);
        this.jumpMeter          = new JumpMeter(this, this.player);

        this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08);  // modify ts

        this.levelManager.addPlayerColliders(this.player.sprite);

        // REMOTE PLAYER AND NETWORK MANAGER
        this.remotePlayers = new Map();

        this.networkManager = this.game.registry.get("networkManager");

        this.networkManager.onPeerLeft = (playerId) => {
            this.removeRemotePlayer(playerId);
        }

        this.networkManager.onPlayerState = (playerId, state) => {
            this.updateRemotePlayer(playerId, state);
        }

        this.networkManager.onPush = (message) => {
            this.handlePushMessage(message);
        }

        // PUSH PLAYERS KEY
        this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        
        // DEBUG KEY
        this.debugGraphics = this.physics.world.createDebugGraphic();
        this.debugGraphics.setVisible(false);
        this.physics.world.drawDebug = false;

        this.input.keyboard.on('keydown-H', () => {

            this.physics.world.drawDebug = !this.physics.world.drawDebug;

            if (!this.physics.world.drawDebug){
                this.debugGraphics.setVisible(false);
            }
            else {
                this.debugGraphics.setVisible(true);
            }

        });
    }

    update(time, delta) {
        this.playerController.update(time, delta);
        this.jumpMeter.update(time, delta);

        for (const remotePlayer of this.remotePlayers.values()) {
            remotePlayer.update();
        }

        if (this.networkManager && this.player) {
            if (!this.lastNetworkSend) this.lastNetworkSend = 0;

            if (time - this.lastNetworkSend > 50) {
                this.lastNetworkSend = time;

                // Sends local player state to networkManager (p2p manager)
                this.networkManager.sendPlayerState({
                    x: this.player.sprite.x,
                    y: this.player.sprite.y,
                    direction: this.player.direction,
                    textureKey: this.player.sprite.texture.key,
                    animation: this.player.sprite.anims.currentAnim?.key || "idle-right",
                });
            }
        }

        // Push Mechanic
        if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
            this.tryPushRemotePlayer();
        }
    }

    createPlayerAnimations() {
        this.anims.create({
            key: 'walk-right',
            frames: this.anims.generateFrameNumbers('player-right', { start: 0, end: 6 }),
            frameRate: 12,
            repeat: -1
        });
        this.anims.create({
            key: 'walk-left',
            frames: this.anims.generateFrameNumbers('player-left', { start: 0, end: 6 }),
            frameRate: 12,
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

    addRemotePlayer(playerId, state) {
        // if the player id already exitst then dont create anything
        if (this.remotePlayers.has(playerId)) return;

        // otherwise create a new player id
        const remotePlayer = new RemotePlayer(
            this,
            state.x,
            state.y,
            state.nickname || "Remote Player"
        );

        this.remotePlayers.set(playerId, remotePlayer);
    }

    updateRemotePlayer(playerId, state) {
        if (!this.remotePlayers.has(playerId)) {
            this.addRemotePlayer(playerId, state);
        }

        const remotePlayer = this.remotePlayers.get(playerId);
        remotePlayer.updateState(state);
    }

    removeRemotePlayer(playerId) {
        const remotePlayer = this.remotePlayers.get(playerId);

        if (!remotePlayer) return;

        remotePlayer.destroy();
        this.remotePlayers.delete(playerId);
    }

    tryPushRemotePlayer() {
        for (const [playerId, remotePlayer] of this.remotePlayers) {
            const touching = this.physics.overlap(
                this.player.sprite,
                remotePlayer.pushZone
            );

            if (!touching) continue;

            const direction = this.player.sprite.x < remotePlayer.sprite.x ? 1 : -1;

            // debug
            console.log("Pushing the remote player with id: ", playerId);

            this.networkManager?.sendPush({
                targetPlayerId: playerId,
                direction,
                forceX: 400,
                forceY: -150, // the remote player might fly up because of this...
            });

            break;
        }
    }

    handlePushMessage(message) {
        const myPlayerId = this.networkManager.socket.id;

        if (message.targetPlayerId !== myPlayerId) return;

        console.log("You have been pushed!");

        this.player.sprite.setVelocityX(message.direction * message.forceX);
        this.player.sprite.setVelocityY(message.forceY);
    }
}