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

        // PLAYER SFX

        const walkSFX       = new URL("../../assets/sfx/player-walking.ogg", import.meta.url).href;
        const jumpSFX       = new URL("../../assets/sfx/player-jump.ogg", import.meta.url).href;
        const fallSFX       = new URL("../../assets/sfx/player-falling.ogg", import.meta.url).href;
        const landSFX       = new URL("../../assets/sfx/landing-sfx-light.ogg", import.meta.url).href;

        this.load.audio("player-walk", walkSFX);
        this.load.audio("player-jump", jumpSFX);
        this.load.audio("player-land", landSFX);
        this.load.audio("player-fall", fallSFX);

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

        // BACKGROUND MUSIC

        const gameTheme = new URL("../../assets/music/a_long_journey.ogg", import.meta.url).href;
        this.load.audio("game-theme", gameTheme);
    }

    create(){
        // LEVEL BACKGROUND CREATION
        const bg = this.add.image(400, 2150, "HELL");
        bg.setDisplaySize(800, 4320);
        bg.setDepth(-10);
        
        this.createPlayerAnimations();

        // LEVEL CREATION
        this.levelManager = new LevelManager(this, this.hellStageChunks);
        this.levelManager.create();

        const spawn = this.levelManager.spawnPoint;

        // PLAYER CREATION
        this.player             = new Player(this, spawn.x, spawn.y);
        this.playerController   = new PlayerController(this, this.player);
        this.jumpMeter          = new JumpMeter(this, this.player);

        this.wasOnGround = false;
        this.wasFalling = false;

        this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08);

        this.levelManager.addPlayerColliders(this.player.sprite);
        this.levelManager.addPlayerHazardOverlaps(this.player.sprite, this.hitHazard, this);
        this.levelManager.addPlayerGoalOverlaps(this.player.sprite, this.reachGoal, this);

        // PLAYER SFX CREATION:

        this.playerSounds = {
            walk: this.sound.add("player-walk", {
                loop: true,
                volume: 0.25,
            }),

            jump: this.sound.add("player-jump", {
                volume: 0.45,
            }),

            land: this.sound.add("player-land", {
                volume: 0.20,
            }),

            fall: this.sound.add("player-fall", {
                loop: true,
                volume: 0.3,
            }),
        };

        this.events.on("player-jump", () => {
            this.playerSounds.jump.play();
        });

        // BASIC PLAYER HEALTH & DISP UI
        this.playerLives = 3;
        this.playerInvincible = false;

        this.livesText = this.add.text(20, 20, `Lives: ${this.playerLives}`, {
            fontSize: "24px",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 4,
        });

        this.livesText.setScrollFactor(0);
        this.livesText.setDepth(100);

        // RESPAWN STATE
        this.isRespawning = false;

        this.respawnText = this.add.text(400, 475, "", {
            fontSize: "24px",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 6,
        });

        this.respawnText.setOrigin(0.5);
        this.respawnText.setScrollFactor(0);
        this.respawnText.setDepth(200);
        this.respawnText.setVisible(false);

        // REMOTE PLAYER AND NETWORK MANAGER
        this.gameWon = false;
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

        // MUSIC CREATION

        this.backgroundMusic = this.sound.add("game-theme", {
            loop: true,
            volume: 0.4,
        });

        this.backgroundMusic.play();

        this.events.once("shutdown", () => {
            if (this.backgroundMusic) {
                this.backgroundMusic.stop();
                this.backgroundMusic.destroy();
            }
        });
        
        // ***************** DEBUG KEYS DELETE AFTER PROD *****************/
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

        this.input.keyboard.on("keydown-L", () => {
            this.damagePlayer(1);
        });
        // ***************** DEBUG KEYS DELETE AFTER PROD *****************/
    }

    update(time, delta) {
        if (!this.isRespawning) {
            this.playerController.update(time, delta);
            this.jumpMeter.update(time, delta);
        }

        this.updatePlayerSFX();

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

    updatePlayerSFX() {
        const body = this.player.sprite.body;

        const isOnGround = body.blocked.down;
        const isMovingHorizontally = Math.abs(body.velocity.x) > 20;
        const isFalling = body.velocity.y > 250 && !isOnGround;

        if (isOnGround && isMovingHorizontally && !this.isRespawning) {
            if (!this.playerSounds.walk.isPlaying) {
                this.playerSounds.walk.play();
            } 
        } else {
            if (this.playerSounds.walk.isPlaying) {
                this.playerSounds.walk.stop();
            }
        }

        if (!this.wasOnGround && isOnGround) {
            this.playerSounds.land.play();
        }

        if (isFalling && !this.isRespawning) {
            if (!this.playerSounds.fall.isPlaying) {
                this.playerSounds.fall.play();
            }
        } else {
            if (this.playerSounds.fall.isPlaying) {
                this.playerSounds.fall.stop();
            }
        }

        this.wasOnGround = isOnGround;
        this.wasFalling = isFalling;
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
            // console.log("Pushing the remote player with id: ", playerId);

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

        // console.log("You have been pushed!");

        this.player.sprite.setVelocityX(message.direction * message.forceX);
        this.player.sprite.setVelocityY(message.forceY);
    }

    damagePlayer(amount = 1) {
        if (this.isRespawning) return;

        this.playerLives -= amount;

        if (this.playerLives < 0) {
            this.playerLives = 0;
        }

        this.livesText.setText(`Lives: ${this.playerLives}`);

        if (this.playerLives <= 0) {
            this.handlePlayerDeath();
        }
    }

    handlePlayerDeath() {
        if (this.isRespawning) return;

        this.playerSounds.walk.stop();
        this.playerSounds.fall.stop();

        this.isRespawning = true;
        this.playerInvincible = true;

        this.player.sprite.setVelocity(0, 0);
        this.player.sprite.body.enable = false;
        this.player.sprite.setVisible(false);

        let countdown = 3;

        this.respawnText.setText(`Respawning in ${countdown}...`);
        this.respawnText.setVisible(true);

        this.time.addEvent({
            delay: 1000,
            repeat: 2,
            callback: () => {
                countdown--;
                if (countdown > 0) {
                    this.respawnText.setText(`Respawning in ${countdown}...`);
                } else {
                    this.respawnPlayer();
                }
            }
        });
    }

    respawnPlayer() {
        const spawn = this.levelManager.spawnPoint;
        
        this.playerLives = 3;
        this.livesText.setText(`Lives: ${this.playerLives}`);

        this.player.sprite.setPosition(spawn.x, spawn.y);
        this.player.sprite.setVelocity(0, 0);

        this.player.sprite.body.enable = true;
        this.player.sprite.setVisible(true);
        
        this.respawnText.setVisible(false);

        this.isRespawning = false;

        // Spawn Protection
        this.time.delayedCall(1000, () => {
            this.playerInvincible = false;
        });
    }

    hitHazard(playerSprite, hazard) {
        if (this.playerInvincible) return;

        // console.log("Hit Hazard:", hazard.hazardType);
        this.damagePlayer(hazard.damage || 1);

        const direction = playerSprite.x < hazard.x ? -1 : 1;

        playerSprite.setVelocityX(direction * (hazard.knockbackX || 200));
        playerSprite.setVelocityY(hazard.knockbackY || -300); // i.e. 200 and -300 here are default values if there isn't a prop defined

        this.playerInvincible = true;
        

        // add a time delay of 1000ms before turning off Invincibility
        this.time.delayedCall(1000, () => {
            this.playerInvincible = false;
        });
    }

    reachGoal(playerSprite, goal) {
        
        if (this.gameWon === false){
            console.log("Reached Goal!");

            if (this.networkManager) {
                this.networkManager.winGame();
                console.log("message sent to win")
            }
        }

        this.gameWon = true;
        
        // try sending server player win message here?
    }
}