<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  icon: string;
  text: string;
  value: string;
  disabled?: boolean;
  locked?: boolean;
  progress?: number | null;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  locked: false,
  progress: null,
});

const emit = defineEmits<{
  click: [];
}>();

const showProgress = computed(() => props.progress !== null && props.progress >= 0);
</script>

<template>
  <button
    class="action-btn"
    :class="{ locked, 'has-progress': showProgress }"
    :disabled="disabled || locked"
    @click="emit('click')"
  >
    <div v-if="showProgress" class="progress-bar" :style="{ width: progress + '%' }"></div>
    <span class="btn-icon">{{ icon }}</span>
    <span class="btn-text">{{ text }}</span>
    <span class="btn-value">{{ value }}</span>
  </button>
</template>
