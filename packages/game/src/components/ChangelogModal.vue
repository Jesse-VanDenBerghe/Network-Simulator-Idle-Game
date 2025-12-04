<script setup lang="ts">
import { computed } from 'vue';
import { ChangelogData } from '@network-simulator/shared/data/changelogData';
import type { ChangelogEntry } from '@network-simulator/shared/data/changelogData';

interface Props {
  visible: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  close: [];
}>();

const changelogData = computed(() => {
  return ChangelogData;
});

const filteredChangelog = computed(() => {
  return changelogData.value.map((release: ChangelogEntry) => ({
    ...release,
    sections: Object.fromEntries(
      Object.entries(release.sections).filter(([, items]) => items && items.length > 0)
    ),
  }));
});
</script>

<template>
  <div v-if="visible" id="changelog-panel" @click.self="emit('close')">
    <div class="panel-content" @click.stop>
      <div class="panel-header">
        <h2>📜 Changelog</h2>
        <button class="close-button" @click="emit('close')">✕</button>
      </div>

      <div class="panel-body">
        <div v-for="release in filteredChangelog" :key="release.version" class="changelog-release">
          <div class="release-header">
            <h3 class="release-version">Version {{ release.version }}</h3>
            <span class="release-date">{{ release.date }}</span>
          </div>

          <div v-for="(items, section) in release.sections" :key="section" class="changelog-section">
            <h4 class="section-title">{{ section }}</h4>
            <ul class="section-list">
              <li v-for="(item, idx) in items" :key="idx">{{ item }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
