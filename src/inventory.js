export class Inventory {
    constructor() {
        this.items = new Map();
        this.isOpen = false;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for crafting buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('craft-btn')) {
                const itemType = e.target.dataset.item;
                this.craftItem(itemType);
            }
        });
    }

    addItem(type, amount = 1) {
        const current = this.items.get(type) || 0;
        this.items.set(type, current + amount);
        this.updateUI();
    }

    removeItem(type, amount = 1) {
        const current = this.items.get(type) || 0;
        if (current >= amount) {
            this.items.set(type, current - amount);
            if (this.items.get(type) === 0) {
                this.items.delete(type);
            }
            this.updateUI();
            return true;
        }
        return false;
    }

    hasItem(type, amount = 1) {
        return (this.items.get(type) || 0) >= amount;
    }

    toggle() {
        this.isOpen = !this.isOpen;
        const overlay = document.getElementById('inventoryOverlay');
        if (overlay) {
            overlay.classList.toggle('hidden', !this.isOpen);
        }
        this.updateUI();
    }

    updateUI() {
        const grid = document.getElementById('inventoryGrid');
        if (!grid) return;

        // Clear grid
        grid.innerHTML = '';

        // Add items
        const itemIcons = {
            wood: '🪵',
            stone: '🪨',
            wall: '🧱',
            floor: '📦'
        };

        const itemTypes = ['wood', 'stone', 'wall', 'floor'];

        for (let i = 0; i < 8; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';

            if (i < itemTypes.length) {
                const itemType = itemTypes[i];
                const count = this.items.get(itemType) || 0;

                if (count > 0) {
                    slot.classList.remove('empty');

                    const icon = document.createElement('div');
                    icon.className = 'item-icon';
                    icon.textContent = itemIcons[itemType] || '❓';

                    const countDiv = document.createElement('div');
                    countDiv.className = 'item-count';
                    countDiv.textContent = count;

                    slot.appendChild(icon);
                    slot.appendChild(countDiv);
                } else {
                    slot.classList.add('empty');
                    const icon = document.createElement('div');
                    icon.className = 'item-icon';
                    icon.style.opacity = '0.3';
                    icon.textContent = itemIcons[itemType] || '❓';
                    slot.appendChild(icon);
                }
            } else {
                slot.classList.add('empty');
            }

            grid.appendChild(slot);
        }

        // Update craft buttons
        this.updateCraftButtons();
    }

    updateCraftButtons() {
        const craftButtons = document.querySelectorAll('.craft-btn');
        craftButtons.forEach(btn => {
            const itemType = btn.dataset.item;
            let canCraft = false;

            if (itemType === 'wall' && this.hasItem('wood', 2)) {
                canCraft = true;
            } else if (itemType === 'floor' && this.hasItem('wood', 1)) {
                canCraft = true;
            }

            btn.disabled = !canCraft;
        });
    }

    craftItem(type) {
        if (type === 'wall' && this.hasItem('wood', 2)) {
            this.removeItem('wood', 2);
            this.addItem('wall', 1);
        } else if (type === 'floor' && this.hasItem('wood', 1)) {
            this.removeItem('wood', 1);
            this.addItem('floor', 1);
        }
    }
}
