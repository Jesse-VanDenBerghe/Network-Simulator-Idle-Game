// Ascension Panel Component - Shows upgrades and statistics
const AscensionPanel = {
    name: 'AscensionPanel',
    props: {
        quantumCores: { type: Number, required: true },
        ascensionCount: { type: Number, required: true },
        purchasedUpgrades: { type: Set, required: true },
        statistics: { type: Object, required: true },
        totalCoresEarned: { type: Number, default: 0 },
        visible: { type: Boolean, default: false }
    },
    emits: ['purchase-upgrade', 'close'],
    data() {
        return {
            selectedTier: 1
        };
    },
    computed: {
        upgradesByTier() {
            return PrestigeData.getUpgradesByTier();
        },
        displayUpgrades() {
            return this.upgradesByTier[this.selectedTier] || [];
        }
    },
    methods: {
        canAfford(upgrade) {
            return this.quantumCores >= upgrade.cost;
        },
        isPurchased(upgradeId) {
            return this.purchasedUpgrades.has(upgradeId);
        },
        canPurchase(upgrade) {
            if (this.isPurchased(upgrade.id)) return false;
            if (!this.canAfford(upgrade)) return false;
            
            // Check requirements
            return upgrade.requires.every(reqId => this.purchasedUpgrades.has(reqId));
        },
        handlePurchase(upgrade) {
            if (!this.canPurchase(upgrade)) return;
            this.$emit('purchase-upgrade', upgrade.id);
        },
        selectTier(tier) {
            this.selectedTier = tier;
        },
        formatNumber(num) {
            return GameData.formatNumber(Math.floor(num));
        },
        formatTime(ms) {
            if (!ms) return 'N/A';
            const seconds = Math.floor(ms / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            
            if (hours > 0) return `${hours}h ${minutes % 60}m`;
            if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
            return `${seconds}s`;
        },
        getUpgradeStatusClass(upgrade) {
            if (this.isPurchased(upgrade.id)) return 'purchased';
            if (this.canPurchase(upgrade)) return 'available';
            return 'locked';
        },
        getRequirementNames(requireIds) {
            return requireIds.map(id => {
                const upgrade = PrestigeData.upgrades[id];
                return upgrade ? upgrade.name : id;
            }).join(', ');
        }
    },
    template: `
        <div id="ascension-panel" v-if="visible" @click.self="$emit('close')">
            <div class="panel-content" @click.stop>
                <div class="panel-header">
                    <h2>🌌 Ascension</h2>
                    <button class="close-button" @click="$emit('close')">✕</button>
                </div>

                <div class="prestige-summary">
                    <div class="prestige-stat">
                        <span class="stat-icon">💎</span>
                        <div class="stat-info">
                            <span class="stat-label">Quantum Cores</span>
                            <span class="stat-value">{{ formatNumber(quantumCores) }}</span>
                        </div>
                    </div>
                    <div class="prestige-stat">
                        <span class="stat-icon">🔄</span>
                        <div class="stat-info">
                            <span class="stat-label">Ascensions</span>
                            <span class="stat-value">{{ ascensionCount }}</span>
                        </div>
                    </div>
                </div>

                <div class="panel-body">
                    <div class="tier-tabs">
                        <button 
                            v-for="tier in [1, 2, 3, 4]" 
                            :key="tier"
                            class="tier-tab"
                            :class="{ active: selectedTier === tier }"
                            @click="selectTier(tier)"
                        >
                            Tier {{ tier }}
                        </button>
                    </div>

                    <div class="upgrades-grid">
                        <div 
                            v-for="upgrade in displayUpgrades" 
                            :key="upgrade.id"
                            class="upgrade-card"
                            :class="getUpgradeStatusClass(upgrade)"
                        >
                            <div class="upgrade-header">
                                <h3 class="upgrade-name">{{ upgrade.name }}</h3>
                                <span class="upgrade-cost">
                                    {{ formatNumber(upgrade.cost) }} 💎
                                </span>
                            </div>
                            <p class="upgrade-description">{{ upgrade.description }}</p>
                            
                            <div class="upgrade-requirements" v-if="upgrade.requires.length > 0">
                                <span class="req-label">Requires:</span>
                                <span class="req-list">
                                    {{ getRequirementNames(upgrade.requires) }}
                                </span>
                            </div>

                            <button 
                                class="purchase-button"
                                :disabled="!canPurchase(upgrade)"
                                @click="handlePurchase(upgrade)"
                            >
                                <span v-if="isPurchased(upgrade.id)">✓ Purchased</span>
                                <span v-else-if="canPurchase(upgrade)">Purchase</span>
                                <span v-else-if="!canAfford(upgrade)">Not enough cores</span>
                                <span v-else>Requirements not met</span>
                            </button>
                        </div>
                    </div>

                    <div class="statistics-section">
                        <h3>Statistics</h3>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <span class="stat-name">Total Cores Earned:</span>
                                <span class="stat-val">{{ formatNumber(totalCoresEarned) }}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-name">Total Nodes Unlocked:</span>
                                <span class="stat-val">{{ formatNumber(statistics.totalNodesEverUnlocked || 0) }}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-name">Total Energy Earned:</span>
                                <span class="stat-val">{{ formatNumber(statistics.totalEnergyEverEarned || 0) }}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-name">Fastest Clear:</span>
                                <span class="stat-val">{{ formatTime(statistics.fastestClear) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
};
