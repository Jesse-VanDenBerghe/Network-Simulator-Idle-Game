// useGameLoop Composable
// =======================
// Manages game loop, notifications, and ascension logic
// Uses event bus for decoupled communication with other composables

const { ref, onMounted, onUnmounted } = Vue;
import { GAME_LOOP_INTERVAL_MS, AUTOSAVE_INTERVAL_MS, NotificationType } from '../data/constants.js';

const NOTIFICATION_HISTORY_KEY = 'networkSimNotificationHistory';

export function useGameLoop(gameState, prestigeState, eventBus) {
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
    
    // Cached resource rates (updated via events)
    let cachedResourceRates = { energy: 0, data: 0, bandwidth: 0 };

    // ==========================================
    // METHODS
    // ==========================================
    
    /**
     * Cap data at max capacity
     */
    function capDataAtCapacity() {
        const maxCap = gameState.maxDataCapacity.value;
        if (gameState.resources.data > maxCap) {
            gameState.resources.data = maxCap;
        }
    }

    /**
     * Main game loop - applies automation rates
     */
    function gameLoop() {
        const now = Date.now();
        const delta = (now - lastUpdate.value) / 1000;
        lastUpdate.value = now;

        // Apply automation rates (from cached event data)
        const rates = cachedResourceRates;
        gameState.resources.energy += rates.energy * delta;
        gameState.resources.data += rates.data * delta;
        gameState.resources.bandwidth += (rates.bandwidth || 0) * delta;

        gameState.totalResources.energy += rates.energy * delta;
        gameState.totalResources.data += rates.data * delta;
        gameState.totalResources.bandwidth += (rates.bandwidth || 0) * delta;

        // Cap data at max capacity
        capDataAtCapacity();

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

        // Don't generate if at capacity
        const maxCap = gameState.maxDataCapacity.value;
        if (gameState.resources.data >= maxCap) return;

        // Progress = % of interval completed per second
        const progressPerSecond = 100 / (dg.interval / 1000);
        dg.progress += progressPerSecond * delta;

        if (dg.progress >= 100) {
            dg.progress = 0;
            gameState.resources.energy -= dg.energyCost;
            gameState.resources.data += dg.bitsPerTick;
            gameState.totalResources.data += dg.bitsPerTick;
            capDataAtCapacity();
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
            const index = notifications.value.findIndex(n => n.id === id);
            if (index !== -1) {
                notifications.value.splice(index, 1);
            }
        }, duration);
    }

    /**
     * Show narration(s) from a narrate effect
     * Supports string, object with text/duration, or array of either
     */
    function showNarration(narrate) {
        const narrations = Array.isArray(narrate) ? narrate : [narrate];
        narrations.forEach(n => {
            const text = typeof n === 'string' ? n : n.text;
            const duration = typeof n === 'string' ? 5_000 : (n.duration || 10_000);
            setTimeout(() => showNotification(text, NotificationType.NARRATION, duration), 500);
        });
    }

    /**
     * Save notification history to localStorage
     */
    function saveNotificationHistory() {
        try {
            localStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(notificationHistory.value));
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                console.warn('Storage quota exceeded - notification history not saved');
            } else {
                console.error('Failed to save notification history:', e);
            }
        }
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
        } catch (e) {
            console.error('Failed to load notification history:', e);
            // Clear corrupted data
            notificationHistory.value = [];
        }
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
            showNotification('Need at least 1 Quantum Core to ascend!', NotificationType.ERROR);
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
        
        // Request prestige save via event
        eventBus.emit('requestSavePrestige');
        
        showNotification(`🌌 Ascended! +${cores} Quantum Core${cores !== 1 ? 's' : ''}`, NotificationType.SUCCESS);
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
        
        // Request starting bonuses via event
        eventBus.emit('requestStartingBonuses');
    }

    /**
     * Handle upgrade purchase with notification
     */
    function handlePurchaseUpgrade(upgradeId) {
        const success = prestigeState.purchaseUpgrade(upgradeId);
        if (success) {
            const upgrade = PrestigeData.upgrades[upgradeId];
            showNotification(`✨ ${upgrade.name} purchased!`, NotificationType.SUCCESS);
            eventBus.emit('requestSavePrestige');
            return true;
        }
        return false;
    }

    /**
     * Handle node unlock with notification
     */
    function handleUnlockNode(nodeId) {
        // Request unlock via event, response comes back via nodeUnlocked event
        eventBus.emit('requestUnlockNode', { nodeId });
    }
    
    /**
     * Handle nodeUnlocked event from nodeManagement
     */
    function onNodeUnlocked({ node, newLevel, isUpgrade, rates }) {
        // Update cached rates
        cachedResourceRates = rates;
        
        if (isUpgrade) {
            showNotification(`${node.icon} ${node.name} upgraded to level ${newLevel}!`, NotificationType.SUCCESS);
        } else {
            showNotification(`${node.icon} ${node.name} unlocked!`, NotificationType.SUCCESS);
        }
        
        // Show narration from base effects (on initial unlock only)
        if (!isUpgrade && node.effects.narrate) {
            showNarration(node.effects.narrate);
        }
        
        // Show narration from levelEffects
        if (node.effects.levelEffects?.[newLevel]?.narrate) {
            showNarration(node.effects.levelEffects[newLevel].narrate);
        }
        
        // Trigger unlock animation
        gameState.setLastUnlockedNode(node.id);
        
        // Request save via event
        eventBus.emit('requestSaveGame');
    }

    /**
     * Start game intervals
     */
    function startIntervals() {
        gameLoopInterval = setInterval(gameLoop, GAME_LOOP_INTERVAL_MS);
        saveInterval = setInterval(() => eventBus.emit('requestSaveGame'), AUTOSAVE_INTERVAL_MS);
        prestigeSaveInterval = setInterval(() => eventBus.emit('requestSavePrestige'), AUTOSAVE_INTERVAL_MS);
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
        
        // Subscribe to events from other composables
        eventBus.on('nodeUnlocked', onNodeUnlocked);
        eventBus.on('resourceRatesChanged', (rates) => {
            cachedResourceRates = rates;
        });
        eventBus.on('offlineProgressCalculated', (message) => {
            if (message) {
                showNotification(message, NotificationType.INFO);
            }
        });
        eventBus.on('gameLoaded', () => {
            // Game state has been restored, request current rates
            eventBus.emit('requestResourceRates');
        });
        
        // Request initial load
        eventBus.emit('requestLoadPrestige');
        eventBus.emit('requestLoadGame');
        
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
