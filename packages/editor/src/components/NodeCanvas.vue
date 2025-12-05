<script setup lang="ts">

import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { LayoutEngine, type LayoutNode } from '@network-simulator/shared';
import { useNodeGraphManager } from '@/composables/useNodeGraphManager';

interface Point {
    x: number;
    y: number;
}

interface Connection {
    from: Point;
    to: Point;
}

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
    const results: Connection[] = [];
    const visibleNodeIds = new Set(visibleNodes.value.map(n => n.id));

    visibleNodes.value.forEach((node) => {
        node.requires.forEach((req) => {
            const parentId = typeof req === 'string' ? req : req.id;

            if (!visibleNodeIds.has(parentId)) return;

            const parent = visibleNodes.value.find(n => n.id === parentId);
            if (parent) {
                results.push({
                    from: { x: node.x, y: node.y },
                    to: { x: parent.x, y: parent.y }
                });
            }
        });
    });

    return results;
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
    <svg ref="svgRef" view-box="0 0 1600 1200" class="node-canvas" @wheel="handleWheel" @mousedown="handleMouseDown">
        <g :transform="transform">
            <line v-for="(conn, index) in connections" :key="index" :x1="conn.from.x" :y1="conn.from.y" :x2="conn.to.x"
                :y2="conn.to.y" class="connection-line" />
            <g v-for="node in visibleNodes" :key="node.id" class="node-group" @click="handleNodeClick(node.id, $event)">
                <circle :cx="node.x" :cy="node.y" r="20" :class="getNodeCircleClass(node.id)" />
                <circle v-if="isModified(node.id)" :cx="node.x + 15" :cy="node.y - 15" r="4"
                    class="modified-indicator" />
                <text :x="node.x" :y="node.y" class="node-icon">
                    {{ node.icon }}
                </text>
            </g>
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