export default class LevelManager {
    constructor(scene, chunks) {
        this.scene = scene;
        this.chunks = chunks;
        this.chunkHeight = 864; // 864px per chunk, five chunks per stage.

        this.levelWidth = 800;
        this.levelHeight = this.chunks.length * this.chunkHeight;

        this.spawnPoint = { x: 400, y: this.levelHeight - 200 };

        this.platformLayers = [];
        this.hazards = null;

        this.goals = null;
    }

    create() {
        this.hazards = this.scene.physics.add.staticGroup();
        this.goals = this.scene.physics.add.staticGroup();

        this.chunks.forEach((chunk, index) => {
            const yOffset = (this.chunks.length - 1 - index) * this.chunkHeight;

            const map = this.scene.make.tilemap({ key: chunk.key });
            const castleTiles   = map.addTilesetImage("castle-tileset", "castle-tiles");
            const hellTiles     = map.addTilesetImage("hell-tileset", "hell-tiles");
            const decorTiles    = map.addTilesetImage("hazards-tileset", "decor-tiles");

            const allTilesets = [castleTiles, hellTiles, decorTiles].filter(Boolean);

            const backgroundLayer   = map.createLayer("Background-Layer", allTilesets, 0, yOffset);
            const platformLayer     = map.createLayer("Platform-Layer", allTilesets, 0, yOffset);
            const hazardVisualLayer = map.createLayer("Hazard-Visual-Layer", allTilesets, 0, yOffset);
            const decorLayer        = map.createLayer("Decorations-Layer", allTilesets, 0, yOffset);

            platformLayer.setCollisionByExclusion([-1]);
            backgroundLayer?.setDepth(-5);
            platformLayer?.setDepth(0);
            hazardVisualLayer?.setDepth(1);
            decorLayer?.setDepth(-10);

            this.platformLayers.push(platformLayer);

            // Object Layer Handling

            const spawnLayer = map.getObjectLayer("SpawnPoints");
            const hazardsLayer = map.getObjectLayer("Hazards");
            const goalLayer = map.getObjectLayer("Goal");

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

            if (hazardsLayer) {
                hazardsLayer.objects.forEach((obj) => {
                    // Find the type of hazard
                    const typeProp = obj.properties?.find((p) => p.name === "type");
                    const type = typeProp?.value;

                    if (type === "spike") {
                        // Add hitboxes
                        const spike = this.scene.add.zone(
                            obj.x + obj.width / 2,
                            obj.y + obj.height / 2 + yOffset,
                            obj.width,
                            obj.height,
                        );

                        this.scene.physics.add.existing(spike, true);

                        spike.body.setSize(obj.width, obj.height);
                        spike.body.setOffset(0, 0);

                        spike.hazardType = "spike";
                        spike.damage = this.getObjectProperty(obj, "damage", 1);
                        spike.knockbackX = this.getObjectProperty(obj, "knockbackX", 200);
                        spike.knockbackY = this.getObjectProperty(obj, "knockbackY", -300);

                        this.hazards.add(spike);
                    }
                });
            }

            if (goalLayer) {
                const goalObject = goalLayer.objects.find((obj) => {
                    return obj.name === "goal";
                });

                if (goalObject) {
                    const goal = this.scene.add.zone(
                        goalObject.x + goalObject.width / 2,
                        goalObject.y + goalObject.height / 2 + yOffset,
                        goalObject.width,
                        goalObject.height,
                    );

                    this.scene.physics.add.existing(goal, true);

                    goal.body.setSize(goalObject.width, goalObject.height);
                    goal.body.setOffset(0, 0);

                    this.goals.add(goal);
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

    getObjectProperty(obj, name, defaultValue) {
        const prop = obj.properties?.find((p) => p.name === name);
        return prop ? prop.value : defaultValue; // Either return the value of the property if there is one or return a default value.
    }

    addPlayerHazardOverlaps(playerSprite, callback, context) {
        if (!this.hazards) return;

        this.scene.physics.add.overlap(
            playerSprite,
            this.hazards,
            callback,
            null,
            context,
        );
    }

    addPlayerGoalOverlaps(playerSprite, callback, context) {
        if (!this.goals) return;

        this.scene.physics.add.overlap(
            playerSprite,
            this.goals,
            callback,
            null,
            context
        );
    }
}