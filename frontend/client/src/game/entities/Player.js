export default class Player {
    constructor(scene, x, y) {
        const WIDTH_PX    = 256;
        const HEIGHT_PX   = 256;

        const SPRITE_WIDTH_PX     = WIDTH_PX * 0.25;  // 64px
        const SPRITE_HEIGHT_PX    = HEIGHT_PX * 0.25; // 64px

        const HITBOX_WIDTH_PX     = WIDTH_PX * 0.25;   // 75px
        const HITBOX_HEIGHT_PX    = HEIGHT_PX * 0.7;   // 410px
        const HITBOX_OFFSET_X_PX  = SPRITE_WIDTH_PX * 1.5;     // 220px
        const HITBOX_OFFSET_Y_PX  = SPRITE_HEIGHT_PX * 1.15;    // 100px

        this.scene = scene;
        this.direction = "right";

        this.sprite = scene.physics.add.sprite(x, y, "player-right");

        // Sprite:
        this.sprite.setDisplaySize(SPRITE_WIDTH_PX, SPRITE_HEIGHT_PX);
        this.sprite.setCollideWorldBounds(true);

        // Hitbox uses the og 512x512 sprite frame coordinates, not the displayed 64x64
        // Hitbox:
        this.sprite.body.setSize(HITBOX_WIDTH_PX, HITBOX_HEIGHT_PX);
        this.sprite.body.setOffset(HITBOX_OFFSET_X_PX, HITBOX_OFFSET_Y_PX);

        this.sprite.anims.play("idle-right");
    }

    setVelocityX(value) {
        this.sprite.setVelocityX(value);
    }

    setVelocityY(value) {
        this.sprite.setVelocityY(value);
    }

    isOnGround() {
        return this.sprite.body.blocked.down;
    }
    
    get gameObject() {
        return this.sprite;
    }

    get x() {
        return this.sprite.x;
    }

    get y() {
        return this.sprite.y;
    }

    playWalkLeft() {
        this.direction = "left";

        if (this.sprite.texture.key !== "player-left"){
            this.sprite.setTexture("player-left");
        }

        this.sprite.anims.play("walk-left", true);
    }

    playWalkRight() {
        this.direction = "right";

        if (this.sprite.texture.key !== "player-right"){
            this.sprite.setTexture("player-right");
        }

        this.sprite.anims.play("walk-right", true);
    }

    playIdle() {
        const idleKey = this.direction === "left" ? "idle-left" : "idle-right"; // if facing left -> idle-left else -> idle-right
        this.sprite.anims.play(idleKey, true);
    }
}