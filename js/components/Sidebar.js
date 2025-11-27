// Sidebar Component - Contains actions, automations, and stats
const Sidebar = {
    name: 'Sidebar',
    components: {
        ActionButton,
        AutomationItem,
        AscensionButton,
        ParticleBurst,
        TerminalProgressButton
    },
    props: {
        resourceStats: { type: Object, required: true }, // { energyPerClick, dataPerClick, stats }
        generationState: { type: Object, required: true }, // { dataGeneration, energyGeneration, isCrankDisabled }
        gameStats: { type: Object, required: true } // { automations, effectiveRates, coresEarned, highestTierReached, isDataUnlocked, canProcessData }
    },
    emits: ['generate-energy', 'process-data', 'ascend'],
    computed: {
        hasAutomations() {
            return Object.values(this.gameStats.automations).some(rate => rate > 0);
        },
        automationList() {
            return Object.entries(this.gameStats.effectiveRates)
                .filter(([_, rate]) => rate > 0)
                .map(([resource, rate]) => ({ resource, rate }));
        },
        dataGenerationProgress() {
            if (this.generationState.dataGeneration && this.generationState.dataGeneration.active) {
                return this.generationState.dataGeneration.progress;
            }
            return null;
        },
        dataButtonValue() {
            if (this.generationState.dataGeneration && this.generationState.dataGeneration.active) {
                const dg = this.generationState.dataGeneration;
                return `+${this.formatNumber(dg.bitsPerTick)} (${dg.energyCost}⚡)`;
            }
            return '+1 (1⚡)';
        },
        energyGenerationProgress() {
            if (this.generationState.energyGeneration && this.generationState.energyGeneration.active) {
                return this.generationState.energyGeneration.progress;
            }
            return null;
        },
        energyButtonText() {
            if (this.generationState.isCrankDisabled) {
                return 'Broken Crank';
            }
            return 'Turn Crank';
        },
        energyButtonValue() {
            if (this.generationState.energyGeneration && this.generationState.energyGeneration.active) {
                return `+${this.formatNumber(this.generationState.energyGeneration.energyPerTick)}/s`;
            }
            return '+' + this.formatNumber(this.resourceStats.energyPerClick);
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
                        :locked="generationState.isCrankDisabled"
                        :progress="energyGenerationProgress"
                    />
                    <ParticleBurst ref="energyParticles" />
                </div>
                <div class="action-wrapper" v-if="gameStats.isDataUnlocked">
                    <TerminalProgressButton
                        label="data"
                        :value="dataButtonValue"
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
                    <span>{{ resourceStats.stats.nodesUnlocked }}</span>
                </div>
                <div class="stat">
                    <span>Total Energy:</span>
                    <span>{{ formatNumber(resourceStats.stats.totalEnergy) }}</span>
                </div>
                <div class="stat">
                    <span>Total Data:</span>
                    <span>{{ formatNumber(resourceStats.stats.totalData) }}</span>
                </div>
            </div>

            <AscensionButton
                :cores-earned="gameStats.coresEarned"
                :min-tier-reached="gameStats.highestTierReached"
                @ascend="$emit('ascend')"
            />
        </aside>
    `,
    methods: {
        formatNumber(num) {
            return GameData.formatNumber(Math.floor(num));
        },
        handleEnergyClick(event) {
            if (this.generationState.isCrankDisabled) return;
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
            if (!this.gameStats.isDataUnlocked || !this.gameStats.canProcessData) return;
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
