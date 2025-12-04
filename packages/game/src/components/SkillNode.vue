<script setup lang="ts">
import { computed } from 'vue';
import type { Node } from '@network-simulator/shared/types/node';

interface Props {
  node: Node;
  isUnlocked?: boolean;
  isAvailable?: boolean;
  isTierLocked?: boolean;
  canAfford?: boolean;
  isSelected?: boolean;
  justUnlocked?: boolean;
  progressPercent?: number;
  nodeLevel?: number;
}

const props = withDefaults(defineProps<Props>(), {
  isUnlocked: false,
  isAvailable: false,
  isTierLocked: false,
  canAfford: false,
  isSelected: false,
  justUnlocked: false,
  progressPercent: 0,
  nodeLevel: 0,
});

const emit = defineEmits<{
  select: [nodeId: string];
}>();

const maxLevel = computed(() => props.node.maxLevel || 1);
const showLevel = computed(() => maxLevel.value > 1);

const nodeClasses = computed(() => ({
  node: true,
  [`tier-${props.node.tier}`]: true,
  unlocked: props.isUnlocked,
  available: props.isAvailable && !props.isUnlocked && !props.isTierLocked,
  affordable: props.canAfford && !props.isUnlocked && !props.isTierLocked,
  'tier-locked': props.isTierLocked,
  locked: !props.isUnlocked && (!props.isAvailable || props.isTierLocked),
  selected: props.isSelected,
  'just-unlocked': props.justUnlocked,
  'max-level': props.nodeLevel >= maxLevel.value,
}));

const nodeStyle = computed(() => ({
  left: `${props.node.x}px`,
  top: `${props.node.y}px`,
}));

const tierColor = computed(() => {
  const colors: Record<number, string> = {
    0: '#00ffaa',
    1: '#00aaff',
    2: '#aa00ff',
    3: '#ff00aa',
    4: '#ffaa00',
    5: '#ff5500',
    6: '#00ffff',
    7: '#ffffff',
  };
  return colors[props.node.tier] || '#00ffaa';
});

const handleClick = () => {
  emit('select', props.node.id);
};
</script>

<template>
  <div :class="nodeClasses" :style="nodeStyle" @click="handleClick">
    <div v-if="justUnlocked" class="shockwave" :style="{ borderColor: tierColor }"></div>
    <div v-if="justUnlocked" class="shockwave shockwave-2" :style="{ borderColor: tierColor }"></div>
    <span class="node-icon">{{ node.icon }}</span>
    <span class="node-name">{{ node.name }}</span>
    <span v-if="showLevel" class="node-level">{{ nodeLevel }}/{{ maxLevel }}</span>
  </div>
</template>
