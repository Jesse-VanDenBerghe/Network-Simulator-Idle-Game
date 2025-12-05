<script setup lang="ts">

import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { LayoutEngine, type LayoutNode } from '@network-simulator/shared';
import { useNodeGraphManager } from '@/composables/useNodeGraphManager';
import { buildConnections, generateConnectionPath, type Point } from '@/utils/canvasRenderer';
import NodeVisual from './NodeVisual.vue';

const {
    filteredNodes,
    selectedNode,
    modifiedNodeIds,
    selectNode
} = useNodeGraphManager();

const layoutedNodes = ref<Map<string, LayoutNode & { x: number; y: number }>>(new Map());

const panX = ref(0);
const panY = ref(0);
const zoom = ref(1);

const svgRef = ref<SVGSVGElement | null>(null);
const isDragging = ref(false);
const dragStart = ref<Point>({ x: 0, y: 0 });

const transform = computed(() => {
    return `translate(${panX.value}, ${panY.value}) scale(${zoom.value})`;
});

const visibleNodes = computed(() => {
    return filteredNodes.value
        .map(node => {
            const layoutNode = layoutedNodes.value.get(node.id);
            if (!layoutNode) return null;

            return {
                ...node,
                x: layoutNode.x,
                y: layoutNode.y
            };
        })
        .filter((node): node is NonNullable<typeof node> => node !== null);
});

const connections = computed(() => {
    return buildConnections(visibleNodes.value);
});

function isSelected(nodeId: string): boolean {
    return selectedNode.value?.id === nodeId;
}

function isModified(nodeId: string): boolean {
    return modifiedNodeIds.value.has(nodeId);
}

function getNodeCircleClass(nodeId: string): string {
    let classes = ['node-circle'];

    if (isSelected(nodeId)) classes.push('node-selected');
    if (isModified(nodeId)) classes.push('node-modified');

    return classes.join(' ');
}

function handleWheel(event: WheelEvent) {
    event.preventDefault();

    if (event.ctrlKey) {
        // Pinch-to-zoom: use smaller delta for smoothness
        const zoomSensitivity = 0.002;
        const delta = -event.deltaY * zoomSensitivity;
        zoom.value = Math.max(0.1, Math.min(5, zoom.value + delta));
    } else {
        // Two-finger pan
        panX.value -= event.deltaX;
        panY.value -= event.deltaY;

        const maxPan = 2000;
        panX.value = Math.max(-maxPan, Math.min(maxPan, panX.value));
        panY.value = Math.max(-maxPan, Math.min(maxPan, panY.value));
    }
}

function handleMouseDown(event: MouseEvent) {
    if ((event.target as SVGElement).tagName !== 'svg') return;

    isDragging.value = true;
    dragStart.value = { x: event.clientX - panX.value, y: event.clientY - panY.value };
}

function handleMouseMove(event: MouseEvent) {
    if (!isDragging.value) return

    const newPanX = event.clientX - dragStart.value.x;
    const newPanY = event.clientY - dragStart.value.y;

    const maxPan = 2000;
    panX.value = Math.max(-maxPan, Math.min(maxPan, newPanX));
    panY.value = Math.max(-maxPan, Math.min(maxPan, newPanY));
}

function handleMouseUp() {
    isDragging.value = false;
}

function handleNodeClick(nodeId: string, event: MouseEvent) {
    event.stopPropagation();
    selectNode(nodeId);
}

onMounted(() => {
    const allNodesForLayout = Object.fromEntries(
        Array.from(filteredNodes.value).map(node => [node.id, node])
    );

    const positions = LayoutEngine.calculateLayout(allNodesForLayout);

    layoutedNodes.value = new Map(
        Object.entries(positions).map(([id, node]) => [
            id,
            node as LayoutNode & { x: number; y: number }
        ])
    )

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
});

onBeforeUnmount(() => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
});

</script>

<template>
    <svg
        ref="svgRef"
        view-box="0 0 1600 1200"
        class="node-canvas"
        @wheel="handleWheel"
        @mousedown="handleMouseDown"
    >
        <g :transform="transform">
            <path
                v-for="(conn, index) in connections"
                :key="`${conn.fromNodeId}-${conn.toNodeId}-${index}`"
                :d="generateConnectionPath(conn.from, conn.to)"
                class="connection-line"
                :class="{ 'connection-leveled': conn.requirementLevel !== undefined }"
                fill="none"
            />

            <NodeVisual
                v-for="node in visibleNodes"
                :key="node.id"
                :node="node"
                :is-selected="isSelected(node.id)"
                :is-modified="isModified(node.id)"
                @click="handleNodeClick"
            />
        </g>
    </svg>
</template>

<style scoped>
.node-canvas {
    width: 100%;
    height: 100%;
    background-color: #1a1a1a;
    cursor: grab;
}

.node-canvas:active {
    cursor: grabbing;
}

.connection-line {
    stroke: #666;
    stroke-width: 2;
    pointer-events: none;
}

.connection-leveled {
    stroke: #888;
    stroke-dasharray: 4 2;
}

.node-group {
    cursor: pointer;
}

.node-circle {
    fill: #4CAF50;
    stroke: #2e7d32;
    stroke-width: 2;
    transition: fill 0.2s, stroke 0.2s;
}

.node-circle:hover {
    fill: #66BB6A;
    stroke: #43A047;
}

.node-circle.node-selected {
    stroke: #2196F3;
    stroke-width: 4;
    fill: #4CAF50;
}

.node-circle.node-modified {
    fill: #FF9800;
}

.node-circle.node-selected.node-modified {
    fill: #FF9800;
    stroke: #2196F3;
    stroke-width: 4;
}

.modified-indicator {
    fill: #FF5722;
    pointer-events: none;
}

.node-icon {
    fill: white;
    font-size: 16px;
    text-anchor: middle;
    dominant-baseline: middle;
    pointer-events: none;
    user-select: none;
}
</style>