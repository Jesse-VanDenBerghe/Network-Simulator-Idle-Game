<script setup lang="ts">
import { computed } from 'vue';
import { formatNumber } from '@network-simulator/shared/utils/formatUtils';

interface Props {
  coresEarned: number;
  minTierReached: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  ascend: [];
}>();

const canAscend = computed(() => {
  return props.minTierReached >= 3 && props.coresEarned >= 1;
});

const handleAscend = () => {
  if (!canAscend.value) return;

  const message = `Ascend and reset your progress?\n\nYou will earn: ${props.coresEarned} Quantum Core${props.coresEarned !== 1 ? 's' : ''}\n\nThis will reset:\n- All resources\n- All unlocked nodes (except Core)\n- All automation\n\nQuantum Cores persist and can be spent on permanent upgrades.`;

  if (confirm(message)) {
    emit('ascend');
  }
};
</script>

<template>
  <div v-if="minTierReached >= 3" id="ascension-section">
    <h2>Ascension</h2>
    <button
      id="ascension-button"
      class="action-button ascension"
      :disabled="!canAscend"
      :title="canAscend ? 'Reset for Quantum Cores' : 'Reach Tier 3+ to ascend'"
      @click="handleAscend"
    >
      <div class="button-content">
        <span class="button-icon">🌌</span>
        <span class="button-text">Ascend</span>
        <span class="button-value">+{{ formatNumber(coresEarned) }} 💎</span>
      </div>
    </button>
    <p class="ascension-hint">Reset progress for permanent upgrades</p>
  </div>
</template>
