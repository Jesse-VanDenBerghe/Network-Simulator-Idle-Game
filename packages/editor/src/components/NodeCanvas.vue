<script setup lang="ts">

import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { allNodes } from '@network-simulator/shared';
import { LayoutEngine, type LayoutNode } from '@network-simulator/shared';

interface Point {
    x: number;
    y: number;
}

interface Connection {
    from: Point;
    to: Point;
}

const nodes = ref<LayoutNode[]>([]);

const panX = ref(0);
const panY = ref(0);
const zoom = ref(1);

const svgRef = ref<SVGSVGElement | null>(null);
const isDragging = ref(false);
const dragStart = ref<Point>({ x: 0, y: 0 });

const transform = computed(() => {
    return `translate(${panX.value}, ${panY.value}) scale(${zoom.value})`;
});

const connections = computed(() => {
    const results: Connection[] = [];

    nodes.value.forEach((node) => {
        node.requires.forEach((req) => {
            const parentId = typeof req === 'string' ? req : req.id;
            const parent = nodes.value.find(n => n.id === parentId);
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

function handleWheel(event: WheelEvent) {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    zoom.value = Math.max(0.1, Math.min(5, zoom.value + delta));
}

function handleMouseDown(event: MouseEvent) {
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

onMounted(() => {
    const layoutedNodes = LayoutEngine.calculateLayout(allNodes);
    nodes.value = Object.values(layoutedNodes) as Array<LayoutNode & { x: number; y: number }>;

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
            <line v-for="(conn, index) in connections" :key="index" :x1="conn.from.x" :y1="conn.from.y" :x2="conn.to.x"
                :y2="conn.to.y" class="connection-line" />
            <g v-for="node in nodes" :key="node.id">
                <circle :cx="node.x" :cy="node.y" r="20" fill="#4CAF50" />
                <text :x="node.x" :y="node.y" text-anchor="middle" dominant-baseline="middle">
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
}

.connection-line {
    stroke: #666;
    stroke-width: 2;
}

.node-circle {
    fill: #4CAF50;
    stroke: #2e7d32;
    stroke-width: 2;
}

.node-icon {
    fill: white;
    font-size: 16px;
    pointer-events: none;
    user-select: none;
}

.node-group:hover .node-circle {
    fill: #66BB6A;
    cursor: pointer;
}
</style>