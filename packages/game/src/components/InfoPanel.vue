<script setup lang="ts">
import { computed } from 'vue';
import { formatNumber } from '@network-simulator/shared/utils/formatUtils';
import type { Node } from '@network-simulator/shared/types/node';
import GameData from '@/core/gameData';

interface TierGate {
  requiredTier: number;
  remaining: number;
}

interface Requirement {
  id: string;
  name: string;
  icon: string;
  met: boolean;
  reqLevel?: number;
  currentLevel: number;
}

interface CostEntry {
  resource: string;
  resourceName: string;
  amount: number;
  current: number;
  affordable: boolean;
}

interface Props {
  node: Node | null;
  isUnlocked?: boolean;
  isAvailable?: boolean;
  isTierLocked?: boolean;
  tierGate: TierGate | null;
  canAfford?: boolean;
  resources: Record<string, number>;
  unlockedNodes: Set<string>;
  ascensionCount?: number;
  prestigeBonuses: Record<string, unknown> | null;
  nodeLevel?: number;
  canUpgrade?: boolean;
  nodeLevels?: Record<string, number>;
}

const props = withDefaults(defineProps<Props>(), {
  isUnlocked: false,
  isAvailable: false,
  isTierLocked: false,
  canAfford: false,
  ascensionCount: 0,
  nodeLevel: 0,
  canUpgrade: false,
  nodeLevels: () => ({}),
});

const emit = defineEmits<{
  unlock: [nodeId: string];
}>();

const maxLevel = computed(() => props.node?.maxLevel || 1);
const showLevel = computed(() => maxLevel.value > 1);
const isMaxLevel = computed(() => props.nodeLevel >= maxLevel.value);

const costEntries = computed((): CostEntry[] => {
  if (!props.node?.cost) return [];
  const scaledCost = GameData.getScaledNodeCost(props.node, {
    ascensionCount: props.ascensionCount,
    prestigeBonuses: props.prestigeBonuses,
    currentLevel: props.nodeLevel,
  });
  return Object.entries(scaledCost).map(([resource, amount]) => ({
    resource,
    resourceName: resource.charAt(0).toUpperCase() + resource.slice(1),
    amount: amount as number,
    current: props.resources[resource] || 0,
    affordable: (props.resources[resource] || 0) >= (amount as number),
  }));
});

const requirementEntries = computed((): Requirement[] => {
  if (!props.node?.requires) return [];
  return props.node.requires.map((req) => {
    const reqId = typeof req === 'string' ? req : req.id;
    const reqLevel = typeof req === 'string' ? undefined : req.level;
    const reqNode = GameData.nodes[reqId];
    const currentLevel = props.nodeLevels?.[reqId] || (props.unlockedNodes.has(reqId) ? 1 : 0);
    const levelMet = reqLevel ? currentLevel >= reqLevel : true;
    const unlocked = props.unlockedNodes.has(reqId);
    return {
      id: reqId,
      name: reqNode ? reqNode.name : reqId,
      icon: reqNode ? reqNode.icon : '?',
      met: unlocked && levelMet,
      reqLevel,
      currentLevel: unlocked ? currentLevel : 0,
    };
  });
});

const unlock = () => {
  if (props.node && ((props.isAvailable && props.canAfford) || (props.canUpgrade && props.canAfford))) {
    emit('unlock', props.node.id);
  }
};
</script>

<template>
  <aside id="info-panel">
    <h2>Node Info</h2>
    <div id="node-details">
      <!-- Placeholder when no node selected -->
      <p v-if="!node" class="placeholder">Click on a node to see details</p>

      <!-- Node details -->
      <template v-else>
        <div class="node-info-header">
          <span class="node-info-icon">{{ node.icon }}</span>
          <div>
            <div class="node-info-title">{{ node.name }}</div>
            <div class="node-info-tier">
              Tier {{ node.tier }}<span v-if="showLevel"> • Level {{ nodeLevel }}/{{ maxLevel }}</span>
            </div>
          </div>
        </div>

        <div class="node-info-section">
          <h3>Description</h3>
          <p>{{ node.description }}</p>
        </div>

        <div v-if="node.effects.description" class="node-info-section">
          <h3>Effects</h3>
          <p>{{ node.effects.description }}</p>
        </div>

        <!-- Requirements -->
        <div v-if="requirementEntries.length > 0" class="node-info-section">
          <h3>Requires</h3>
          <ul class="cost-list">
            <li v-for="req in requirementEntries" :key="req.id">
              <span
                >{{ req.icon }} {{ req.name
                }}<template v-if="req.reqLevel"> (Lvl {{ req.currentLevel }}/{{ req.reqLevel }})</template></span
              >
              <span :class="req.met ? 'affordable' : 'not-affordable'">
                {{ req.met ? '✓' : '✗' }}
              </span>
            </li>
          </ul>
        </div>

        <!-- Cost (show for unlock or upgrade) -->
        <div v-if="costEntries.length > 0 && !isMaxLevel" class="node-info-section">
          <h3>{{ isUnlocked ? 'Upgrade Cost' : 'Cost' }}</h3>
          <ul class="cost-list">
            <li v-for="cost in costEntries" :key="cost.resource">
              <span>{{ cost.resourceName }}</span>
              <span :class="cost.affordable ? 'affordable' : 'not-affordable'">
                {{ formatNumber(cost.current) }} / {{ formatNumber(cost.amount) }}
              </span>
            </li>
          </ul>
        </div>

        <!-- Action button -->
        <div v-if="isUnlocked && isMaxLevel" class="unlocked-badge">✓ Max Level</div>
        <div v-else-if="isUnlocked && canUpgrade" class="upgrade-section">
          <button class="unlock-btn upgrade-btn" :disabled="!canAfford" @click="unlock">
            {{ canAfford ? 'Upgrade' : 'Cannot Afford' }}
          </button>
        </div>
        <div v-else-if="isUnlocked" class="unlocked-badge">✓ Unlocked</div>
        <div v-else-if="isTierLocked" class="locked-badge">
          🔒 Locked: Unlock {{ tierGate?.remaining }} more Tier {{ tierGate?.requiredTier }} nodes
        </div>
        <button v-else-if="isAvailable" class="unlock-btn" :disabled="!canAfford" @click="unlock">
          {{ canAfford ? 'Unlock' : 'Cannot Afford' }}
        </button>
        <button v-else class="unlock-btn" disabled>Requirements Not Met</button>
      </template>
    </div>
  </aside>
</template>
