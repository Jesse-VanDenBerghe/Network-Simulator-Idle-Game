// ActionButton Component - Manual action buttons
const ActionButton = {
    name: 'ActionButton',
    props: {
        icon: { type: String, required: true },
        text: { type: String, required: true },
        value: { type: String, required: true },
        disabled: { type: Boolean, default: false },
        locked: { type: Boolean, default: false },
        progress: { type: Number, default: null } // 0-100, null = no progress bar
    },
    emits: ['click'],
    computed: {
        showProgress() {
            return this.progress !== null && this.progress >= 0;
        }
    },
    template: `
        <button 
            class="action-btn" 
            :class="{ locked: locked, 'has-progress': showProgress }"
            :disabled="disabled || locked"
            @click="$emit('click')"
        >
            <div v-if="showProgress" class="progress-bar" :style="{ width: progress + '%' }"></div>
            <span class="btn-icon">{{ icon }}</span>
            <span class="btn-text">{{ text }}</span>
            <span class="btn-value">{{ value }}</span>
        </button>
    `
};
