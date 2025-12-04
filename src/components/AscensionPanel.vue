<script setup lang="ts">
import { ref, computed } from 'vue';
import { formatNumber, formatTime } from '@/utils/formatUtils';
import { prestigeUpgrades, getUpgradesByTier } from '@/data/prestigeData';
import type { PrestigeUpgrade } from '@/data/prestigeData';
import { PrestigeStatistics } from '@/types';

interface Props {
  quantumCores: number;
  ascensionCount: number;
  purchasedUpgrades: Set<string>;
  statistics: PrestigeStatistics;
  totalCoresEarned?: number;
  visible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  totalCoresEarned: 0,
  visible: false,
});

const emit = defineEmits<{
  'purchase-upgrade': [upgradeId: string];
  close: [];
}>();

const selectedTier = ref(1);

const upgradesByTier = computed(() => {
  return getUpgradesByTier();
});

const displayUpgrades = computed(() => {
  return upgradesByTier.value[selectedTier.value] || [];
});

const canAfford = (upgrade: PrestigeUpgrade): boolean => {
  return props.quantumCores >= upgrade.cost;
};

const isPurchased = (upgradeId: string): boolean => {
  return props.purchasedUpgrades.has(upgradeId);
};

const canPurchase = (upgrade: PrestigeUpgrade): boolean => {
  if (isPurchased(upgrade.id)) return false;
  if (!canAfford(upgrade)) return false;

  return upgrade.requires.every((reqId) => props.purchasedUpgrades.has(reqId));
};

const handlePurchase = (upgrade: PrestigeUpgrade) => {
  if (!canPurchase(upgrade)) return;
  emit('purchase-upgrade', upgrade.id);
};

const selectTier = (tier: number) => {
  selectedTier.value = tier;
};

const getUpgradeStatusClass = (upgrade: PrestigeUpgrade): string => {
  if (isPurchased(upgrade.id)) return 'purchased';
  if (canPurchase(upgrade)) return 'available';
  return 'locked';
};

const getRequirementNames = (requireIds: string[]): string => {
  return requireIds
    .map((id) => {
      const upgrade = prestigeUpgrades[id];
      return upgrade ? upgrade.name : id;
    })
    .join(', ');
};
</script>

<template>
  <div v-if="visible" id="ascension-panel" @click.self="emit('close')">
    <div class="panel-content" @click.stop>
      <div class="panel-header">
        <h2>🌌 Ascension</h2>
        <button class="close-button" @click="emit('close')">✕</button>
      </div>

      <div class="prestige-summary">
        <div class="prestige-stat">
          <span class="stat-icon">💎</span>
          <div class="stat-info">
            <span class="stat-label">Quantum Cores</span>
            <span class="stat-value">{{ formatNumber(quantumCores) }}</span>
          </div>
        </div>
        <div class="prestige-stat">
          <span class="stat-icon">🔄</span>
          <div class="stat-info">
            <span class="stat-label">Ascensions</span>
            <span class="stat-value">{{ ascensionCount }}</span>
          </div>
        </div>
      </div>

      <div class="panel-body">
        <div class="tier-tabs">
          <button
            v-for="tier in [1, 2, 3, 4]"
            :key="tier"
            class="tier-tab"
            :class="{ active: selectedTier === tier }"
            @click="selectTier(tier)"
          >
            Tier {{ tier }}
          </button>
        </div>

        <div class="upgrades-grid">
          <div
            v-for="upgrade in displayUpgrades"
            :key="upgrade.id"
            class="upgrade-card"
            :class="getUpgradeStatusClass(upgrade)"
          >
            <div class="upgrade-header">
              <h3 class="upgrade-name">{{ upgrade.name }}</h3>
              <span class="upgrade-cost"> {{ formatNumber(upgrade.cost) }} 💎 </span>
            </div>
            <p class="upgrade-description">{{ upgrade.description }}</p>

            <div v-if="upgrade.requires.length > 0" class="upgrade-requirements">
              <span class="req-label">Requires:</span>
              <span class="req-list">
                {{ getRequirementNames(upgrade.requires) }}
              </span>
            </div>

            <button class="purchase-button" :disabled="!canPurchase(upgrade)" @click="handlePurchase(upgrade)">
              <span v-if="isPurchased(upgrade.id)">✓ Purchased</span>
              <span v-else-if="canPurchase(upgrade)">Purchase</span>
              <span v-else-if="!canAfford(upgrade)">Not enough cores</span>
              <span v-else>Requirements not met</span>
            </button>
          </div>
        </div>

        <div class="statistics-section">
          <h3>Statistics</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-name">Total Cores Earned:</span>
              <span class="stat-val">{{ formatNumber(totalCoresEarned) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-name">Total Nodes Unlocked:</span>
              <span class="stat-val">{{ formatNumber(statistics.totalNodesEverUnlocked || 0) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-name">Total Energy Earned:</span>
              <span class="stat-val">{{ formatNumber(statistics.totalEnergyEverEarned || 0) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-name">Fastest Clear:</span>
              <span class="stat-val">{{ formatTime(statistics.fastestClear) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
