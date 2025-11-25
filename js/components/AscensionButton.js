// Ascension Button Component
const AscensionButton = {
    name: 'AscensionButton',
    props: {
        coresEarned: { type: Number, required: true },
        minTierReached: { type: Number, required: true }
    },
    emits: ['ascend'],
    computed: {
        canAscend() {
            // Can ascend after reaching Tier 3+
            return this.minTierReached >= 3 && this.coresEarned >= 1;
        }
    },
    methods: {
        handleAscend() {
            if (!this.canAscend) return;
            
            const message = `Ascend and reset your progress?\n\nYou will earn: ${this.coresEarned} Quantum Core${this.coresEarned !== 1 ? 's' : ''}\n\nThis will reset:\n- All resources\n- All unlocked nodes (except Core)\n- All automation\n\nQuantum Cores persist and can be spent on permanent upgrades.`;
            
            if (confirm(message)) {
                this.$emit('ascend');
            }
        },
        formatNumber(num) {
            return GameData.formatNumber(Math.floor(num));
        }
    },
    template: `
        <div id="ascension-section" v-if="minTierReached >= 3">
            <h2>Ascension</h2>
            <button 
                id="ascension-button"
                class="action-button ascension"
                :disabled="!canAscend"
                @click="handleAscend"
                :title="canAscend ? 'Reset for Quantum Cores' : 'Reach Tier 3+ to ascend'"
            >
                <div class="button-content">
                    <span class="button-icon">🌌</span>
                    <span class="button-text">Ascend</span>
                    <span class="button-value">+{{ formatNumber(coresEarned) }} 💎</span>
                </div>
            </button>
            <p class="ascension-hint">Reset progress for permanent upgrades</p>
        </div>
    `
};
