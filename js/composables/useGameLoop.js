// useGameLoop Composable
// =======================
// Manages game loop, notifications, and ascension logic

const { ref, onMounted, onUnmounted } = Vue;

export function useGameLoop(gameState, prestigeState, nodeManagement, saveLoad) {
    // ==========================================
    // STATE
    // ==========================================
    const lastUpdate = ref(Date.now());
    const notifications = ref([]);
    let notificationId = 0;
    let gameLoopInterval = null;
    let saveInterval = null;
    let prestigeSaveInterval = null;

    // ==========================================
    // METHODS
    // ==========================================
    
    /**
     * Main game loop - applies automation rates
     */
    function gameLoop() {
        const now = Date.now();
        const delta = (now - lastUpdate.value) / 1000;
        lastUpdate.value = now;

        // Apply automation rates
        const rates = nodeManagement.resourceRates.value;
        gameState.resources.energy += rates.energy * delta;
        gameState.resources.data += rates.data * delta;
        gameState.resources.bandwidth += rates.bandwidth * delta;

        gameState.totalResources.energy += rates.energy * delta;
        gameState.totalResources.data += rates.data * delta;
        gameState.totalResources.bandwidth += rates.bandwidth * delta;
    }

    /**
     * Show a notification toast
     */
    function showNotification(message, type = 'info') {
        const id = ++notificationId;
        notifications.value.push({ id, message, type });
        setTimeout(() => {
            notifications.value = notifications.value.filter(n => n.id !== id);
        }, 3000);
    }

    /**
     * Perform ascension - reset game but keep cores
     */
    function ascend() {
        const cores = prestigeState.calculateQuantumCores(
            gameState.totalResources,
            gameState.unlockedNodes.value
        );
        
        if (cores < 1) {
            showNotification('Need at least 1 Quantum Core to ascend!', 'error');
            return;
        }
        
        // Award cores
        prestigeState.prestigeState.quantumCores += cores;
        prestigeState.prestigeState.totalCoresEarned += cores;
        prestigeState.prestigeState.ascensionCount++;
        
        // Update statistics
        prestigeState.prestigeState.statistics.totalNodesEverUnlocked += gameState.unlockedNodes.value.size;
        prestigeState.prestigeState.statistics.totalEnergyEverEarned += gameState.totalResources.energy;
        
        const runTime = Date.now() - prestigeState.prestigeState.statistics.runStartTime;
        if (!prestigeState.prestigeState.statistics.fastestClear || runTime < prestigeState.prestigeState.statistics.fastestClear) {
            prestigeState.prestigeState.statistics.fastestClear = runTime;
        }
        
        // Reset game state
        resetGameState();
        
        // Save prestige
        saveLoad.savePrestige();
        
        showNotification(`🌌 Ascended! +${cores} Quantum Core${cores !== 1 ? 's' : ''}`, 'prestige');
    }

    /**
     * Reset game state (for ascension)
     */
    function resetGameState() {
        // Reset resources
        gameState.resetResources();
        
        // Reset nodes
        gameState.resetNodes();
        
        // Reset run timer
        prestigeState.resetRunTimer();
        
        // Apply starting bonuses from upgrades
        nodeManagement.applyStartingBonuses();
    }

    /**
     * Handle upgrade purchase with notification
     */
    function handlePurchaseUpgrade(upgradeId) {
        const success = prestigeState.purchaseUpgrade(upgradeId);
        if (success) {
            const upgrade = PrestigeData.upgrades[upgradeId];
            showNotification(`✨ ${upgrade.name} purchased!`, 'success');
            saveLoad.savePrestige();
            return true;
        }
        return false;
    }

    /**
     * Handle node unlock with notification
     */
    function handleUnlockNode(nodeId) {
        const success = nodeManagement.unlockNode(nodeId);
        if (success) {
            const node = GameData.nodes[nodeId];
            showNotification(`${node.icon} ${node.name} unlocked!`, 'success');
            // Trigger unlock animation
            gameState.setLastUnlockedNode(nodeId);
            saveLoad.saveGame();
            return true;
        }
        return false;
    }

    /**
     * Start game intervals
     */
    function startIntervals() {
        gameLoopInterval = setInterval(gameLoop, 100);
        saveInterval = setInterval(saveLoad.saveGame, 30000);
        prestigeSaveInterval = setInterval(saveLoad.savePrestige, 30000);
    }

    /**
     * Stop game intervals
     */
    function stopIntervals() {
        if (gameLoopInterval) clearInterval(gameLoopInterval);
        if (saveInterval) clearInterval(saveInterval);
        if (prestigeSaveInterval) clearInterval(prestigeSaveInterval);
    }

    /**
     * Initialize game on mount
     */
    function initialize() {
        saveLoad.loadPrestige();
        const offlineMessage = saveLoad.loadGame();
        if (offlineMessage) {
            showNotification(offlineMessage, 'info');
        }
        startIntervals();
    }

    // ==========================================
    // LIFECYCLE
    // ==========================================
    onMounted(initialize);
    onUnmounted(stopIntervals);

    // ==========================================
    // RETURN
    // ==========================================
    return {
        // State
        notifications,
        
        // Methods
        gameLoop,
        showNotification,
        ascend,
        resetGameState,
        handlePurchaseUpgrade,
        handleUnlockNode,
        initialize
    };
}
