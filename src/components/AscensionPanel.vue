<script setup lang="ts">
import { ref, computed } from 'vue';
import { formatNumber } from '@/utils/formatUtils';

interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  requires: string[];
  tier: number;
}

interface Statistics {
  totalNodesEverUnlocked?: number;
  totalEnergyEverEarned?: number;
  fastestClear?: number;
}

interface Props {
  quantumCores: number;
  ascensionCount: number;
  purchasedUpgrades: Set<string>;
  statistics: Statistics;
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
  const PrestigeData = (window as any).PrestigeData;
  return PrestigeData.getUpgradesByTier();
});

const displayUpgrades = computed(() => {
  return upgradesByTier.value[selectedTier.value] || [];
});

const canAfford = (upgrade: Upgrade): boolean => {
  return props.quantumCores >= upgrade.cost;
};

const isPurchased = (upgradeId: string): boolean => {
  return props.purchasedUpgrades.has(upgradeId);
};

const canPurchase = (upgrade: Upgrade): boolean => {
  if (isPurchased(upgrade.id)) return false;
  if (!canAfford(upgrade)) return false;

  return upgrade.requires.every((reqId) => props.purchasedUpgrades.has(reqId));
};

const handlePurchase = (upgrade: Upgrade) => {
  if (!canPurchase(upgrade)) return;
  emit('purchase-upgrade', upgrade.id);
};

const selectTier = (tier: number) => {
  selectedTier.value = tier;
};

const formatTime = (ms: number | undefined): string => {
  if (!ms) return 'N/A';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

const getUpgradeStatusClass = (upgrade: Upgrade): string => {
  if (isPurchased(upgrade.id)) return 'purchased';
  if (canPurchase(upgrade)) return 'available';
  return 'locked';
};

const getRequirementNames = (requireIds: string[]): string => {
  const PrestigeData = (window as any).PrestigeData;
  return requireIds
    .map((id) => {
      const upgrade = PrestigeData.upgrades[id];
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
