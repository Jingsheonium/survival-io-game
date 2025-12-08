import { WebSocketServer } from 'ws';

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });

// Game state
const players = new Map();
let nextPlayerId = 1;

console.log(`🎮 Game server running on ws://localhost:${PORT}`);

wss.on('connection', (ws) => {
    const playerId = `player_${nextPlayerId++}`;

    // Initialize player
    players.set(playerId, {
        id: playerId,
        x: 3200,
        y: 3200,
        health: 100,
        ws
    });

    console.log(`✅ Player connected: ${playerId} (Total: ${players.size})`);

    // Send initial data to new player
    ws.send(JSON.stringify({
        type: 'init',
        id: playerId
    }));

    // Send current players state
    const playersData = {};
    players.forEach((player, id) => {
        playersData[id] = {
            x: player.x,
            y: player.y,
            health: player.health,
            name: id
        };
    });

    ws.send(JSON.stringify({
        type: 'players',
        players: playersData
    }));

    // Notify other players
    broadcast({
        type: 'playerJoined',
        id: playerId
    }, playerId);

    // Handle messages
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data.toString());
            handleMessage(playerId, message);
        } catch (error) {
            console.error('Failed to parse message:', error);
        }
    });

    // Handle disconnect
    ws.on('close', () => {
        players.delete(playerId);
        console.log(`❌ Player disconnected: ${playerId} (Total: ${players.size})`);

        broadcast({
            type: 'playerLeft',
            id: playerId
        });
    });
});

function handleMessage(playerId, message) {
    const player = players.get(playerId);
    if (!player) return;

    switch (message.type) {
        case 'update':
            // Update player position
            player.x = message.x;
            player.y = message.y;
            player.health = message.health;

            // Broadcast updated positions to all players
            broadcastPlayerStates();
            break;

        case 'worldChange':
            // Broadcast world changes to all players
            broadcast({
                type: 'worldUpdate',
                tileChange: message.tileChange
            });
            break;
    }
}

function broadcast(message, excludeId = null) {
    const data = JSON.stringify(message);
    players.forEach((player, id) => {
        if (id !== excludeId && player.ws.readyState === 1) {
            player.ws.send(data);
        }
    });
}

function broadcastPlayerStates() {
    const playersData = {};
    players.forEach((player, id) => {
        playersData[id] = {
            x: player.x,
            y: player.y,
            health: player.health,
            name: id
        };
    });

    const message = JSON.stringify({
        type: 'players',
        players: playersData
    });

    players.forEach((player) => {
        if (player.ws.readyState === 1) {
            player.ws.send(message);
        }
    });
}

// Heartbeat to clean up dead connections
setInterval(() => {
    players.forEach((player, id) => {
        if (player.ws.readyState !== 1) {
            players.delete(id);
        }
    });
}, 30000); // Every 30 seconds
