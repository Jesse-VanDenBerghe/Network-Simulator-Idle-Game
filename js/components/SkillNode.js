// SkillNode Component - Individual skill tree node
const SkillNode = {
    name: 'SkillNode',
    props: {
        node: { type: Object, required: true },
        isUnlocked: { type: Boolean, default: false },
        isAvailable: { type: Boolean, default: false },
        isTierLocked: { type: Boolean, default: false },
        canAfford: { type: Boolean, default: false },
        isSelected: { type: Boolean, default: false },
        justUnlocked: { type: Boolean, default: false },
        progressPercent: { type: Number, default: 0 },
        nodeLevel: { type: Number, default: 0 }
    },
    emits: ['select'],
    computed: {
        maxLevel() {
            return this.node.maxLevel || 1;
        },
        showLevel() {
            return this.maxLevel > 1;
        },
        nodeClasses() {
            return {
                node: true,
                [`tier-${this.node.tier}`]: true,
                unlocked: this.isUnlocked,
                available: this.isAvailable && !this.isUnlocked && !this.isTierLocked,
                affordable: this.canAfford && !this.isUnlocked && !this.isTierLocked,
                'tier-locked': this.isTierLocked,
                locked: !this.isUnlocked && (!this.isAvailable || this.isTierLocked),
                selected: this.isSelected,
                'just-unlocked': this.justUnlocked,
                'max-level': this.nodeLevel >= this.maxLevel
            };
        },
        nodeStyle() {
            return {
                left: `${this.node.x}px`,
                top: `${this.node.y}px`
            };
        },
        tierColor() {
            const colors = {
                0: '#00ffaa',
                1: '#00aaff',
                2: '#aa00ff',
                3: '#ff00aa',
                4: '#ffaa00',
                5: '#ff5500',
                6: '#00ffff',
                7: '#ffffff'
            };
            return colors[this.node.tier] || '#00ffaa';
        }
    },
    template: `
        <div 
            :class="nodeClasses"
            :style="nodeStyle"
            @click="$emit('select', node.id)"
        >
            <div v-if="justUnlocked" class="shockwave" :style="{ borderColor: tierColor }"></div>
            <div v-if="justUnlocked" class="shockwave shockwave-2" :style="{ borderColor: tierColor }"></div>
            <span class="node-icon">{{ node.icon }}</span>
            <span class="node-name">{{ node.name }}</span>
            <span v-if="showLevel" class="node-level">{{ nodeLevel }}/{{ maxLevel }}</span>
        </div>
    `
};
