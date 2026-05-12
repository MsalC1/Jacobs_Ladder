import * as Phaser from "phaser"

// Player
import Player from "../entities/Player"
import PlayerController from "../systems/PlayerController";
import JumpMeter from "../systems/JumpMeter";

// Remote Player
import RemotePlayer from "../entities/RemotePlayer";

// Stages
import { createStageOrder } from "../levels/stageConfig";

// Level Manager
import LevelManager from "../systems/LevelManager";

export default class MainScene extends Phaser.Scene  {
    constructor() {
        super("MainScene");
    }

    preload(){
        // PLAYER ASSETS
        const playerRight   = new URL("../../assets/PlayerCharacter/spritesheets/player_walking_right2.PNG", import.meta.url).href;
        const playerLeft    = new URL("../../assets/PlayerCharacter/spritesheets/player_walking_left2.PNG", import.meta.url).href;

        const jumpBar       = new URL("../../assets/jumpbar/test_bar_gauge.png", import.meta.url).href;
        const jumpBarBg     = new URL("../../assets/jumpbar/bar_background.png", import.meta.url).href;

        this.load.image("jump-bar", jumpBar);
        this.load.image("jump-bar-bg", jumpBarBg);

        // PLAYER SFX
        const walkSFX       = new URL("../../assets/sfx/player-walking.ogg", import.meta.url).href;
        const jumpSFX       = new URL("../../assets/sfx/player-jump.ogg", import.meta.url).href;
        const fallSFX       = new URL("../../assets/sfx/player-falling.ogg", import.meta.url).href;
        const landSFX       = new URL("../../assets/sfx/landing-sfx-light.ogg", import.meta.url).href;
        const hurtSFX       = new URL("../../assets/sfx/player-hurt.ogg", import.meta.url).href;

        this.load.audio("player-walk", walkSFX);
        this.load.audio("player-jump", jumpSFX);
        this.load.audio("player-land", landSFX);
        this.load.audio("player-fall", fallSFX);
        this.load.audio("player-hurt", hurtSFX);

        // TILESET IMAGES
        const castle_image_path         = new URL("../../assets/tilesets/castles-tileset.png", import.meta.url).href;
        const dungeon_crawl_image_path  = new URL("../../assets/tilesets/dungeon-tileset.png", import.meta.url).href;
        const hell_image_path           = new URL("../../assets/tilesets/hell-tileset.png", import.meta.url).href;


        // GAME SEED CHUNK GENERATION
        const roomCode = this.game.registry.get("roomCode") || "DEFAULT_ROOM";

        this.stageChunks = createStageOrder(roomCode);

        for (const chunk of this.stageChunks) {
            this.load.tilemapTiledJSON(chunk.key, chunk.path);
        }

        // console.log("Room seed:", roomCode);
        // console.log("Chunk order:", this.hellStageChunks.map((chunk) => chunk.key));

        this.load.image("castle-tiles", castle_image_path);
        this.load.image("decor-tiles", dungeon_crawl_image_path);
        this.load.image("hell-tiles", hell_image_path);

        // BACKGROUND
        const hellBackground = new URL("../../assets/Locations/HELL.PNG", import.meta.url).href;
        const caveBackground = new URL("../../assets/Locations/CAVE.jpg", import.meta.url).href;
        const oceanBackground = new URL("../../assets/Locations/OCEAN.jpg", import.meta.url).href;

        this.load.image("HELL", hellBackground);
        this.load.image("CAVE", caveBackground);
        this.load.image("OCEAN", oceanBackground);

        // PLAYER ANIMATIONS
        this.load.spritesheet('player-right', playerRight, { frameWidth: 191, frameHeight: 280 });
        this.load.spritesheet('player-left', playerLeft, { frameWidth: 191, frameHeight: 280 });

        // BACKGROUND MUSIC
        const hellTheme = new URL("../../assets/music/a_long_journey.ogg", import.meta.url).href;
        const caveTheme = new URL("../../assets/music/cave.ogg", import.meta.url).href;
        const oceanTheme = new URL("../../assets/music/underwater.ogg", import.meta.url).href;

        this.load.audio("hell-theme", hellTheme);
        this.load.audio("cave-theme", caveTheme);
        this.load.audio("ocean-theme", oceanTheme);
    }

    create(){
        // PLAYER STAT COUNTERS:
        this.deathCount = 0;
        this.jumpsMade = 0;
        this.gameStartTime = this.time.now

        const WALK_VOL = 0.25;
        const JUMP_VOL = 0.45;
        const LAND_VOL = 0.20;
        const FALL_VOL = 0.3;
        const HURT_VOL = 0.2;

        this.createPlayerAnimations();

        // LEVEL CREATION
        this.levelManager = new LevelManager(this, this.stageChunks);
        this.levelManager.create();

        const spawn = this.levelManager.spawnPoint;

        // LEVEL BACKGROUND CREATION
        
        this.createBackgrounds();

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
                volume: WALK_VOL,
            }),

            jump: this.sound.add("player-jump", {
                volume: JUMP_VOL,
            }),

            land: this.sound.add("player-land", {
                volume: LAND_VOL,
            }),

            fall: this.sound.add("player-fall", {
                loop: true,
                volume: FALL_VOL,
            }),
            hurt: this.sound.add("player-hurt",{
                volume: HURT_VOL,
            }),
        };

        this.events.on("player-jump", () => {
            this.jumpsMade++;
            this.playerSounds.jump.play();
        });

        // GET THE MUSIC TO THE GAME REGRESTRY TO COMMUNICATE WITH REACT
        this.game.registry.set("setMusicVolume", (volume) => {
            this.musicVolume = volume;

            if (!this.backgroundMusic) return;

            const currentMusic = this.backgroundMusic[this.currentMusicKey];

            if (currentMusic) {
                currentMusic.setVolume(volume);
            }
        });

        this.game.registry.set("setSfxVolume", (volume) => {
            this.playerSounds.walk.setVolume(volume * WALK_VOL);
            this.playerSounds.jump.setVolume(volume * JUMP_VOL);
            this.playerSounds.land.setVolume(volume * LAND_VOL);
            this.playerSounds.fall.setVolume(volume * FALL_VOL);
            this.playerSounds.hurt.setVolume(volume * HURT_VOL);
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
        this.gameEnded = false;

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

        this.networkManager.onPlayerStatus = (playerId, status) => {
            const remotePlayer = this.remotePlayers.get(playerId);

            if (!remotePlayer) return;

            remotePlayer.setStatus?.(status);
        };

        this.networkManager.onGameEnd = (message) => {
            this.handleGameEnd(message);
        };

        // PUSH PLAYERS KEY
        this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

        // MUSIC CREATION
        this.musicVolume = 0.4;
        this.currentMusicKey = "HELL";

        this.backgroundMusic = {
            HELL: this.sound.add("hell-theme", {
                loop: true,
                volume: this.musicVolume,
            }),

            CAVE: this.sound.add("cave-theme", {
                loop: true,
                volume: 0,
            }),

            OCEAN: this.sound.add("ocean-theme", {
                loop: true,
                volume: 0,
            })
        };

        this.backgroundMusic.HELL.play();

        this.events.once("shutdown", () => {
            if (this.backgroundMusic) {
                for (const music of Object.values(this.backgroundMusic)) {
                    music.stop();
                    music.destroy();
                }
            }
        });
        // PAUSE LOGIC
        this.localPaused = false;

        this.game.registry.set("setLocalPaused", (paused) => {
            this.localPaused = paused;

            if (paused) {
                this.player.sprite.setVelocity(0, 0);
                this.playerSounds.walk?.stop();
                this.playerSounds.fall?.stop();

                this.networkManager?.sendPlayerStatus?.("paused");
            } else {
                this.networkManager?.sendPlayerStatus?.("active");
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
        if (!this.isRespawning && !this.localPaused && !this.gameEnded) {
            this.playerController.update(time, delta);
            this.jumpMeter.update(time, delta);
        }

        this.levelManager.updateCheckpointByHeight(this.player.sprite.y);

        this.updateBackgroundByHeight();

        this.updatePlayerSFX();

        for (const remotePlayer of this.remotePlayers.values()) {
            remotePlayer.update();
        }

        if (this.networkManager && this.player && !this.gameEnded) {
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
        if (!this.gameEnded && Phaser.Input.Keyboard.JustDown(this.interactKey)) {
            this.tryPushRemotePlayer();
        }
    }

    updatePlayerSFX() {
        if (this.isRespawning || this.localPaused || this.gameEnded) {
            this.playerSounds.walk?.stop();
            this.playerSounds.fall?.stop();
            return;
        }

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

        if (!this.playerSounds.hurt.isPlaying) {
            this.playerSounds.hurt.play();
        }

        if (this.playerLives <= 0) {
            this.handlePlayerDeath();
        }
    }

    handlePlayerDeath() {
        if (this.isRespawning) return;

        this.deathCount++;

        this.playerSounds.walk.stop();
        this.playerSounds.fall.stop();

        this.isRespawning = true;
        this.playerInvincible = true;

        this.networkManager?.sendPlayerStatus?.("respawning");

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
        const spawn = this.levelManager.currentCheckpoint || this.levelManager.spawnPoint;
        
        this.playerLives = 3;
        this.livesText.setText(`Lives: ${this.playerLives}`);

        this.player.sprite.setPosition(spawn.x, spawn.y);
        this.player.sprite.setVelocity(0, 0);

        this.player.sprite.body.enable = true;
        this.player.sprite.setVisible(true);
        
        this.respawnText.setVisible(false);

        this.isRespawning = false;

        this.networkManager?.sendPlayerStatus?.("active");

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
        // if (this.gameEnded) return;

        // this.gameWon = true;
        // this.gameEnded = true;

        // this.player.sprite.setVelocity(0, 0);
        // this.player.sprite.body.enable = false;

        // this.playerSounds.walk?.stop();
        // this.playerSounds.fall?.stop();

        // const myName = this.game.registry.get("nickname");

        // // send a signal to p2pmanager
        // this.networkManager?.winGame?.();

        // this.showEndStats(true, myName);

        console.log("reached goal");
    }

    handleGameEnd(message) {
        if (this.gameEnded) return;

        this.gameEnded = true;

        const winner = message.winner || message.username || "Another player";
        const myName = this.game.registry.get("nickname");

        const didIWin = winner == myName;

        this.gameWon = didIWin;

        this.player.sprite.setVelocity(0, 0);
        this.player.sprite.body.enable = false;

        this.playerSounds.walk?.stop();
        this.playerSounds.fall?.stop();
        
        // this.add.text(400, 475, didIWin ? "YOU WIN!" : `${winner} won!`, {
        //     fontSize: didIWin ? "56px" : "42px",
        //     color: "#ffffff",
        //     stroke: "#000000",
        //     strokeThickness: 8,
        //     fontFamily: "Connection",
        //     align: "center",
        // }).setOrigin(0.5) .setScrollFactor(0) .setDepth(500);

        this.showEndStats(didIWin, winner);
    }

    showEndStats(didIWin, winnerName) {
        const elapsedMs = this.time.now - this.gameStartTime;
        const elapsedSeconds = Math.floor(elapsedMs / 1000);

        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = elapsedSeconds % 60;

        const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

        const showGameStats = this.game.registry.get("showGameStats");

        showGameStats?.({
            didIWin,
            winnerName,
            deathCount: this.deathCount,
            jumpsMade: this.jumpsMade,
            timeCompleted: didIWin ? formattedTime : null,
        });
    }

    transitionBackground(nextKey) {
        if (!this.backgrounds) return;
        if (this.currentBackgroundKey === nextKey) return;

        const oldBg = this.backgrounds[this.currentBackgroundKey];
        const newBg = this.backgrounds[nextKey];

        if (!newBg) return;

        this.currentBackgroundKey = nextKey;

        newBg.setAlpha(0);
        newBg.setVisible(true);

        this.tweens.add({
            targets: oldBg,
            alpha: 0,
            duration: 1200,
            ease: "Sine.easeInOut",
        });

        this.tweens.add({
            targets: newBg,
            alpha: 1,
            duration: 1200,
            ease: "Sine.easeInOut"
        });

        this.transitionMusic(nextKey);
    }

    updateBackgroundByHeight() {
        if (!this.levelManager || !this.player) return;

        const playerY = this.player.sprite.y;

        const chunksPerStage = 5;
        const stageHeight = this.levelManager.chunkHeight * chunksPerStage;

        const caveStartY = this.levelManager.levelHeight - stageHeight;
        const oceanStartY = this.levelManager.levelHeight - stageHeight * 2;

        if (playerY <= oceanStartY) {
            this.transitionBackground("OCEAN");
        } else if (playerY <= caveStartY) {
            this.transitionBackground("CAVE");
        } else {
            this.transitionBackground("HELL")
        }
    }

    createBackgrounds() {
        // LEVEL BACKGROUND CREATION
        this.currentBackgroundKey = "HELL";

        const centerX = this.levelManager.levelWidth / 2;
        const centerY = this.levelManager.levelHeight / 2;

        this.backgrounds = {
            HELL: this.add.image(centerX, centerY, "HELL"),
            CAVE: this.add.image(centerX, centerY, "CAVE"),
            OCEAN: this.add.image(centerX, centerY, "OCEAN")
        };

        for (const bg of Object.values(this.backgrounds)) {
            bg.setOrigin(0.5, 1.1);

            const scale = this.levelManager.levelWidth / bg.width;
            bg.setScale(scale);

            bg.setScrollFactor(0.35);
            bg.setDepth(-50);
            bg.setAlpha(0);
        }
        
        this.backgrounds.HELL.setAlpha(1);
    }

    transitionMusic(nextKey) {
        if (!this.backgroundMusic) return;
        if (this.currentMusicKey === nextKey) return;

        const oldMusic = this.backgroundMusic[this.currentMusicKey];
        const newMusic = this.backgroundMusic[nextKey];

        if (!oldMusic || !newMusic) return;

        this.currentMusicKey = nextKey;

        if (!newMusic.isPlaying) {
            newMusic.setVolume(0);
            newMusic.play();
        }

        this.tweens.add({
            targets: oldMusic,
            volume: 0,
            duration: 1200,
            ease: "Sine.easeInOut",
            onComplete: () => {
                oldMusic.stop();
            },
        });

        // Fade in new music
        this.tweens.add({
            targets: newMusic,
            volume: this.musicVolume,
            duration: 1200,
            ease: "Sine.easeInOut",
        });
    }
}