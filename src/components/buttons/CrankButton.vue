<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue';

interface Props {
  value: string;
  disabled?: boolean;
  locked?: boolean;
  broken?: boolean;
  automated?: boolean;
  progress?: number | null;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  locked: false,
  broken: false,
  automated: false,
  progress: null,
});

const emit = defineEmits<{
  click: [];
}>();

const rotation = ref(0);
const isAnimating = ref(false);
const autoRotateInterval = ref<number | null>(null);

const showProgress = computed(() => props.progress !== null && props.progress >= 0);

const crankStyle = computed(() => ({
  transform: `rotate(${rotation.value}deg)`,
}));

const statusText = computed(() => {
  if (props.locked) return 'Broken Crank';
  if (props.broken) return 'Handle Snapped!';
  if (props.automated) return 'Auto Crank';
  return 'Turn Crank';
});

const handleClick = () => {
  if (props.disabled || props.locked || props.broken || props.automated) return;

  isAnimating.value = true;
  rotation.value += 360;

  setTimeout(() => {
    isAnimating.value = false;
  }, 400);

  emit('click');
};

const startAutoRotate = () => {
  if (autoRotateInterval.value) return;
  autoRotateInterval.value = window.setInterval(() => {
    rotation.value += 360;
  }, 1000);
};

const stopAutoRotate = () => {
  if (autoRotateInterval.value) {
    clearInterval(autoRotateInterval.value);
    autoRotateInterval.value = null;
  }
};

watch(
  () => props.automated,
  (val) => {
    if (val) {
      startAutoRotate();
    } else {
      stopAutoRotate();
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  stopAutoRotate();
});
</script>

<template>
  <button
    class="crank-btn"
    :class="{ locked, broken, automated, 'has-progress': showProgress, animating: isAnimating }"
    :disabled="disabled || locked || broken"
    @click="handleClick"
  >
    <div v-if="showProgress" class="crank-progress-bar" :style="{ width: progress + '%' }"></div>
    <div class="crank-container">
      <div v-if="automated" class="crank-cog"></div>
      <div class="crank-body">
        <div class="crank-axle"></div>
        <div class="crank-arm" :class="{ 'auto-rotating': automated }" :style="crankStyle">
          <div v-if="!broken" class="crank-handle"></div>
          <div v-if="broken" class="crank-handle-stub"></div>
        </div>
      </div>
      <div v-if="broken" class="crank-handle-fallen"></div>
    </div>
    <div class="crank-info">
      <span class="crank-text">{{ statusText }}</span>
      <span class="crank-value">{{ value }}</span>
    </div>
  </button>
</template>
