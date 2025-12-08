export class World {
    constructor() {
        this.tileSize = 64;
        this.worldWidth = 100; // tiles
        this.worldHeight = 100; // tiles
        this.tiles = {};

        // Spawn point
        this.spawnX = this.worldWidth * this.tileSize / 2;
        this.spawnY = this.worldHeight * this.tileSize / 2;

        console.log('World spawn point:', this.spawnX, this.spawnY);

        this.generateWorld();
    }

    generateWorld() {
        // Generate grass base
        for (let x = 0; x < this.worldWidth; x++) {
            for (let y = 0; y < this.worldHeight; y++) {
                this.setTile(x, y, 'grass');
            }
        }

        // Add trees randomly
        for (let i = 0; i < 200; i++) {
            const x = Math.floor(Math.random() * this.worldWidth);
            const y = Math.floor(Math.random() * this.worldHeight);

            // Don't spawn near player
            if (Math.abs(x - this.worldWidth / 2) > 5 || Math.abs(y - this.worldHeight / 2) > 5) {
                this.setTile(x, y, 'tree');
            }
        }

        // Add rocks randomly
        for (let i = 0; i < 150; i++) {
            const x = Math.floor(Math.random() * this.worldWidth);
            const y = Math.floor(Math.random() * this.worldHeight);

            if (Math.abs(x - this.worldWidth / 2) > 5 || Math.abs(y - this.worldHeight / 2) > 5) {
                this.setTile(x, y, 'rock');
            }
        }
    }

    getTileKey(x, y) {
        return `${x},${y}`;
    }

    getTile(x, y) {
        return this.tiles[this.getTileKey(x, y)];
    }

    setTile(x, y, type) {
        const tileData = this.getTileData(type);
        this.tiles[this.getTileKey(x, y)] = {
            type,
            ...tileData
        };
    }

    getTileData(type) {
        const tileTypes = {
            grass: { color: '#10b981', solid: false },
            tree: { color: '#059669', solid: true, resource: 'wood', amount: 3 },
            rock: { color: '#6b7280', solid: true, resource: 'stone', amount: 2 },
            wall: { color: '#78350f', solid: true },
            floor: { color: '#92400e', solid: false }
        };
        return tileTypes[type] || tileTypes.grass;
    }

    mineTile(x, y) {
        const tile = this.getTile(x, y);
        if (!tile || !tile.resource) return null;

        const resource = {
            type: tile.resource,
            amount: tile.amount
        };

        // Replace with grass
        this.setTile(x, y, 'grass');

        return resource;
    }

    placeTile(x, y, type) {
        const tile = this.getTile(x, y);
        if (!tile || tile.solid) return false;

        this.setTile(x, y, type);
        return true;
    }

    render(ctx, camera, canvasWidth, canvasHeight) {
        // Calculate visible tiles
        const startX = Math.floor(camera.x / this.tileSize);
        const startY = Math.floor(camera.y / this.tileSize);
        const endX = Math.ceil((camera.x + canvasWidth) / this.tileSize);
        const endY = Math.ceil((camera.y + canvasHeight) / this.tileSize);

        // Draw tiles
        for (let x = Math.max(0, startX); x < Math.min(this.worldWidth, endX + 1); x++) {
            for (let y = Math.max(0, startY); y < Math.min(this.worldHeight, endY + 1); y++) {
                const tile = this.getTile(x, y);
                if (!tile) continue;

                const screenX = x * this.tileSize;
                const screenY = y * this.tileSize;

                // Draw tile
                ctx.fillStyle = tile.color;
                ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);

                // Draw grid
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.lineWidth = 1;
                ctx.strokeRect(screenX, screenY, this.tileSize, this.tileSize);

                // Draw icons for special tiles
                if (tile.type === 'tree') {
                    ctx.fillStyle = '#064e3b';
                    ctx.font = '32px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('🌲', screenX + this.tileSize / 2, screenY + this.tileSize / 2);
                } else if (tile.type === 'rock') {
                    ctx.fillStyle = '#374151';
                    ctx.font = '32px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('🪨', screenX + this.tileSize / 2, screenY + this.tileSize / 2);
                } else if (tile.type === 'wall') {
                    ctx.fillStyle = '#451a03';
                    ctx.fillRect(screenX + 4, screenY + 4, this.tileSize - 8, this.tileSize - 8);
                }
            }
        }
    }
}
