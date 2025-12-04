<script setup lang="ts">
import { computed } from 'vue';
import { formatDataValue, formatNumber } from 'packages/shared/src/utils/formatUtils';
import CrankButton from './buttons/CrankButton.vue';
import TerminalProgressButton from './buttons/TerminalProgressButton.vue';
import { AutomationRates } from 'packages/shared/src/types';

interface DataGeneration {
  active: boolean;
  progress: number;
  bitsPerTick: number;
  energyCost: number;
}

interface EnergyGeneration {
  active: boolean;
  progress: number;
  energyPerTick: number;
}

interface GenerationState {
  dataGeneration: DataGeneration | null;
  energyGeneration: EnergyGeneration | null;
  isCrankBroken: boolean;
  isCrankAutomated: boolean;
}

interface ResourceStats {
  energyPerClick: number;
  dataPerClick: number;
  stats: {
    nodesUnlocked: number;
    totalEnergy: number;
    totalData: number;
  };
}

interface GameStats {
  automations: AutomationRates;
  effectiveRates: Record<string, number>;
  coresEarned: number;
  highestTierReached: number;
  isDataUnlocked: boolean;
  canProcessData: boolean;
}

interface Props {
  resourceStats: ResourceStats;
  generationState: GenerationState;
  gameStats: GameStats;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'generate-energy': [];
  'process-data': [];
  ascend: [];
}>();

const dataGenerationProgress = computed(() => {
  return props.generationState.dataGeneration?.progress ?? null;
});

const dataButtonValue = computed(() => {
  if (props.generationState.dataGeneration?.active) {
    const dg = props.generationState.dataGeneration;
    return `+${formatDataValue(dg.bitsPerTick)}B (${dg.energyCost}⚡)`;
  }
  return 'IDLE';
});

const energyGenerationProgress = computed(() => {
  return props.generationState.energyGeneration?.progress ?? null;
});

const energyButtonValue = computed(() => {
  if (props.generationState.energyGeneration?.active) {
    return `+${formatNumber(props.generationState.energyGeneration.energyPerTick)}/s`;
  }
  return '+' + formatNumber(props.resourceStats.energyPerClick);
});

const handleEnergyClick = () => {
  if (props.generationState.isCrankBroken || props.generationState.isCrankAutomated) return;
  emit('generate-energy');
};

</script>

<template>
  <aside id="sidebar">
    <div id="manual-actions">
      <div class="action-wrapper" @click="handleEnergyClick">
        <CrankButton :value="energyButtonValue" :broken="generationState.isCrankBroken"
          :automated="generationState.isCrankAutomated" :progress="energyGenerationProgress" />
      </div>
      <div v-if="gameStats.isDataUnlocked" class="action-wrapper">
        <TerminalProgressButton label="data" :value="dataButtonValue" :progress="dataGenerationProgress" />
      </div>
    </div>

    <div id="stats">
      <h2>Statistics</h2>
      <div class="stat">
        <span>Nodes Unlocked:</span>
        <span>{{ resourceStats.stats.nodesUnlocked }}</span>
      </div>
      <div class="stat">
        <span>Total Energy:</span>
        <span>{{ formatNumber(resourceStats.stats.totalEnergy) }}</span>
      </div>
      <div class="stat">
        <span>Total Data:</span>
        <span>{{ formatDataValue(resourceStats.stats.totalData) }}</span>
      </div>
    </div>
  </aside>
</template>
