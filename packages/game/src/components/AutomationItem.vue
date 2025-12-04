<script setup lang="ts">
import { computed } from 'vue';
import { formatNumber } from '@network-simulator/shared/utils/formatUtils';

interface Props {
  resource: string;
  rate: number;
}

const props = defineProps<Props>();

const displayName = computed(() => {
  return props.resource.charAt(0).toUpperCase() + props.resource.slice(1) + ' Gen';
});

const formattedRate = computed(() => formatNumber(props.rate));
</script>

<template>
  <div class="automation-item active">
    <div class="automation-header">
      <span class="automation-name">{{ displayName }}</span>
    </div>
    <div class="automation-output">+{{ formattedRate }}/second</div>
  </div>
</template>
