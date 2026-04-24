import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

function GamePage() {
  const gameRef = useRef(null);
  const location = useLocation();
  const { roomCode, nickname } = location.state || {};

  console.log('GamePage loaded with:', { roomCode, nickname });

  useEffect(() => {
    const parent = gameRef.current;
    if (!parent) return;

    import('phaser').then((PhaserModule) => {
      console.log('Phaser imported');
      const Phaser = PhaserModule.default || PhaserModule;

      console.log('Creating game');
      const game = new Phaser.Game({
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent,
        backgroundColor: '#2c3e50',
        physics: {
          default: 'arcade',
          arcade: { gravity: { y: 300 }, debug: false }
        },
        scene: {
          preload: preload,
          create: create,
          update: update
        }
      });

      function preload() {
        console.log('Phaser preload called');
        // Create simple textures using graphics
        const playerGraphics = this.add.graphics();
        playerGraphics.fillStyle(0xff0000); // Red
        playerGraphics.fillRect(0, 0, 32, 48);
        playerGraphics.generateTexture('dude', 32, 48);
        playerGraphics.destroy();

        const groundGraphics = this.add.graphics();
        groundGraphics.fillStyle(0x8B4513); // Brown
        groundGraphics.fillRect(0, 0, 400, 32);
        groundGraphics.generateTexture('ground', 400, 32);
        groundGraphics.destroy();

        const starGraphics = this.add.graphics();
        starGraphics.fillStyle(0xffff00); // Yellow
        starGraphics.fillRect(0, 0, 24, 22);
        starGraphics.generateTexture('star', 24, 22);
        starGraphics.destroy();
      }

      function create() {
        console.log('Phaser create called');
        // Background
        this.add.graphics().fillStyle(0x87CEEB).fillRect(0, 0, 800, 600); // Sky blue

        // Platforms
        this.platforms = this.physics.add.staticGroup();
        // Create platform graphics
        const platformGraphics = this.add.graphics();
        platformGraphics.fillStyle(0x8B4513); // Brown
        platformGraphics.fillRect(0, 0, 400, 32);
        platformGraphics.generateTexture('platform', 400, 32);
        platformGraphics.destroy();

        this.platforms.create(400, 568, 'platform').refreshBody();
        this.platforms.create(600, 400, 'platform');
        this.platforms.create(50, 250, 'platform');
        this.platforms.create(750, 220, 'platform');

        // Player
        const playerGraphics = this.add.graphics();
        playerGraphics.fillStyle(0xFF0000); // Red
        playerGraphics.fillRect(0, 0, 32, 48);
        playerGraphics.generateTexture('player', 32, 48);
        playerGraphics.destroy();

        this.player = this.physics.add.sprite(100, 450, 'dude');
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        this.physics.add.collider(this.player, this.platforms);

        // Power-ups
        const jumpBoostGraphics = this.add.graphics();
        jumpBoostGraphics.fillStyle(0x00FF00); // Green
        jumpBoostGraphics.fillRect(0, 0, 20, 20);
        jumpBoostGraphics.generateTexture('jumpBoost', 20, 20);
        jumpBoostGraphics.destroy();

        const speedBoostGraphics = this.add.graphics();
        speedBoostGraphics.fillStyle(0x0000FF); // Blue
        speedBoostGraphics.fillRect(0, 0, 20, 20);
        speedBoostGraphics.generateTexture('speedBoost', 20, 20);
        speedBoostGraphics.destroy();

        this.jumpBoosts = this.physics.add.group();
        this.jumpBoosts.create(200, 500, 'jumpBoost');
        this.jumpBoosts.create(500, 350, 'jumpBoost');

        this.speedBoosts = this.physics.add.group();
        this.speedBoosts.create(300, 200, 'speedBoost');

        this.physics.add.collider(this.jumpBoosts, this.platforms);
        this.physics.add.collider(this.speedBoosts, this.platforms);
        this.physics.add.overlap(this.player, this.jumpBoosts, collectJumpBoost, null, this);
        this.physics.add.overlap(this.player, this.speedBoosts, collectSpeedBoost, null, this);

        // Spikes (hazards)
        const spikeGraphics = this.add.graphics();
        spikeGraphics.fillStyle(0xFF0000); // Red
        spikeGraphics.fillRect(0, 0, 32, 16);
        spikeGraphics.generateTexture('spike', 32, 16);
        spikeGraphics.destroy();

        this.spikes = this.physics.add.staticGroup();
        this.spikes.create(650, 384, 'spike');
        this.spikes.create(100, 234, 'spike');

        this.physics.add.collider(this.player, this.spikes, hitSpike, null, this);

        // Input
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Score
        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });

        // Add visible text
        this.add.text(400, 300, 'Game Loaded! Use WASD to move', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);

        function collectJumpBoost(player, boost) {
          boost.disableBody(true, true);
          this.playerJumpPower = -450; // Higher jump
          this.time.delayedCall(5000, () => { // Reset after 5 seconds
            this.playerJumpPower = -330;
          });
        }

        function collectSpeedBoost(player, boost) {
          boost.disableBody(true, true);
          this.speedBoostActive = true;
          this.speedBoostTimer = this.time.now + 5000; // 5 seconds
        }

        function hitSpike(player, spike) {
          // Reset player position or end game
          player.setPosition(100, 450);
          this.score = Math.max(0, this.score - 50);
          this.scoreText.setText('Score: ' + this.score);
        }
      }

      function update() {
        // Movement
        if (this.wasd.A.isDown) {
          this.player.setVelocityX(-160);
        } else if (this.wasd.D.isDown) {
          this.player.setVelocityX(160);
        } else {
          this.player.setVelocityX(0);
        }

        if (this.wasd.W.isDown && this.player.body.touching.down) {
          this.player.setVelocityY(this.playerJumpPower);
        }

        // Space for additional action (e.g., boost)
        if (Phaser.Input.Keyboard.JustDown(this.space)) {
          // Add boost logic here
          this.player.setVelocityY(this.playerJumpPower * 1.2); // Slightly higher jump
        }

        // Handle speed boost timer
        if (this.speedBoostActive && this.time.now > this.speedBoostTimer) {
          this.speedBoostActive = false;
        }

        const currentSpeed = this.speedBoostActive ? this.playerSpeed * 1.5 : this.playerSpeed;

        // Update velocity with current speed
        if (this.wasd.A.isDown) {
          this.player.setVelocityX(-currentSpeed);
        } else if (this.wasd.D.isDown) {
          this.player.setVelocityX(currentSpeed);
        } else {
          this.player.setVelocityX(0);
        }
      }

      return () => {
        game.destroy(true);
      };
    });
  }, [roomCode, nickname]);

  return (
    <div style={{ padding: 32, textAlign: 'center', backgroundColor: '#1a1a1a', color: '#e8e8e8', minHeight: '100vh' }}>
      <h1>Game Started!</h1>
      <p>Room: {roomCode}</p>
      <p>Player: {nickname}</p>
      <div ref={gameRef} style={{ width: 800, height: 600, margin: '0 auto' }}></div>
    </div>
  );
}

export default GamePage;