<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import SkillNode from './SkillNode.vue';
import type { Node } from '@/types/node';
import { checkNodeAvailable, checkCanAffordNode, checkTierLocked, checkNodeVisible } from '@/composables/useNodeValidation';

interface Props {
  nodes: Record<string, Node>;
  unlockedNodes: Set<string>;
  unlockedBranches: Set<string>;
  selectedNodeId: string | null;
  resources: Record<string, number>;
  ascensionCount?: number;
  prestigeBonuses: Record<string, unknown> | null;
  lastUnlockedNodeId: string | null;
  nodeLevels?: Record<string, number>;
}

const props = withDefaults(defineProps<Props>(), {
  ascensionCount: 0,
  nodeLevels: () => ({}),
});

const emit = defineEmits<{
  'select-node': [nodeId: string];
}>();

interface TravelingDot {
  id: string;
  fromNode: string;
  toNode: string;
  progress: number;
  startTime: number;
  toUnlocked: boolean;
}

const justUnlockedNodeId = ref<string | null>(null);
const animatingConnections = ref<Set<string>>(new Set());
const glowingConnections = ref<Map<string, number>>(new Map());
const travelingDots = ref<TravelingDot[]>([]);
const nodeProgress = ref<Map<string, number>>(new Map());

// Zoom state
const zoomLevel = ref(1);
const minZoom = 0.25;
const maxZoom = 2;
const zoomStep = 0.05;

const container = ref<HTMLElement | null>(null);
let glowAnimationFrame: number | null = null;
let dotAnimationFrame: number | null = null;
let dotInterval: number | null = null;

watch(
  () => props.lastUnlockedNodeId,
  (newId) => {
    if (newId) {
      triggerUnlockAnimation(newId);
      nodeProgress.value.delete(newId);
    }
  }
);

const connections = computed(() => {
  // Import GameData at runtime
  const GameData = (window as any).GameData;
  return GameData.getConnections().filter(
    (conn: any) =>
      isNodeVisible(props.nodes[conn.from]) && isNodeVisible(props.nodes[conn.to])
  );
});

const nodesList = computed(() => {
  return Object.values(props.nodes).filter((node) => isNodeVisible(node));
});

const isUnlocked = (nodeId: string): boolean => {
  return props.unlockedNodes.has(nodeId);
};

const isAvailable = (node: Node): boolean => {
  return checkNodeAvailable(node, props.unlockedNodes, props.nodeLevels);
};

const canAfford = (node: Node): boolean => {
  return checkCanAffordNode(
    node,
    props.resources,
    { ascensionCount: props.ascensionCount, prestigeBonuses: props.prestigeBonuses },
    props.unlockedNodes,
    props.nodeLevels
  );
};

const isTierLocked = (node: Node): boolean => {
  return checkTierLocked(node, props.unlockedNodes);
};

const isNodeVisible = (node: Node): boolean => {
  return checkNodeVisible(node, props.unlockedNodes, props.unlockedBranches, props.nodeLevels);
};

const isConnectionUnlocked = (connection: any): boolean => {
  return isUnlocked(connection.from) && isUnlocked(connection.to);
};

const selectNode = (nodeId: string) => {
  emit('select-node', nodeId);
};

const triggerUnlockAnimation = (nodeId: string) => {
  justUnlockedNodeId.value = nodeId;

  const node = props.nodes[nodeId];
  if (node?.requires) {
    node.requires.forEach((req) => {
      const parentId = typeof req === 'string' ? req : req.id;
      const connKey = `${parentId}-${nodeId}`;
      animatingConnections.value.add(connKey);

      setTimeout(() => {
        animatingConnections.value.delete(connKey);
      }, 800);
    });
  }

  setTimeout(() => {
    justUnlockedNodeId.value = null;
  }, 1000);
};

const isConnectionAnimating = (conn: any): boolean => {
  if (!conn?.from || !conn?.to) return false;
  const key = `${conn.from}-${conn.to}`;
  return animatingConnections.value.has(key);
};

const getConnectionGradientId = (conn: any): string => {
  if (!conn) return '';
  return `pulse-gradient-${conn.from}-${conn.to}`;
};

const getAnimatingConnections = () => {
  return connections.value.filter((conn) => isConnectionAnimating(conn));
};

const startGlowAnimation = () => {
  let time = 0;
  const animate = () => {
    time += 0.01;
    connections.value.forEach((conn, index) => {
      if (isConnectionUnlocked(conn)) {
        const offset = (time + index * 0.3) % 1;
        glowingConnections.value.set(`${conn.from}-${conn.to}`, offset);
      }
    });
    glowAnimationFrame = requestAnimationFrame(animate);
  };
  animate();
};

const getGlowOffset = (conn: any): number => {
  return glowingConnections.value.get(`${conn.from}-${conn.to}`) || 0;
};

const getGlowGradientId = (conn: any): string => {
  return `glow-gradient-${conn.from}-${conn.to}`;
};

const startDotAnimation = () => {
  dotInterval = window.setInterval(() => {
    spawnDotsFromCore();
  }, 3000);

  const animate = () => {
    const now = Date.now();
    const dotSpeed = 0.5;

    const dotsToSpawn: string[] = [];
    travelingDots.value.forEach((dot) => {
      const elapsed = (now - dot.startTime) / 1000;
      dot.progress = Math.min(elapsed * dotSpeed, 1);

      if (dot.progress >= 1) {
        const toNode = props.nodes[dot.toNode];

        if (toNode && isAvailable(toNode)) {
          const GameData = (window as any).GameData;
          const currentProgress = nodeProgress.value.get(dot.toNode) || 0;
          const scaledCost = GameData.getScaledNodeCost(toNode, {
            ascensionCount: props.ascensionCount,
            prestigeBonuses: props.prestigeBonuses,
          });
          const totalCost = Object.values(scaledCost).reduce((sum: number, cost: any) => sum + cost, 0);
          const progressIncrement = totalCost * 0.01;
          nodeProgress.value.set(dot.toNode, currentProgress + progressIncrement);
        }

        if (isUnlocked(dot.toNode)) {
          dotsToSpawn.push(dot.toNode);
        }
      }
    });

    dotsToSpawn.forEach((nodeId) => {
      spawnDotsFromNode(nodeId);
    });

    travelingDots.value = travelingDots.value.filter((dot) => dot.progress < 1);

    dotAnimationFrame = requestAnimationFrame(animate);
  };
  animate();
};

const spawnDotsFromCore = () => {
  const GameData = (window as any).GameData;
  const coreConnections = connections.value.filter((conn: any) => {
    if (conn.from !== 'old_shed') return false;
    if (isUnlocked(conn.to)) return true;
    return GameData.FEATURE_FLAGS.DOTS_TO_AVAILABLE_NODES && isAvailable(props.nodes[conn.to]);
  });

  coreConnections.forEach((conn: any) => {
    travelingDots.value.push({
      id: `${Date.now()}-${Math.random()}`,
      fromNode: conn.from,
      toNode: conn.to,
      progress: 0,
      startTime: Date.now(),
      toUnlocked: isUnlocked(conn.to),
    });
  });
};

const spawnDotsFromNode = (nodeId: string) => {
  const GameData = (window as any).GameData;
  const outgoingConnections = connections.value.filter((conn: any) => {
    if (conn.from !== nodeId) return false;
    if (!isUnlocked(conn.from)) return false;
    if (isUnlocked(conn.to)) return true;
    return GameData.FEATURE_FLAGS.DOTS_TO_AVAILABLE_NODES && isAvailable(props.nodes[conn.to]);
  });

  const now = Date.now();
  outgoingConnections.forEach((conn: any, index: number) => {
    travelingDots.value.push({
      id: `${now}-${Math.random()}-${index}`,
      fromNode: conn.from,
      toNode: conn.to,
      progress: 0,
      startTime: now,
      toUnlocked: isUnlocked(conn.to),
    });
  });
};

const getDotPosition = (dot: TravelingDot) => {
  const fromNode = props.nodes[dot.fromNode];
  const toNode = props.nodes[dot.toNode];
  if (!fromNode || !toNode) return { x: 0, y: 0 };

  const x = fromNode.x + (toNode.x - fromNode.x) * dot.progress + 40;
  const y = fromNode.y + (toNode.y - fromNode.y) * dot.progress + 40;
  return { x, y };
};

const getNodeProgressPercent = (nodeId: string): number => {
  const node = props.nodes[nodeId];
  if (!node || !isAvailable(node)) return 0;

  const GameData = (window as any).GameData;
  const currentProgress = nodeProgress.value.get(nodeId) || 0;
  const scaledCost = GameData.getScaledNodeCost(node, {
    ascensionCount: props.ascensionCount,
    prestigeBonuses: props.prestigeBonuses,
  });
  const totalCost = Object.values(scaledCost).reduce((sum: number, cost: any) => sum + cost, 0);

  return Math.min((currentProgress / totalCost) * 100, 100);
};

const handleWheel = (event: WheelEvent) => {
  if (event.ctrlKey) {
    event.preventDefault();
    const delta = -event.deltaY * 0.01;
    setZoom(zoomLevel.value + delta, event);
  }
};

const setZoom = (newZoom: number, event: WheelEvent | null = null) => {
  const oldZoom = zoomLevel.value;
  zoomLevel.value = Math.max(minZoom, Math.min(maxZoom, newZoom));

  if (event && container.value) {
    const rect = container.value.getBoundingClientRect();
    const cursorX = event.clientX - rect.left;
    const cursorY = event.clientY - rect.top;

    const scrollX = container.value.scrollLeft;
    const scrollY = container.value.scrollTop;

    const scale = zoomLevel.value / oldZoom;
    container.value.scrollLeft = (scrollX + cursorX) * scale - cursorX;
    container.value.scrollTop = (scrollY + cursorY) * scale - cursorY;
  }
};

const zoomIn = () => {
  setZoom(zoomLevel.value + zoomStep);
};

const zoomOut = () => {
  setZoom(zoomLevel.value - zoomStep);
};

const resetZoom = () => {
  zoomLevel.value = 1;
  nextTick(() => {
    const coreNode = props.nodes.old_shed;
    if (container.value && coreNode) {
      container.value.scrollLeft = coreNode.x - container.value.clientWidth / 2 + 40;
      container.value.scrollTop = coreNode.y - container.value.clientHeight / 2 + 40;
    }
  });
};

onMounted(() => {
  startGlowAnimation();
  startDotAnimation();

  nextTick(() => {
    const coreNode = props.nodes.old_shed;
    if (container.value && coreNode) {
      container.value.scrollLeft = coreNode.x - container.value.clientWidth / 2 + 40;
      container.value.scrollTop = coreNode.y - container.value.clientHeight / 2 + 40;
    }
  });
});

onBeforeUnmount(() => {
  if (glowAnimationFrame) {
    cancelAnimationFrame(glowAnimationFrame);
  }
  if (dotAnimationFrame) {
    cancelAnimationFrame(dotAnimationFrame);
  }
  if (dotInterval) {
    clearInterval(dotInterval);
  }
});
</script>

<template>
  <section id="skill-tree-container" @wheel="handleWheel">
    <div class="zoom-controls">
      <button @click="zoomIn" title="Zoom In">+</button>
      <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
      <button @click="zoomOut" title="Zoom Out">−</button>
      <button @click="resetZoom" title="Reset Zoom">⟲</button>
    </div>
    <div id="skill-tree-wrapper" ref="container">
      <div id="skill-tree" :style="{ transform: 'scale(' + zoomLevel + ')', transformOrigin: '0 0' }">
        <svg id="connections">
          <defs>
            <!-- Glow gradients for flowing effect -->
            <template v-for="conn in connections" :key="'glow-template-' + conn.from + '-' + conn.to">
              <linearGradient
                v-if="isConnectionUnlocked(conn)"
                :id="getGlowGradientId(conn)"
                gradientUnits="userSpaceOnUse"
                :x1="conn.x1"
                :y1="conn.y1"
                :x2="conn.x2"
                :y2="conn.y2"
              >
                <stop :offset="Math.max(0, getGlowOffset(conn) - 0.1)" stop-color="rgba(0, 255, 170, 0)" />
                <stop :offset="getGlowOffset(conn)" stop-color="rgba(0, 255, 255, 0.8)" />
                <stop :offset="Math.min(1, getGlowOffset(conn) + 0.1)" stop-color="rgba(0, 255, 170, 0)" />
              </linearGradient>
            </template>

            <!-- Pulse gradients for unlock animation -->
            <linearGradient
              v-for="conn in connections"
              :key="'grad-' + conn.from + '-' + conn.to"
              :id="getConnectionGradientId(conn)"
              gradientUnits="userSpaceOnUse"
              :x1="conn.x1"
              :y1="conn.y1"
              :x2="conn.x2"
              :y2="conn.y2"
            >
              <stop offset="0%" stop-color="#00ffaa" stop-opacity="0">
                <animate
                  v-if="isConnectionAnimating(conn)"
                  attributeName="offset"
                  values="0;1"
                  dur="0.6s"
                  fill="freeze"
                />
              </stop>
              <stop offset="0%" stop-color="#ffffff" stop-opacity="1">
                <animate
                  v-if="isConnectionAnimating(conn)"
                  attributeName="offset"
                  values="0;1"
                  dur="0.6s"
                  fill="freeze"
                />
              </stop>
              <stop offset="10%" stop-color="#00ffaa" stop-opacity="0">
                <animate
                  v-if="isConnectionAnimating(conn)"
                  attributeName="offset"
                  values="0.1;1.1"
                  dur="0.6s"
                  fill="freeze"
                />
              </stop>
            </linearGradient>
          </defs>

          <!-- Base connection lines -->
          <line
            v-for="(conn, index) in connections"
            :key="index"
            :x1="conn.x1"
            :y1="conn.y1"
            :x2="conn.x2"
            :y2="conn.y2"
            :class="{ unlocked: isConnectionUnlocked(conn), animating: isConnectionAnimating(conn) }"
          />

          <!-- Flowing glow overlay for unlocked connections -->
          <template v-for="conn in connections" :key="'glow-line-' + conn.from + '-' + conn.to">
            <line
              v-if="isConnectionUnlocked(conn) && !isConnectionAnimating(conn)"
              :x1="conn.x1"
              :y1="conn.y1"
              :x2="conn.x2"
              :y2="conn.y2"
              class="connection-glow"
              :stroke="'url(#' + getGlowGradientId(conn) + ')'"
            />
          </template>
          <line
            v-for="conn in getAnimatingConnections()"
            :key="'pulse-' + conn.from + '-' + conn.to"
            :x1="conn.x1"
            :y1="conn.y1"
            :x2="conn.x2"
            :y2="conn.y2"
            class="connection-pulse"
            :stroke="'url(#' + getConnectionGradientId(conn) + ')'"
          />
        </svg>

        <!-- Traveling dots -->
        <div
          v-for="dot in travelingDots"
          :key="dot.id"
          :class="['traveling-dot', { 'to-locked': !dot.toUnlocked }]"
          :style="{
            left: getDotPosition(dot).x + 'px',
            top: getDotPosition(dot).y + 'px',
          }"
        ></div>

        <div id="nodes">
          <SkillNode
            v-for="node in nodesList"
            :key="node.id"
            :node="node"
            :is-unlocked="isUnlocked(node.id)"
            :is-available="isAvailable(node)"
            :is-tier-locked="isTierLocked(node)"
            :can-afford="canAfford(node)"
            :is-selected="selectedNodeId === node.id"
            :just-unlocked="justUnlockedNodeId === node.id"
            :progress-percent="getNodeProgressPercent(node.id)"
            :node-level="nodeLevels[node.id] || 0"
            @select="selectNode"
          />
        </div>
      </div>
    </div>
  </section>
</template>
