// useGameLoop Composable
// =======================
// Manages game loop, notifications, and ascension logic

const { ref, onMounted, onUnmounted } = Vue;

const NOTIFICATION_HISTORY_KEY = 'networkSimNotificationHistory';

export function useGameLoop(gameState, prestigeState, nodeManagement, saveLoad) {
    // ==========================================
    // STATE
    // ==========================================
    const lastUpdate = ref(Date.now());
    const notifications = ref([]);
    const notificationHistory = ref([]);
    const showNotificationHistory = ref(false);
    const narrateOnlyFilter = ref(false);
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

        // Process auto data generation
        processDataGeneration(delta);
        
        // Process auto energy generation
        processEnergyGeneration(delta);
    }

    /**
     * Auto data generation - fills progress bar and generates bits
     */
    function processDataGeneration(delta) {
        const dg = gameState.dataGeneration;
        if (!dg.active) return;
        if (gameState.resources.energy < dg.energyCost) return;

        // Progress = % of interval completed per second
        const progressPerSecond = 100 / (dg.interval / 1000);
        dg.progress += progressPerSecond * delta;

        if (dg.progress >= 100) {
            dg.progress = 0;
            gameState.resources.energy -= dg.energyCost;
            gameState.resources.data += dg.bitsPerTick;
            gameState.totalResources.data += dg.bitsPerTick;
        }
    }

    /**
     * Auto energy generation - fills progress bar and generates energy
     */
    function processEnergyGeneration(delta) {
        const eg = gameState.energyGeneration;
        if (!eg.active) return;

        // Progress = % of interval completed per second
        const progressPerSecond = 100 / (eg.interval / 1000);
        eg.progress += progressPerSecond * delta;

        if (eg.progress >= 100) {
            eg.progress = 0;
            gameState.resources.energy += eg.energyPerTick;
            gameState.totalResources.energy += eg.energyPerTick;
        }
    }

    /**
     * Show a notification toast
     */
    function showNotification(message, type = 'info', duration = 10_000) {
        const id = ++notificationId;
        const timestamp = Date.now();
        notifications.value.push({ id, message, type, duration });
        
        // Add to history
        notificationHistory.value.unshift({ id, message, type, timestamp });
        saveNotificationHistory();
        
        setTimeout(() => {
            notifications.value = notifications.value.filter(n => n.id !== id);
        }, duration);
    }

    /**
     * Save notification history to localStorage
     */
    function saveNotificationHistory() {
        try {
            localStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(notificationHistory.value));
        } catch (e) { /* ignore */ }
    }

    /**
     * Load notification history from localStorage
     */
    function loadNotificationHistory() {
        try {
            const saved = localStorage.getItem(NOTIFICATION_HISTORY_KEY);
            if (saved) {
                notificationHistory.value = JSON.parse(saved);
            }
        } catch (e) { /* ignore */ }
    }

    /**
     * Clear notification history
     */
    function clearNotificationHistory() {
        notificationHistory.value = [];
        saveNotificationHistory();
    }

    /**
     * Toggle notification history panel
     */
    function toggleNotificationHistory() {
        showNotificationHistory.value = !showNotificationHistory.value;
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
        const result = nodeManagement.unlockNode(nodeId);
        if (result) {
            const { node, newLevel } = result;
            const isUpgrade = newLevel > 1;
            
            if (isUpgrade) {
                showNotification(`${node.icon} ${node.name} upgraded to level ${newLevel}!`, 'success');
            } else {
                showNotification(`${node.icon} ${node.name} unlocked!`, 'success');
            }
            
            // Show narration message if node has one and level matches
            if (node.effects.narrate) {
                const narrations = Array.isArray(node.effects.narrate) 
                    ? node.effects.narrate 
                    : [node.effects.narrate];
                
                narrations.forEach(narrate => {
                    const narrateLevel = typeof narrate === 'object' ? narrate.level : undefined;
                    const shouldNarrate = narrateLevel === undefined ? !isUpgrade : narrateLevel === newLevel;
                    
                    if (shouldNarrate) {
                        const text = typeof narrate === 'string' ? narrate : narrate.text;
                        const duration = typeof narrate === 'string' ? 5_000 : (narrate.duration || 10_000);
                        setTimeout(() => {
                            showNotification(text, 'narration', duration);
                        }, 500);
                    }
                });
            }
            
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
        loadNotificationHistory();
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
        notificationHistory,
        showNotificationHistory,
        narrateOnlyFilter,
        
        // Methods
        gameLoop,
        showNotification,
        toggleNotificationHistory,
        clearNotificationHistory,
        ascend,
        resetGameState,
        handlePurchaseUpgrade,
        handleUnlockNode,
        initialize
    };
}
