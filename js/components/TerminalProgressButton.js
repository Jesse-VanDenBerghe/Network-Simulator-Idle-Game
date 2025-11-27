// TerminalProgressButton Component - Terminal-style progress button for data generation
const TerminalProgressButton = {
    name: 'TerminalProgressButton',
    props: {
        icon: { type: String, default: '📊' },
        label: { type: String, default: 'data' },
        value: { type: String, required: true },
        disabled: { type: Boolean, default: false },
        locked: { type: Boolean, default: false },
        progress: { type: Number, default: null }, // 0-100, null = no progress bar
        barWidth: { type: Number, default: 24 } // Number of characters in progress bar
    },
    emits: ['click'],
    computed: {
        isActive() {
            return this.progress !== null && this.progress >= 0;
        },
        progressBar() {
            if (!this.isActive) {
                // Empty bar when not active
                return '[' + '─'.repeat(this.barWidth) + ']';
            }
            const filled = Math.round((this.progress / 100) * this.barWidth);
            const empty = this.barWidth - filled;
            const filledChars = '█'.repeat(filled);
            const emptyChars = '░'.repeat(empty);
            return '[' + filledChars + emptyChars + ']';
        },
        percentText() {
            if (!this.isActive) return '';
            return Math.round(this.progress) + '%';
        },
        statusText() {
            if (this.locked) return 'LOCKED';
            if (this.isActive) return 'PROCESSING...';
            return 'READY';
        }
    },
    template: `
        <button 
            class="terminal-progress-btn" 
            :class="{ locked: locked, active: isActive }"
            :disabled="disabled || locked"
            @click="$emit('click')"
        >
            <div class="terminal-header">
                <span class="terminal-prompt">$</span>
                <span class="terminal-cmd">./generate</span>
                <span class="terminal-label">--{{ label }}</span>
                <span class="terminal-status" :class="{ processing: isActive }">{{ statusText }}</span>
            </div>
            <div class="terminal-body">
                <div class="terminal-bar-row">
                    <span class="terminal-bar" :class="{ active: isActive }">{{ progressBar }}</span>
                    <span class="terminal-percent" v-if="isActive">{{ percentText }}</span>
                </div>
                <div class="terminal-output">
                    <span class="terminal-value">{{ value }}</span>
                </div>
            </div>
        </button>
    `
};
