<script setup lang="ts">
import { computed } from 'vue';
import { formatNumber } from '@network-simulator/shared/utils/formatUtils';

interface Props {
  icon: string;
  name: string;
  amount: number;
  rate?: number;
  visible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  rate: 0,
  visible: true,
});

const formattedAmount = computed(() => formatNumber(Math.floor(props.amount)));
const formattedRate = computed(() => formatNumber(props.rate));
</script>

<template>
  <div v-if="visible" class="resource">
    <span class="resource-icon">{{ icon }}</span>
    <span class="resource-amount">{{ formattedAmount }}</span>
    <span class="resource-label">{{ name }}</span>
    <span class="rate">(+{{ formattedRate }}/s)</span>
  </div>
</template>
