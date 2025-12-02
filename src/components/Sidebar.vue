<script setup lang="ts">
import { ref, computed } from 'vue';
import { formatNumber } from '@/utils/formatUtils';
import ActionButton from './ActionButton.vue';
import AscensionButton from './AscensionButton.vue';
import CrankButton from './CrankButton.vue';
import ParticleBurst from './ParticleBurst.vue';
import TerminalProgressButton from './TerminalProgressButton.vue';

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
  automations: unknown[];
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

const energyParticles = ref<InstanceType<typeof ParticleBurst> | null>(null);
const dataParticles = ref<InstanceType<typeof ParticleBurst> | null>(null);

const dataGenerationProgress = computed(() => {
  return props.generationState.dataGeneration?.progress ?? null;
});

const dataButtonValue = computed(() => {
  if (props.generationState.dataGeneration?.active) {
    const dg = props.generationState.dataGeneration;
    return `+${formatNumber(dg.bitsPerTick)} (${dg.energyCost}⚡)`;
  }
  return '+1 (1⚡)';
});

const energyGenerationProgress = computed(() => {
  return props.generationState.energyGeneration?.progress ?? null;
});

const energyButtonText = computed(() => {
  if (props.generationState.isCrankBroken) {
    return 'Broken Crank';
  }
  return 'Turn Crank';
});

const energyButtonValue = computed(() => {
  if (props.generationState.energyGeneration?.active) {
    return `+${formatNumber(props.generationState.energyGeneration.energyPerTick)}/s`;
  }
  return '+' + formatNumber(props.resourceStats.energyPerClick);
});

const handleEnergyClick = (event: MouseEvent) => {
  if (props.generationState.isCrankBroken || props.generationState.isCrankAutomated) return;
  emit('generate-energy');

  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  energyParticles.value?.burst(x, y, {
    count: 10,
    color: '#00ffaa',
    secondaryColor: '#ffff00',
    spread: 50,
    size: 5,
  });
};

const handleDataClick = (event: MouseEvent) => {
  if (!props.gameStats.isDataUnlocked || !props.gameStats.canProcessData) return;
  emit('process-data');

  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  dataParticles.value?.burst(x, y, {
    count: 10,
    color: '#00aaff',
    secondaryColor: '#aa00ff',
    spread: 50,
    size: 5,
  });
};
</script>

<template>
  <aside id="sidebar">
    <div id="manual-actions">
      <div class="action-wrapper" @click="handleEnergyClick">
        <CrankButton
          :value="energyButtonValue"
          :broken="generationState.isCrankBroken"
          :automated="generationState.isCrankAutomated"
          :progress="energyGenerationProgress"
        />
        <ParticleBurst ref="energyParticles" />
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
        <span>{{ formatNumber(resourceStats.stats.totalData) }}</span>
      </div>
    </div>

    <AscensionButton
      :cores-earned="gameStats.coresEarned"
      :min-tier-reached="gameStats.highestTierReached"
      @ascend="emit('ascend')"
    />
  </aside>
</template>
