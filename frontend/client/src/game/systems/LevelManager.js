export default class LevelManager {
    constructor(scene, chunks) {
        this.scene = scene;
        this.chunks = chunks;
        this.chunkHeight = 864; // 864px per chunk, five chunks per stage.

        this.levelWidth = 800;
        this.levelHeight = this.chunks.length * this.chunkHeight;

        this.platformLayers = [];

        this.spawnPoint = { x: 400, y: this.levelHeight - 200 };
    }

    create() {
        this.chunks.forEach((chunk, index) => {
            const yOffset = (this.chunks.length - 1 - index) * this.chunkHeight;

            const map = this.scene.make.tilemap({ key: chunk.key });
            const castleTiles   = map.addTilesetImage("castle-tileset", "castle-tiles");
            const hellTiles     = map.addTilesetImage("hell-tileset", "hell-tiles");
            // const decorTiles    = map.addTilesetImage("hazards-tileset", "decor-tiles");

            const allTilesets = [castleTiles, hellTiles].filter(Boolean);

            const backgroundLayer   = map.createLayer("Background-Layer", allTilesets, 0, yOffset);
            const platformLayer     = map.createLayer("Platform-Layer", allTilesets, 0, yOffset);
            const hazardVisualLayer = map.createLayer("Hazard-Visual-Layer", allTilesets, 0, yOffset);
            // const decorLayer        = map.createLayer("Decorations-Layer", allTilesets, 0, yOffset);

            platformLayer.setCollisionByExclusion([-1]);
            backgroundLayer?.setDepth(-5);
            platformLayer?.setDepth(0);
            hazardVisualLayer?.setDepth(1);
            // decorLayer?.setDepth(1);

            this.platformLayers.push(platformLayer);

            const spawnLayer = map.getObjectLayer("SpawnPoints");

            if (spawnLayer) {
                const spawnObject = spawnLayer.objects.find((obj) => {
                    return obj.name === "player-spawn";
                });

                if (spawnObject) {
                    this.spawnPoint = {
                        x: spawnObject.x,
                        y: spawnObject.y + yOffset,
                    };
                }
            }
        });

        this.scene.physics.world.setBounds(0, 0, this.levelWidth, this.levelHeight);
        this.scene.cameras.main.setBounds(0, 0, this.levelWidth, this.levelHeight);
    }

    addPlayerColliders(playerSprite) {
        for (const layer of this.platformLayers) {
            if (!layer) continue;
            this.scene.physics.add.collider(playerSprite, layer);
        }
    }
}