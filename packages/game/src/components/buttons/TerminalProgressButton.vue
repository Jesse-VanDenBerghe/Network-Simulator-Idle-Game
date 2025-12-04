<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  icon?: string;
  label?: string;
  value: string;
  disabled?: boolean;
  locked?: boolean;
  progress?: number | null;
  barWidth?: number;
}

const props = withDefaults(defineProps<Props>(), {
  icon: '📊',
  label: 'data',
  disabled: false,
  locked: false,
  progress: null,
  barWidth: 24,
});

const emit = defineEmits<{
  click: [];
}>();

const isActive = computed(() => props.progress !== null && props.progress >= 0);

const progressBar = computed(() => {
  if (!isActive.value) {
    return '[' + '─'.repeat(props.barWidth) + ']';
  }
  const filled = Math.round((props.progress! / 100) * props.barWidth);
  const empty = props.barWidth - filled;
  const filledChars = '█'.repeat(filled);
  const emptyChars = '░'.repeat(empty);
  return '[' + filledChars + emptyChars + ']';
});

const percentText = computed(() => {
  if (!isActive.value) return '';
  return Math.round(props.progress!) + '%';
});

const statusText = computed(() => {
  if (props.locked) return 'LOCKED';
  if (isActive.value) return 'PROCESSING...';
  return 'READY';
});
</script>

<template>
  <button
    class="terminal-progress-btn"
    :class="{ locked, active: isActive }"
    :disabled="disabled || locked"
    @click="emit('click')"
  >
    <div class="terminal-header">
      <span class="terminal-prompt">$</span>
      <span class="terminal-cmd">./generate</span>
      <span class="terminal-label">--{{ label }}</span>
      <span class="terminal-status" :class="{ processing: isActive }">{{ statusText }}</span>
    </div>
    <div class="terminal-body">
      <div class="terminal-bar-row">
        <span class="terminal-bar" :class="{ active: isActive }">{{ progressBar }}</span>
        <span v-if="isActive" class="terminal-percent">{{ percentText }}</span>
      </div>
      <div class="terminal-output">
        <span class="terminal-value">{{ value }}</span>
      </div>
    </div>
  </button>
</template>
