// InfoPanel Component - Node details and unlock button
const InfoPanel = {
    name: 'InfoPanel',
    props: {
        node: { type: Object, default: null },
        isUnlocked: { type: Boolean, default: false },
        isAvailable: { type: Boolean, default: false },
        isTierLocked: { type: Boolean, default: false },
        tierGate: { type: Object, default: null },
        canAfford: { type: Boolean, default: false },
        resources: { type: Object, required: true },
        unlockedNodes: { type: Set, required: true },
        ascensionCount: { type: Number, default: 0 },
        prestigeBonuses: { type: Object, default: null },
        nodeLevel: { type: Number, default: 0 },
        canUpgrade: { type: Boolean, default: false }
    },
    emits: ['unlock'],
    computed: {
        maxLevel() {
            return this.node?.maxLevel || 1;
        },
        showLevel() {
            return this.maxLevel > 1;
        },
        isMaxLevel() {
            return this.nodeLevel >= this.maxLevel;
        },
        costEntries() {
            if (!this.node || !this.node.cost) return [];
            const scaledCost = GameData.getScaledNodeCost(this.node, this.ascensionCount, this.prestigeBonuses, this.nodeLevel);
            return Object.entries(scaledCost).map(([resource, amount]) => ({
                resource,
                resourceName: resource.charAt(0).toUpperCase() + resource.slice(1),
                amount,
                current: this.resources[resource] || 0,
                affordable: (this.resources[resource] || 0) >= amount
            }));
        },
        requirementEntries() {
            if (!this.node || !this.node.requires) return [];
            return this.node.requires.map(reqId => {
                const reqNode = GameData.nodes[reqId];
                return {
                    id: reqId,
                    name: reqNode ? reqNode.name : reqId,
                    icon: reqNode ? reqNode.icon : '?',
                    met: this.unlockedNodes.has(reqId)
                };
            });
        }
    },
    methods: {
        formatNumber(num) {
            return GameData.formatNumber(Math.floor(num));
        },
        unlock() {
            if (this.node && ((this.isAvailable && this.canAfford) || (this.canUpgrade && this.canAfford))) {
                this.$emit('unlock', this.node.id);
            }
        }
    },
    template: `
        <aside id="info-panel">
            <h2>Node Info</h2>
            <div id="node-details">
                <!-- Placeholder when no node selected -->
                <p v-if="!node" class="placeholder">Click on a node to see details</p>

                <!-- Node details -->
                <template v-else>
                    <div class="node-info-header">
                        <span class="node-info-icon">{{ node.icon }}</span>
                        <div>
                            <div class="node-info-title">{{ node.name }}</div>
                            <div class="node-info-tier">Tier {{ node.tier }}<span v-if="showLevel"> • Level {{ nodeLevel }}/{{ maxLevel }}</span></div>
                        </div>
                    </div>

                    <div class="node-info-section">
                        <h3>Description</h3>
                        <p>{{ node.description }}</p>
                    </div>

                    <div class="node-info-section" v-if="node.effects.description">
                        <h3>Effects</h3>
                        <p>{{ node.effects.description }}</p>
                    </div>

                    <!-- Requirements -->
                    <div class="node-info-section" v-if="requirementEntries.length > 0">
                        <h3>Requires</h3>
                        <ul class="cost-list">
                            <li v-for="req in requirementEntries" :key="req.id">
                                <span>{{ req.icon }} {{ req.name }}</span>
                                <span :class="req.met ? 'affordable' : 'not-affordable'">
                                    {{ req.met ? '✓' : '✗' }}
                                </span>
                            </li>
                        </ul>
                    </div>

                    <!-- Cost (show for unlock or upgrade) -->
                    <div class="node-info-section" v-if="costEntries.length > 0 && !isMaxLevel">
                        <h3>{{ isUnlocked ? 'Upgrade Cost' : 'Cost' }}</h3>
                        <ul class="cost-list">
                            <li v-for="cost in costEntries" :key="cost.resource">
                                <span>{{ cost.resourceName }}</span>
                                <span :class="cost.affordable ? 'affordable' : 'not-affordable'">
                                    {{ formatNumber(cost.current) }} / {{ formatNumber(cost.amount) }}
                                </span>
                            </li>
                        </ul>
                    </div>

                    <!-- Action button -->
                    <div v-if="isUnlocked && isMaxLevel" class="unlocked-badge">✓ Max Level</div>
                    <div v-else-if="isUnlocked && canUpgrade" class="upgrade-section">
                        <button 
                            class="unlock-btn upgrade-btn"
                            :disabled="!canAfford"
                            @click="unlock"
                        >
                            {{ canAfford ? 'Upgrade' : 'Cannot Afford' }}
                        </button>
                    </div>
                    <div v-else-if="isUnlocked" class="unlocked-badge">✓ Unlocked</div>
                    <div v-else-if="isTierLocked" class="locked-badge">
                        🔒 Locked: Unlock {{ tierGate.remaining }} more Tier {{ tierGate.requiredTier }} nodes
                    </div>
                    <button 
                        v-else-if="isAvailable"
                        class="unlock-btn"
                        :disabled="!canAfford"
                        @click="unlock"
                    >
                        {{ canAfford ? 'Unlock' : 'Cannot Afford' }}
                    </button>
                    <button v-else class="unlock-btn" disabled>
                        Requirements Not Met
                    </button>
                </template>
            </div>
        </aside>
    `
};
