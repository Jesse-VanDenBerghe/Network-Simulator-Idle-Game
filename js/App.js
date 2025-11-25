// Main Vue Application - Refactored
// ===================================
// Uses composables for clean separation of concerns

const { createApp, computed, onMounted, onUnmounted } = Vue;

// Import composables
import { useGameState } from './composables/useGameState.js';
import { usePrestigeState } from './composables/usePrestigeState.js';
import { useNodeManagement } from './composables/useNodeManagement.js';
import { useSaveLoad } from './composables/useSaveLoad.js';
import { useGameLoop } from './composables/useGameLoop.js';

const App = {
    name: 'App',
    components: {
        ResourceBar,
        Sidebar,
        SkillTree,
        InfoPanel,
        NotificationToast,
        AscensionPanel
    },
    setup() {
        // ==========================================
        // COMPOSABLES
        // ==========================================
        const gameState = useGameState();
        const prestigeState = usePrestigeState();
        const nodeManagement = useNodeManagement(gameState, prestigeState);
        const saveLoad = useSaveLoad(gameState, prestigeState, nodeManagement);
        const gameLoop = useGameLoop(gameState, prestigeState, nodeManagement, saveLoad);

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
        // KEYBOARD SHORTCUTS
        // ==========================================
        function handleKeydown(event) {
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
            selectedNodeId: gameState.selectedNodeId,
            lastUnlockedNodeId: gameState.lastUnlockedNodeId,
            notifications: gameLoop.notifications,
            
            // Prestige State
            prestigeState: prestigeState.prestigeState,
            showAscensionPanel: prestigeState.showAscensionPanel,
            prestigeBonuses: prestigeState.prestigeBonuses,
            
            // Computed Values
            computedValues: nodeManagement.computedValues,
            resourceRates: nodeManagement.resourceRates,
            dataUnlocked: gameState.dataUnlocked,
            bandwidthUnlocked: gameState.bandwidthUnlocked,
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
            
            // Methods
            selectNode: gameState.selectNode,
            generateEnergy: nodeManagement.generateEnergy,
            processData: nodeManagement.processData,
            unlockNode: gameLoop.handleUnlockNode,
            ascend: gameLoop.ascend,
            purchaseUpgrade: gameLoop.handlePurchaseUpgrade,
            toggleAscensionPanel: prestigeState.toggleAscensionPanel,
            resetGame: saveLoad.resetGame,
            
            // Data
            nodes: GameData.nodes
        };
    },
    template: `
        <div id="game-container">
            <header id="header">
                <h1>Network Simulator</h1>
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
                        name="Energy"
                        :amount="resources.energy"
                        :rate="resourceRates.energy"
                    />
                    <ResourceBar
                        icon="📊"
                        name="Data"
                        :amount="resources.data"
                        :rate="resourceRates.data"
                    />
                    <ResourceBar
                        icon="📡"
                        name="Bandwidth"
                        :amount="resources.bandwidth"
                        :rate="resourceRates.bandwidth"
                        :visible="bandwidthUnlocked"
                    />
                </div>
            </header>

            <main id="main-content">
                <Sidebar
                    :energy-per-click="computedValues.energyPerClick"
                    :data-per-click="dataPerClickDisplay"
                    :data-unlocked="dataUnlocked"
                    :can-process-data="canProcessData"
                    :automations="automations"
                    :effective-rates="resourceRates"
                    :stats="stats"
                    :cores-earned="coresEarned"
                    :highest-tier-reached="highestTierReached"
                    @generate-energy="generateEnergy"
                    @process-data="processData"
                    @ascend="ascend"
                />

                <SkillTree
                    :nodes="nodes"
                    :unlocked-nodes="unlockedNodes"
                    :selected-node-id="selectedNodeId"
                    :resources="resources"
                    :ascension-count="prestigeState.ascensionCount"
                    :prestige-bonuses="prestigeBonuses"
                    :last-unlocked-node-id="lastUnlockedNodeId"
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
                    @unlock="unlockNode"
                />
            </main>

            <NotificationToast :notifications="notifications" />
            
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
        </div>
    `
};

// Initialize node layout before starting the app
if (typeof GameData !== 'undefined' && GameData.nodes) {
    console.log('Initializing layout for', Object.keys(GameData.nodes).length, 'nodes');
    GameData.initializeLayout();
}

// Create and mount the app
createApp(App).mount('#app');
