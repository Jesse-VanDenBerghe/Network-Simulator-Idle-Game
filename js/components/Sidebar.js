// Sidebar Component - Contains actions, automations, and stats
const Sidebar = {
    name: 'Sidebar',
    components: {
        ActionButton,
        AutomationItem
    },
    props: {
        energyPerClick: { type: Number, required: true },
        dataPerClick: { type: Number, required: true },
        dataUnlocked: { type: Boolean, default: false },
        canProcessData: { type: Boolean, default: false },
        automations: { type: Object, required: true },
        effectiveRates: { type: Object, required: true },
        stats: { type: Object, required: true }
    },
    emits: ['generate-energy', 'process-data'],
    computed: {
        hasAutomations() {
            return Object.values(this.automations).some(rate => rate > 0);
        },
        automationList() {
            return Object.entries(this.effectiveRates)
                .filter(([_, rate]) => rate > 0)
                .map(([resource, rate]) => ({ resource, rate }));
        }
    },
    template: `
        <aside id="sidebar">
            <div id="manual-actions">
                <h2>Manual Actions</h2>
                <ActionButton
                    icon="⚡"
                    text="Generate Energy"
                    :value="'+' + energyPerClick"
                    @click="$emit('generate-energy')"
                />
                <ActionButton
                    icon="📊"
                    text="Process Data"
                    :value="'+' + dataPerClick + ' (costs 5⚡)'"
                    :locked="!dataUnlocked"
                    :disabled="!canProcessData"
                    @click="$emit('process-data')"
                />
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
        </aside>
    `,
    methods: {
        formatNumber(num) {
            return GameData.formatNumber(Math.floor(num));
        }
    }
};
