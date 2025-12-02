<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';

// Import components
import ResourceBar from '@/components/ResourceBar.vue';
import Sidebar from '@/components/Sidebar.vue';
import SkillTree from '@/components/SkillTree.vue';
import InfoPanel from '@/components/InfoPanel.vue';
import NotificationToast from '@/components/NotificationToast.vue';
import NotificationHistoryPanel from '@/components/NotificationHistoryPanel.vue';
import AscensionPanel from '@/components/AscensionPanel.vue';
import ChangelogModal from '@/components/ChangelogModal.vue';

// Import composables
import { useGameState } from '@/composables/useGameState';
import { usePrestigeState } from '@/composables/usePrestigeState';
import { useNodeManagement } from '@/composables/useNodeManagement';
import { useSaveLoad } from '@/composables/useSaveLoad';
import { useGameLoop } from '@/composables/useGameLoop';
import { useEventBus } from '@/composables/useEventBus';
import { useNotificationEngine } from '@/composables/useNotificationEngine';

// Import game data
import GameData from '@/core/gameData';

// ==========================================
// EVENT BUS (for composable communication)
// ==========================================
const eventBus = useEventBus();

// ==========================================
// COMPOSABLES (decoupled via event bus)
// ==========================================
const gameState = useGameState();
const prestigeState = usePrestigeState();

// These composables communicate via eventBus instead of direct dependencies
const nodeManagement = useNodeManagement(gameState, prestigeState, eventBus, GameData.nodes);
const saveLoad = useSaveLoad(gameState, prestigeState, eventBus);
const gameLoop = useGameLoop(gameState, prestigeState, eventBus);

// Notification engine - subscribes to events, triggers narrations
const notificationEngine = useNotificationEngine(eventBus);
notificationEngine.initialize();

// ==========================================
// COMPUTED (for ascension)
// ==========================================
const coresEarned = computed(() => {
    const cores = prestigeState.calculateQuantumCores(
        gameState.totalResources,
        gameState.unlockedNodes.value
    );
    return isNaN(cores) ? 0 : cores;
});

// ==========================================
// CHANGELOG MODAL
// ==========================================
const showChangelogModal = ref(false);
const toggleChangelogModal = () => {
    showChangelogModal.value = !showChangelogModal.value;
};

// ==========================================
// KEYBOARD SHORTCUTS
// ==========================================
function handleKeydown(event: KeyboardEvent) {
    // Close modals with Escape
    if (event.key === 'Escape') {
        if (showChangelogModal.value) {
            showChangelogModal.value = false;
            return;
        }
        if (prestigeState.showAscensionPanel.value) {
            prestigeState.toggleAscensionPanel();
            return;
        }
    }
    
    // 'u' to unlock selected node
    if (event.key === 'u' || event.key === 'U') {
        const nodeId = gameState.selectedNodeId.value;
        if (nodeId) {
            gameLoop.handleUnlockNode(nodeId);
        }
    }
}

onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
    <div id="game-container">
        <header id="header">
            <div class="header-left">
                <h1>Network Simulator</h1>
                <button class="icon-button" @click="toggleChangelogModal" title="View Changelog">📜</button>
            </div>
            <div class="prestige-header" v-if="prestigeState.prestigeState.ascensionCount > 0 || prestigeState.prestigeState.quantumCores > 0">
                <button class="prestige-button" @click="prestigeState.toggleAscensionPanel" title="View Ascension Upgrades">
                    <span class="prestige-icon">💎</span>
                    <span class="prestige-value">{{ prestigeState.prestigeState.quantumCores }}</span>
                    <span class="prestige-label">Quantum Cores</span>
                    <span class="prestige-ascension">Ascension {{ prestigeState.prestigeState.ascensionCount }}</span>
                </button>
            </div>
            <div id="resources">
                <ResourceBar
                    icon="⚡"
                    name="W"
                    :amount="gameState.resources.energy"
                    :rate="nodeManagement.resourceRates.energy"
                />
                <ResourceBar
                    icon="📊"
                    name="B"
                    :amount="gameState.resources.data"
                    :rate="nodeManagement.resourceRates.data"
                    :visible="gameState.isDataUnlocked.value"
                />
            </div>
        </header>

        <main id="main-content">
            <Sidebar
                :resource-stats="{ 
                    energyPerClick: nodeManagement.computedValues.value.energyPerClick, 
                    dataPerClick: nodeManagement.dataPerClickDisplay.value, 
                    stats: gameState.stats.value 
                }"
                :generation-state="{ 
                    dataGeneration: gameState.dataGeneration, 
                    energyGeneration: gameState.energyGeneration, 
                    isCrankBroken: gameState.isCrankBroken.value, 
                    isCrankAutomated: gameState.isCrankAutomated.value 
                }"
                :game-stats="{ 
                    automations: gameState.automations, 
                    effectiveRates: nodeManagement.resourceRates.value, 
                    coresEarned: coresEarned.value, 
                    highestTierReached: gameState.highestTierReached.value, 
                    isDataUnlocked: gameState.isDataUnlocked.value, 
                    canProcessData: gameState.canProcessData.value 
                }"
                @generate-energy="nodeManagement.generateEnergy"
                @process-data="nodeManagement.processData"
                @ascend="gameLoop.ascend"
            />

            <SkillTree
                :nodes="GameData.nodes"
                :unlocked-nodes="gameState.unlockedNodes.value"
                :unlocked-branches="gameState.unlockedBranches.value"
                :selected-node-id="gameState.selectedNodeId.value"
                :resources="gameState.resources"
                :ascension-count="prestigeState.prestigeState.ascensionCount"
                :prestige-bonuses="prestigeState.prestigeBonuses.value"
                :last-unlocked-node-id="gameState.lastUnlockedNodeId.value"
                :node-levels="gameState.nodeLevels"
                @select-node="gameState.selectNode"
            />

            <InfoPanel
                :node="nodeManagement.selectedNode.value"
                :is-unlocked="nodeManagement.isSelectedNodeUnlocked.value"
                :is-available="nodeManagement.isSelectedNodeAvailable.value"
                :is-tier-locked="nodeManagement.isTierLocked.value"
                :tier-gate="nodeManagement.tierGateRequirement.value"
                :can-afford="nodeManagement.canAffordSelectedNode.value"
                :resources="gameState.resources"
                :unlocked-nodes="gameState.unlockedNodes.value"
                :ascension-count="prestigeState.prestigeState.ascensionCount"
                :prestige-bonuses="prestigeState.prestigeBonuses.value"
                :node-level="nodeManagement.selectedNode.value ? nodeManagement.getNodeLevel(nodeManagement.selectedNode.value.id) : 0"
                :can-upgrade="nodeManagement.selectedNode.value ? nodeManagement.canUpgradeNode(nodeManagement.selectedNode.value) : false"
                :node-levels="gameState.nodeLevels"
                @unlock="gameLoop.handleUnlockNode"
            />
        </main>

        <NotificationToast :notifications="gameLoop.notifications.value" />
        
        <button id="notification-history-button" @click="gameLoop.toggleNotificationHistory" title="Notification History">🔔</button>
        
        <NotificationHistoryPanel
            :show="gameLoop.showNotificationHistory.value"
            :history="gameLoop.notificationHistory.value"
            :narrate-only-filter="gameLoop.narrateOnlyFilter.value"
            @close="gameLoop.toggleNotificationHistory"
            @update:narrate-only-filter="gameLoop.narrateOnlyFilter.value = $event"
        />
        
        <AscensionPanel
            :visible="prestigeState.showAscensionPanel.value"
            :quantum-cores="prestigeState.prestigeState.quantumCores"
            :ascension-count="prestigeState.prestigeState.ascensionCount"
            :purchased-upgrades="prestigeState.prestigeState.upgrades"
            :statistics="prestigeState.prestigeState.statistics"
            :total-cores-earned="prestigeState.prestigeState.totalCoresEarned"
            @purchase-upgrade="gameLoop.handlePurchaseUpgrade"
            @close="prestigeState.toggleAscensionPanel"
        />
        
        <ChangelogModal
            :visible="showChangelogModal"
            @close="toggleChangelogModal"
        />
    </div>
</template>
