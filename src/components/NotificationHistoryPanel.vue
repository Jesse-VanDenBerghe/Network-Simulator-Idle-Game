<script setup lang="ts">
import { computed, watch, nextTick } from 'vue';
import type { Notification } from '@/types/notification';

interface Props {
  show: boolean;
  history: Notification[];
  narrateOnlyFilter: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  'update:narrateOnlyFilter': [value: boolean];
}>();

const filteredHistory = computed(() => {
  const filtered = !props.narrateOnlyFilter
    ? props.history
    : props.history.filter((n) => n.type === 'narration');
  return [...filtered].reverse();
});

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      nextTick(() => {
        const panelBody = document.querySelector('#notification-history-panel .panel-body');
        if (panelBody) {
          panelBody.scrollTop = panelBody.scrollHeight;
        }
      });
    }
  }
);

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

const getTypeIcon = (type: string): string => {
  switch (type) {
    case 'narration':
      return '📖';
    case 'success':
      return '✓';
    case 'error':
      return '✗';
    case 'prestige':
      return '🌌';
    default:
      return 'ℹ';
  }
};
</script>

<template>
  <div v-if="show" id="notification-history-panel">
    <div class="panel-content">
      <div class="panel-header">
        <h2>📜 Notification History</h2>
        <button class="close-button" @click="emit('close')">×</button>
      </div>
      <div class="panel-controls">
        <label class="filter-toggle">
          <input
            type="checkbox"
            :checked="narrateOnlyFilter"
            @change="emit('update:narrateOnlyFilter', ($event.target as HTMLInputElement).checked)"
          />
          <span>Narration only</span>
        </label>
      </div>
      <div class="panel-body">
        <div v-if="filteredHistory.length === 0" class="empty-state">No notifications yet</div>
        <div
          v-for="notification in filteredHistory"
          :key="notification.id"
          class="history-item"
          :class="notification.type"
        >
          <span class="history-icon">{{ getTypeIcon(notification.type) }}</span>
          <div class="history-content">
            <span class="history-message" style="white-space: pre-line">{{ notification.message }}</span>
            <span class="history-time">{{ formatTime(notification.timestamp) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
