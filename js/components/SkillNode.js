// SkillNode Component - Individual skill tree node
const SkillNode = {
    name: 'SkillNode',
    props: {
        node: { type: Object, required: true },
        isUnlocked: { type: Boolean, default: false },
        isAvailable: { type: Boolean, default: false },
        isTierLocked: { type: Boolean, default: false },
        canAfford: { type: Boolean, default: false },
        isSelected: { type: Boolean, default: false }
    },
    emits: ['select'],
    computed: {
        nodeClasses() {
            return {
                node: true,
                [`tier-${this.node.tier}`]: true,
                unlocked: this.isUnlocked,
                available: this.isAvailable && !this.isUnlocked && !this.isTierLocked,
                affordable: this.canAfford && !this.isUnlocked && !this.isTierLocked,
                'tier-locked': this.isTierLocked,
                locked: !this.isUnlocked && (!this.isAvailable || this.isTierLocked),
                selected: this.isSelected
            };
        },
        nodeStyle() {
            return {
                left: `${this.node.x}px`,
                top: `${this.node.y}px`
            };
        }
    },
    template: `
        <div 
            :class="nodeClasses"
            :style="nodeStyle"
            @click="$emit('select', node.id)"
        >
            <span class="node-icon">{{ node.icon }}</span>
            <span class="node-name">{{ node.name }}</span>
        </div>
    `
};
