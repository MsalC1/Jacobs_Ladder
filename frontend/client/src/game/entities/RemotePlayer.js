export default class RemotePlayer {
    constructor(scene, x, y, nickname = "RemotePlayer") {
        const WIDTH_PX    = 191;
        const HEIGHT_PX   = 280;

        const SPRITE_WIDTH_PX     = WIDTH_PX * 0.30;  // 64px
        const SPRITE_HEIGHT_PX    = HEIGHT_PX * 0.30; // 64px
        this.scene = scene;
        this.nickname = nickname;
        this.direction = "right";

        this.sprite = scene.physics.add.sprite(x, y, "player-right");
        this.sprite.setDisplaySize(SPRITE_WIDTH_PX, SPRITE_HEIGHT_PX);
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

        // push hitbox for the remoteplayer:
        this.pushZone = scene.add.zone(x, y, 90, 90);
        scene.physics.add.existing(this.pushZone);

        this.pushZone.body.setAllowGravity(false);
        this.pushZone.body.setImmovable(true);
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
        
        this.pushZone.setPosition(this.sprite.x, this.sprite.y);
    }

    setStatus(status) {
        this.status = status;

        if (status === "paused") {
            this.sprite.setVisible(true);
            this.nameText.setVisible(true);
            this.pushZone.body.enable = true;

            this.nameText.setText(`${this.nickname} (Paused)`);
        } else if (status === "respawning" || status === "dead") {
            this.sprite.setVisible(false);
            this.nameText.setVisible(true);
            this.pushZone.body.enable = false;

            this.nameText.setText(`${this.nickname} (Respawning)`);
        } else {
            this.sprite.setVisible(true);
            this.nameText.setVisible(true);
            this.pushZone.body.enable = true;

            this.nameText.setText(this.nickname);
        }
    }

    destroy() {
        this.sprite.destroy();
        this.nameText.destroy();
        this.pushZone.destroy();
    }
}