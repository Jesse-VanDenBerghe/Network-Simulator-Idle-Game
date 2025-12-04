<script setup lang="ts">
import type { NotificationDisplay } from '@network-simulator/shared/types/notification';

interface Props {
  notifications: NotificationDisplay[];
}

defineProps<Props>();

const getStyle = (notification: NotificationDisplay) => {
  const duration = notification.duration || 10000;
  const fadeStart = (duration - 300) / 1000;
  return {
    animationDuration: `0.3s, 0.3s`,
    animationDelay: `0s, ${fadeStart}s`,
  };
};
</script>

<template>
  <div id="notifications">
    <TransitionGroup name="notification">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification"
        :class="notification.type"
        :style="getStyle(notification)"
        style="white-space: pre-line"
      >
        {{ notification.message }}
      </div>
    </TransitionGroup>
  </div>
</template>
