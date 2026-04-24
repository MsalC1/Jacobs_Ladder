const socket = io("http://localhost:3000");

let player;
let players = {};
let cursors;
let roomCode = null;

function createRoom() {
  const nickname = document.getElementById("nickname").value;

  socket.emit("createRoom", nickname, (code) => {
    roomCode = code;
    alert("Room created: " + code);
    startGame();
  });
}

function joinRoom() {
  const nickname = document.getElementById("nickname").value;
  const code = document.getElementById("roomCode").value;

  socket.emit("joinRoom", { code, nickname }, (res) => {
    if (res.success) {
      roomCode = code;
      startGame();
    } else {
      alert("Failed to join room");
    }
  });
}

function startGame() {
  const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
      default: "arcade",
      arcade: { debug: false }
    },
    scene: {
      preload,
      create,
      update
    }
  };

  new Phaser.Game(config);
}

function preload() {
  this.load.image("player", "https://labs.phaser.io/assets/sprites/phaser-dude.png");
}

function create() {
  cursors = this.input.keyboard.createCursorKeys();

  socket.on("stateUpdate", (serverPlayers) => {
    for (let id in serverPlayers) {
      const data = serverPlayers[id];

      if (!players[id]) {
        players[id] = this.physics.add.sprite(data.x, data.y, "player");
      }

      players[id].setPosition(data.x, data.y);
    }
  });

  player = this.physics.add.sprite(100, 100, "player");
}

function update() {
  if (!roomCode) return;

  let speed = 200;
  let vx = 0;
  let vy = 0;

  if (cursors.left.isDown) vx = -speed;
  if (cursors.right.isDown) vx = speed;
  if (cursors.up.isDown) vy = -speed;
  if (cursors.down.isDown) vy = speed;

  player.setVelocity(vx, vy);

  socket.emit("move", {
    code: roomCode,
    x: player.x,
    y: player.y
  });
}