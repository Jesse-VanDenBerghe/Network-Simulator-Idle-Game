// Sidebar Component - Contains actions, automations, and stats
const Sidebar = {
    name: 'Sidebar',
    components: {
        ActionButton,
        AutomationItem,
        AscensionButton,
        ParticleBurst
    },
    props: {
        energyPerClick: { type: Number, required: true },
        dataPerClick: { type: Number, required: true },
        dataUnlocked: { type: Boolean, default: false },
        canProcessData: { type: Boolean, default: false },
        dataGeneration: { type: Object, default: null },
        energyGeneration: { type: Object, default: null },
        crankDisabled: { type: Boolean, default: false },
        automations: { type: Object, required: true },
        effectiveRates: { type: Object, required: true },
        stats: { type: Object, required: true },
        coresEarned: { type: Number, default: 0 },
        highestTierReached: { type: Number, default: 0 }
    },
    emits: ['generate-energy', 'process-data', 'ascend'],
    computed: {
        hasAutomations() {
            return Object.values(this.automations).some(rate => rate > 0);
        },
        automationList() {
            return Object.entries(this.effectiveRates)
                .filter(([_, rate]) => rate > 0)
                .map(([resource, rate]) => ({ resource, rate }));
        },
        dataGenerationProgress() {
            if (this.dataGeneration && this.dataGeneration.active) {
                return this.dataGeneration.progress;
            }
            return null;
        },
        dataButtonValue() {
            if (this.dataGeneration && this.dataGeneration.active) {
                const dg = this.dataGeneration;
                return `+${this.formatNumber(dg.bitsPerTick)} (${dg.energyCost}⚡)`;
            }
            return '+1 (1⚡)';
        },
        energyGenerationProgress() {
            if (this.energyGeneration && this.energyGeneration.active) {
                return this.energyGeneration.progress;
            }
            return null;
        },
        energyButtonText() {
            if (this.crankDisabled) {
                return 'Broken Crank';
            }
            return 'Turn Crank';
        },
        energyButtonValue() {
            if (this.energyGeneration && this.energyGeneration.active) {
                return `+${this.formatNumber(this.energyGeneration.energyPerTick)}/s`;
            }
            return '+' + this.formatNumber(this.energyPerClick);
        }
    },
    template: `
        <aside id="sidebar">
            <div id="manual-actions">
                <h2>Manual Actions</h2>
                <div class="action-wrapper" @click="handleEnergyClick">
                    <ActionButton
                        icon="⚡"
                        :text="energyButtonText"
                        :value="energyButtonValue"
                        :locked="crankDisabled"
                        :progress="energyGenerationProgress"
                    />
                    <ParticleBurst ref="energyParticles" />
                </div>
                <div class="action-wrapper">
                    <ActionButton
                        icon="📊"
                        text="Generating Data"
                        :value="dataButtonValue"
                        :locked="!dataUnlocked"
                        :progress="dataGenerationProgress"
                    />
                </div>
            </div>

            <div id="automations" v-if="hasAutomations">
                <h2>Automations</h2>
                <div id="automation-list">
                    <AutomationItem
                        v-for="auto in automationList"
                        :key="auto.resource"
                        :resource="auto.resource"
                        :rate="auto.rate"
                    />
                </div>
            </div>

            <div id="stats">
                <h2>Statistics</h2>
                <div class="stat">
                    <span>Nodes Unlocked:</span>
                    <span>{{ stats.nodesUnlocked }}</span>
                </div>
                <div class="stat">
                    <span>Total Energy:</span>
                    <span>{{ formatNumber(stats.totalEnergy) }}</span>
                </div>
                <div class="stat">
                    <span>Total Data:</span>
                    <span>{{ formatNumber(stats.totalData) }}</span>
                </div>
            </div>

            <AscensionButton
                :cores-earned="coresEarned"
                :min-tier-reached="highestTierReached"
                @ascend="$emit('ascend')"
            />
        </aside>
    `,
    methods: {
        formatNumber(num) {
            return GameData.formatNumber(Math.floor(num));
        },
        handleEnergyClick(event) {
            if (this.crankDisabled) return;
            this.$emit('generate-energy');
            // Trigger particle burst at click position
            const rect = event.currentTarget.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            this.$refs.energyParticles.burst(x, y, {
                count: 10,
                color: '#00ffaa',
                secondaryColor: '#ffff00',
                spread: 50,
                size: 5
            });
        },
        handleDataClick(event) {
            if (!this.dataUnlocked || !this.canProcessData) return;
            this.$emit('process-data');
            // Trigger particle burst at click position
            const rect = event.currentTarget.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            this.$refs.dataParticles.burst(x, y, {
                count: 10,
                color: '#00aaff',
                secondaryColor: '#aa00ff',
                spread: 50,
                size: 5
            });
        }
    }
};
