// ActionButton Component - Manual action buttons
const ActionButton = {
    name: 'ActionButton',
    props: {
        icon: { type: String, required: true },
        text: { type: String, required: true },
        value: { type: String, required: true },
        disabled: { type: Boolean, default: false },
        locked: { type: Boolean, default: false }
    },
    emits: ['click'],
    template: `
        <button 
            class="action-btn" 
            :class="{ locked: locked }"
            :disabled="disabled || locked"
            @click="$emit('click')"
        >
            <span class="btn-icon">{{ icon }}</span>
            <span class="btn-text">{{ text }}</span>
            <span class="btn-value">{{ value }}</span>
        </button>
    `
};
