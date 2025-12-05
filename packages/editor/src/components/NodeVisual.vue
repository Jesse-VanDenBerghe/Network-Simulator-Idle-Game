<script setup lang="ts">
import { computed } from 'vue';
import type { Node } from '@network-simulator/shared';


interface Props {
    node: Node & { x: number; y: number };
    isSelected?: boolean;
    isModified?: boolean;
    isFiltered?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    isSelected: false,
    isModified: false,
    isFiltered: true
});

const emit = defineEmits<{
    click: [nodeId: string, event: MouseEvent];
}>();

const branchColors = computed(() => {
    const colors: Record<string, string> = {
        'energy': '#FFB300',
        'computer': '#1E88E5',
    };
    return props.node.branch ? colors[props.node.branch] : '#757575';
});


const tierColors = computed(() => {
    const colors: Record<number, string> = {
        0: '#00ffaa',
        1: '#00aaff',
        2: '#aa00ff',
        3: '#ff00aa',
        4: '#ff5500',
        5: '#ff00ff',
        6: '#ffffff',
        7: '#00ffff',
        8: '#ffd700'
    };
    return colors[props.node.tier] || '#00ffaa';
});

const NODE_RADIUS = 20;
const BADGE_RADIUS = 8;
const BADGE_OFFSET = 16;

const handleClick = (event: MouseEvent) => {
    emit('click', props.node.id, event);
};

</script>

<template>
    <g
        class="node-visual"
        @click="handleClick"
        :class="{ 'node-selected': isSelected }"
        :style="{
            transformOrigin: `${node.x}px ${node.y}px`,
            opacity: isFiltered ? 1 : 0.2
        }"
    >

        <circle
            :cx="node.x"
            :cy="node.y"
            :r="NODE_RADIUS"
            class="node-clickable-area"
            fill="transparent"
        />

        <circle
            :cx="node.x"
            :cy="node.y"
            :r="NODE_RADIUS"
            class="node-border"
            :stroke="branchColors"
            :stroke-width="isSelected ? 4 : 2"
            fill="none"
        />

        <circle
            :cx="node.x"
            :cy="node.y"
            :r="NODE_RADIUS - 3"
            class="node-fill"
            :fill="tierColors"
            opacity="0.3"
        />

        <text
            :x="node.x"
            :y="node.y"
            class="node-icon"
            text-anchor="middle"
            dominant-baseline="middle"
        >
            {{ node.icon }}
        </text>

        <circle
            :cx="node.x + BADGE_OFFSET"
            :cy="node.y - BADGE_OFFSET"
            :r="BADGE_RADIUS"
            class="tier-badge"
            :fill="tierColors"
        />
        <text
            :x="node.x + BADGE_OFFSET"
            :y="node.y - BADGE_OFFSET"
            class="tier-text"
            text-anchor="middle"
            dominant-baseline="middle"
        >
            {{ node.tier }}
        </text>

        <circle
            v-if="isModified"
            :cx="node.x - BADGE_OFFSET"
            :cy="node.y - BADGE_OFFSET"
            :r="5"
            class="modified-indicator"
            fill="#FF5722"
        />

        <text
            :x="node.x"
            :y="node.y + NODE_RADIUS + 12"
            class="node-name"
            text-anchor="middle"
        >
            {{ node.name }}
        </text>
    </g>
</template>

<style scoped>
.node-clickable-area {
    cursor: pointer;
}

.node-visual {
    cursor: pointer;
    transition: transform 0.2s, opacity 0.3s;
}

.node-visual:hover {
    transform: scale(1.05);
}

.node-visual:hover .node-border {
    filter: drop-shadow(0 0 4px currentColor);
    transition: filter 0.2s;
}

.node-border {
    transition: stroke-width 0.2s, stroke 0.2s;
}

.node-fill {
    pointer-events: none;
}

.node-icon {
    fill: white;
    font-size: 16px;
    pointer-events: none;
    user-select: none;
}

.tier-badge {
    stroke: #000;
    stroke-width: 1;
    pointer-events: none;
}

.tier-text {
    fill: #000;
    font-size: 10px;
    font-weight: bold;
    pointer-events: none;
    user-select: none;
}

.modified-indicator {
    stroke: #fff;
    stroke-width: 1;
    pointer-events: none;
}

.node-name {
    fill: #ccc;
    font-size: 11px;
    pointer-events: none;
    user-select: none;
}

.node-selected .node-border, .node-selected .tier-badge {
    filter: drop-shadow(0 0 4px currentColor);
}

.node-selected .node-fill {
    opacity: 0.5;
}
</style>