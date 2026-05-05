export default class RemotePlayer {
    constructor(scene, x, y, nickname = "RemotePlayer") {
        this.scene = scene;
        this.nickname = nickname;
        this.direction = "right";

        this.sprite = scene.physics.add.sprite(x, y, "player-right");
        this.sprite.setDisplaySize(64, 64);
        this.sprite.body.setAllowGravity(false);
        this.sprite.setDepth(10);

        this.nameText = scene.add.text(x, y - 45, nickname, {
            fontSize: "14px",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 3,
        });

        this.nameText.setOrigin(0.5);
        this.nameText.setDepth(20);

        this.targetX = x;
        this.targetY = y;
        this.sprite.anims.play("idle-right");
    }

    updateState(state) {
        this.targetX = state.x;
        this.targetY = state.y;

        if (state.direction) {
            this.direction = state.direction;
        }

        if (state.animation) {
            if (this.sprite.texture.key !== state.textureKey) {
                this.sprite.setTexture(state.textureKey);
            }

            this.sprite.anims.play(state.animation, true);
        }
    }

    update() {
        this.sprite.x += (this.targetX - this.sprite.x) * 0.25;
        this.sprite.y += (this.targetY - this.sprite.y) * 0.25;

        this.nameText.setPosition(this.sprite.x, this.sprite.y - 45);
    }

    destroy() {
        this.sprite.destroy();
        this.nameText.destroy();
    }
}