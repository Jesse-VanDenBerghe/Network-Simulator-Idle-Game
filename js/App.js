// Main Vue Application - Refactored
// ===================================
// Uses composables for clean separation of concerns

const { createApp, computed, ref, onMounted, onUnmounted } = Vue;

// Import composables
import { useGameState } from './composables/useGameState.js';
import { usePrestigeState } from './composables/usePrestigeState.js';
import { useNodeManagement } from './composables/useNodeManagement.js';
import { useSaveLoad } from './composables/useSaveLoad.js';
import { useGameLoop } from './composables/useGameLoop.js';
import { useEventBus } from './composables/useEventBus.js';
import { useNotificationEngine } from './composables/useNotificationEngine.js';

const App = {
    name: 'App',
    components: {
        ResourceBar,
        Sidebar,
        SkillTree,
        InfoPanel,
        NotificationToast,
        NotificationHistoryPanel,
        AscensionPanel,
        ChangelogModal
    },
    setup() {
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
        const coresEarned = computed(() => 
            prestigeState.calculateQuantumCores(
                gameState.totalResources,
                gameState.unlockedNodes.value
            )
        );

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
        function handleKeydown(event) {
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

        // ==========================================
        // RETURN (expose to template)
        // ==========================================
        return {
            // Game State
            resources: gameState.resources,
            automations: gameState.automations,
            unlockedNodes: gameState.unlockedNodes,
            unlockedBranches: gameState.unlockedBranches,
            selectedNodeId: gameState.selectedNodeId,
            lastUnlockedNodeId: gameState.lastUnlockedNodeId,
            dataGeneration: gameState.dataGeneration,
            energyGeneration: gameState.energyGeneration,
            isCrankBroken: gameState.isCrankBroken,
            isCrankAutomated: gameState.isCrankAutomated,
            notifications: gameLoop.notifications,
            notificationHistory: gameLoop.notificationHistory,
            showNotificationHistory: gameLoop.showNotificationHistory,
            narrateOnlyFilter: gameLoop.narrateOnlyFilter,
            
            // Prestige State
            prestigeState: prestigeState.prestigeState,
            showAscensionPanel: prestigeState.showAscensionPanel,
            prestigeBonuses: prestigeState.prestigeBonuses,
            
            // Computed Values
            computedValues: nodeManagement.computedValues,
            resourceRates: nodeManagement.resourceRates,
            isDataUnlocked: gameState.isDataUnlocked,
            canProcessData: gameState.canProcessData,
            dataPerClickDisplay: nodeManagement.dataPerClickDisplay,
            highestTierReached: gameState.highestTierReached,
            stats: gameState.stats,
            coresEarned,
            
            // Node Management
            selectedNode: nodeManagement.selectedNode,
            isSelectedNodeUnlocked: nodeManagement.isSelectedNodeUnlocked,
            isSelectedNodeAvailable: nodeManagement.isSelectedNodeAvailable,
            canAffordSelectedNode: nodeManagement.canAffordSelectedNode,
            isTierLocked: nodeManagement.isTierLocked,
            tierGateRequirement: nodeManagement.tierGateRequirement,
            getNodeLevel: nodeManagement.getNodeLevel,
            getNodeMaxLevel: nodeManagement.getNodeMaxLevel,
            canUpgradeNode: nodeManagement.canUpgradeNode,
            nodeLevels: gameState.nodeLevels,
            
            // Methods
            selectNode: gameState.selectNode,
            generateEnergy: nodeManagement.generateEnergy,
            processData: nodeManagement.processData,
            unlockNode: gameLoop.handleUnlockNode,
            ascend: gameLoop.ascend,
            purchaseUpgrade: gameLoop.handlePurchaseUpgrade,
            toggleAscensionPanel: prestigeState.toggleAscensionPanel,
            toggleChangelogModal,
            showChangelogModal,
            toggleNotificationHistory: gameLoop.toggleNotificationHistory,
            clearNotificationHistory: gameLoop.clearNotificationHistory,
            resetGame: saveLoad.resetGame,
            
            // Data
            nodes: GameData.nodes
        };
    },
    template: `
        <div id="game-container">
            <header id="header">
                <div class="header-left">
                    <h1>Network Simulator</h1>
                    <button class="icon-button" @click="toggleNotificationHistory" title="Notification History">🔔</button>
                    <button class="icon-button" @click="toggleChangelogModal" title="View Changelog">📜</button>
                </div>
                <div class="prestige-header" v-if="prestigeState.ascensionCount > 0 || prestigeState.quantumCores > 0">
                    <button class="prestige-button" @click="toggleAscensionPanel" title="View Ascension Upgrades">
                        <span class="prestige-icon">💎</span>
                        <span class="prestige-value">{{ prestigeState.quantumCores }}</span>
                        <span class="prestige-label">Quantum Cores</span>
                        <span class="prestige-ascension">Ascension {{ prestigeState.ascensionCount }}</span>
                    </button>
                </div>
                <div id="resources">
                    <ResourceBar
                        icon="⚡"
                        name="W"
                        :amount="resources.energy"
                        :rate="resourceRates.energy"
                    />
                    <ResourceBar
                        icon="📊"
                        name="B"
                        :amount="resources.data"
                        :rate="resourceRates.data"
                        :visible="isDataUnlocked"
                    />
                </div>
            </header>

            <main id="main-content">
                <Sidebar
                    :resource-stats="{ energyPerClick: computedValues.energyPerClick, dataPerClick: dataPerClickDisplay, stats: stats }"
                    :generation-state="{ dataGeneration: dataGeneration, energyGeneration: energyGeneration, isCrankBroken: isCrankBroken, isCrankAutomated: isCrankAutomated }"
                    :game-stats="{ automations: automations, effectiveRates: resourceRates, coresEarned: coresEarned, highestTierReached: highestTierReached, isDataUnlocked: isDataUnlocked, canProcessData: canProcessData }"
                    @generate-energy="generateEnergy"
                    @process-data="processData"
                    @ascend="ascend"
                />

                <SkillTree
                    :nodes="nodes"
                    :unlocked-nodes="unlockedNodes"
                    :unlocked-branches="unlockedBranches"
                    :selected-node-id="selectedNodeId"
                    :resources="resources"
                    :ascension-count="prestigeState.ascensionCount"
                    :prestige-bonuses="prestigeBonuses"
                    :last-unlocked-node-id="lastUnlockedNodeId"
                    :node-levels="nodeLevels"
                    @select-node="selectNode"
                />

                <InfoPanel
                    :node="selectedNode"
                    :is-unlocked="isSelectedNodeUnlocked"
                    :is-available="isSelectedNodeAvailable"
                    :is-tier-locked="isTierLocked"
                    :tier-gate="tierGateRequirement"
                    :can-afford="canAffordSelectedNode"
                    :resources="resources"
                    :unlocked-nodes="unlockedNodes"
                    :ascension-count="prestigeState.ascensionCount"
                    :prestige-bonuses="prestigeBonuses"
                    :node-level="selectedNode ? getNodeLevel(selectedNode.id) : 0"
                    :can-upgrade="selectedNode ? canUpgradeNode(selectedNode) : false"
                    :node-levels="nodeLevels"
                    @unlock="unlockNode"
                />
            </main>

            <NotificationToast :notifications="notifications" />
            
            <NotificationHistoryPanel
                :show="showNotificationHistory"
                :history="notificationHistory"
                :narrate-only-filter="narrateOnlyFilter"
                @close="toggleNotificationHistory"
                @update:narrate-only-filter="narrateOnlyFilter = $event"
            />
            
            <AscensionPanel
                :visible="showAscensionPanel"
                :quantum-cores="prestigeState.quantumCores"
                :ascension-count="prestigeState.ascensionCount"
                :purchased-upgrades="prestigeState.upgrades"
                :statistics="prestigeState.statistics"
                :total-cores-earned="prestigeState.totalCoresEarned"
                @purchase-upgrade="purchaseUpgrade"
                @close="toggleAscensionPanel"
            />
            
            <ChangelogModal
                :visible="showChangelogModal"
                @close="toggleChangelogModal"
            />
        </div>
    `
};

// Initialize node layout before starting the app
if (typeof LayoutEngine !== 'undefined' && typeof GameData !== 'undefined') {
    LayoutEngine.initializeLayout(GameData);
}

// Create and mount the app
createApp(App).mount('#app');
