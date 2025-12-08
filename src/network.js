export class Network {
    constructor(game) {
        this.game = game;
        this.ws = null;
        this.connected = false;
        this.playerId = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    connect(serverUrl = 'ws://localhost:8080') {
        try {
            this.ws = new WebSocket(serverUrl);

            this.ws.onopen = () => {
                console.log('Connected to game server');
                this.connected = true;
                this.reconnectAttempts = 0;
                this.updateStatus('Online');

                // Start sending position updates
                this.startPositionUpdates();
            };

            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            };

            this.ws.onclose = () => {
                console.log('Disconnected from game server');
                this.connected = false;
                this.updateStatus('Offline');

                // Try to reconnect
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnectAttempts++;
                    setTimeout(() => this.connect(serverUrl), 3000);
                }
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.updateStatus('Solo Mode');
            };
        } catch (error) {
            console.error('Failed to connect:', error);
            this.updateStatus('Solo Mode');
        }
    }

    handleMessage(data) {
        switch (data.type) {
            case 'init':
                this.playerId = data.id;
                break;

            case 'players':
                // Update all other players
                this.game.otherPlayers.clear();
                Object.entries(data.players).forEach(([id, playerData]) => {
                    if (id !== this.playerId) {
                        this.game.updateOtherPlayer(id, playerData);
                    }
                });
                break;

            case 'playerJoined':
                console.log('Player joined:', data.id);
                break;

            case 'playerLeft':
                this.game.removeOtherPlayer(data.id);
                break;

            case 'worldUpdate':
                // Sync world changes (mining, building)
                if (data.tileChange) {
                    const { x, y, type } = data.tileChange;
                    this.game.world.setTile(x, y, type);
                }
                break;
        }
    }

    startPositionUpdates() {
        setInterval(() => {
            if (this.connected && this.ws.readyState === WebSocket.OPEN) {
                const playerState = this.game.getPlayerState();
                this.send({
                    type: 'update',
                    ...playerState
                });
            }
        }, 50); // 20 times per second
    }

    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }

    sendWorldChange(x, y, type) {
        this.send({
            type: 'worldChange',
            tileChange: { x, y, type }
        });
    }

    updateStatus(status) {
        const statusBadge = document.getElementById('onlineStatus');
        if (statusBadge) {
            const statusText = status === 'Online' ?
                `Online (${this.game.otherPlayers.size + 1} players)` :
                status;
            statusBadge.innerHTML = `<span class="status-dot"></span> ${statusText}`;

            // Update color based on status
            const dot = statusBadge.querySelector('.status-dot');
            if (status === 'Online') {
                statusBadge.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                statusBadge.style.color = '#6ee7b7';
            } else {
                statusBadge.style.borderColor = 'rgba(156, 163, 175, 0.3)';
                statusBadge.style.color = '#9ca3af';
            }
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }
}
