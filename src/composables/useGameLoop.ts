// useGameLoop Composable
// =======================
// Manages game loop, notifications, and ascension logic
// Uses event bus for decoupled communication with other composables

import { ref, onMounted, onUnmounted, type Ref } from 'vue';
import { GAME_LOOP_INTERVAL_MS, AUTOSAVE_INTERVAL_MS } from '@/data/constants';
import { NotificationType } from '@/data/notifications/constants';
import type { UseGameStateReturn } from './useGameState';
import type { UsePrestigeStateReturn } from './usePrestigeState';
import type { EventMap, NodeUnlockedEvent } from '@/types/event';

// TODO: Import from @/data/prestigeData once migrated in Phase 3
declare const PrestigeData: any;

const NOTIFICATION_HISTORY_KEY = 'networkSimNotificationHistory';

/**
 * Event bus interface (minimal typing)
 */
interface EventBus {
    on<K extends keyof EventMap>(eventName: K, callback: (data: EventMap[K]) => void): () => void;
    emit<K extends keyof EventMap>(eventName: K, data: EventMap[K]): void;
}

/**
 * Notification display object
 */
interface NotificationDisplay {
    id: number;
    message: string;
    type: string;
    duration: number;
}

/**
 * Notification history entry
 */
interface NotificationHistoryEntry {
    id: number;
    message: string;
    type: string;
    timestamp: number;
}

/**
 * Resource rates from node management
 */
interface ResourceRates {
    energy: number;
    data: number;
    energyPerClick?: number;
}

/**
 * Return type for useGameLoop composable
 */
export interface UseGameLoopReturn {
    // State
    notifications: Ref<NotificationDisplay[]>;
    notificationHistory: Ref<NotificationHistoryEntry[]>;
    showNotificationHistory: Ref<boolean>;
    narrateOnlyFilter: Ref<boolean>;
    
    // Methods
    gameLoop: () => void;
    showNotification: (message: string, type?: string, duration?: number) => void;
    toggleNotificationHistory: () => void;
    clearNotificationHistory: () => void;
    ascend: () => void;
    resetGameState: () => void;
    handlePurchaseUpgrade: (upgradeId: string) => boolean;
    handleUnlockNode: (nodeId: string) => void;
    initialize: () => void;
}

export function useGameLoop(
    gameState: UseGameStateReturn,
    prestigeState: UsePrestigeStateReturn,
    eventBus: EventBus
): UseGameLoopReturn {
    // ==========================================
    // STATE
    // ==========================================
    const lastUpdate = ref<number>(Date.now());
    const notifications = ref<NotificationDisplay[]>([]);
    const notificationHistory = ref<NotificationHistoryEntry[]>([]);
    const showNotificationHistory = ref<boolean>(false);
    const narrateOnlyFilter = ref<boolean>(false);
    let notificationId = 0;
    let gameLoopInterval: ReturnType<typeof setInterval> | null = null;
    let saveInterval: ReturnType<typeof setInterval> | null = null;
    let prestigeSaveInterval: ReturnType<typeof setInterval> | null = null;
    
    // Cached resource rates (updated via events)
    let cachedResourceRates: ResourceRates = { energy: 0, data: 0 };
    let cachedEnergyPerClick = 0;
    let autoCrankAccumulator = 0; // Tracks time for auto-crank

    // ==========================================
    // METHODS
    // ==========================================
    
    /**
     * Cap data at max capacity
     */
    function capDataAtCapacity(): void {
        const maxCap = gameState.maxDataCapacity.value;
        if (gameState.resources.data > maxCap) {
            gameState.resources.data = maxCap;
        }
    }

    /**
     * Main game loop - applies automation rates
     */
    function gameLoop(): void {
        const now = Date.now();
        const delta = (now - lastUpdate.value) / 1000;
        lastUpdate.value = now;

        // Apply automation rates (from cached event data)
        const rates = cachedResourceRates;
        gameState.resources.energy += rates.energy * delta;
        gameState.resources.data += rates.data * delta;

        gameState.totalResources.energy += rates.energy * delta;
        gameState.totalResources.data += rates.data * delta;

        // Cap data at max capacity
        capDataAtCapacity();

        // Process auto data generation
        processDataGeneration(delta);
        
        // Process auto energy generation
        processEnergyGeneration(delta);
        
        // Process auto crank
        processAutoCrank(delta);
        
        // Emit tick for notification engine (throttled checks happen there)
        eventBus.emit('gameTick', { deltaTime: delta });
    }

    /**
     * Auto data generation - fills progress bar and generates bits
     */
    function processDataGeneration(delta: number): void {
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
    function processEnergyGeneration(delta: number): void {
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
     * Auto crank - adds energyPerClick every second when automated
     */
    function processAutoCrank(delta: number): void {
        if (!gameState.isCrankAutomated.value) return;
        if (cachedEnergyPerClick <= 0) return;

        autoCrankAccumulator += delta;
        while (autoCrankAccumulator >= 1) {
            autoCrankAccumulator -= 1;
            gameState.resources.energy += cachedEnergyPerClick;
            gameState.totalResources.energy += cachedEnergyPerClick;
        }
    }

    /**
     * Show a notification toast
     */
    function showNotification(message: string, type: string = 'info', duration: number = 10_000): void {
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
     * Save notification history to localStorage
     */
    function saveNotificationHistory(): void {
        try {
            localStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(notificationHistory.value));
        } catch (e: any) {
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
    function loadNotificationHistory(): void {
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
    function clearNotificationHistory(): void {
        notificationHistory.value = [];
        saveNotificationHistory();
    }

    /**
     * Toggle notification history panel
     */
    function toggleNotificationHistory(): void {
        showNotificationHistory.value = !showNotificationHistory.value;
    }

    /**
     * Perform ascension - reset game but keep cores
     */
    function ascend(): void {
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
        eventBus.emit('requestSavePrestige', undefined);
        
        // Emit ascension complete for notification engine
        eventBus.emit('ascension', { 
            coresEarned: cores,
            totalCores: prestigeState.prestigeState.quantumCores,
            ascensionCount: prestigeState.prestigeState.ascensionCount
        });
        
        showNotification(`🌌 Ascended! +${cores} Quantum Core${cores !== 1 ? 's' : ''}`, NotificationType.SUCCESS);
    }

    /**
     * Reset game state (for ascension)
     */
    function resetGameState(): void {
        // Reset resources
        gameState.resetResources();
        
        // Reset nodes
        gameState.resetNodes();
        
        // Reset run timer
        prestigeState.resetRunTimer();
        
        // Request starting bonuses via event
        eventBus.emit('requestStartingBonuses', undefined);
    }

    /**
     * Handle upgrade purchase with notification
     */
    function handlePurchaseUpgrade(upgradeId: string): boolean {
        const success = prestigeState.purchaseUpgrade(upgradeId);
        if (success) {
            const upgrade = PrestigeData.upgrades[upgradeId];
            showNotification(`✨ ${upgrade.name} purchased!`, NotificationType.SUCCESS);
            eventBus.emit('requestSavePrestige', undefined);
            return true;
        }
        return false;
    }

    /**
     * Handle node unlock with notification
     */
    function handleUnlockNode(nodeId: string): void {
        // Request unlock via event, response comes back via nodeUnlocked event
        eventBus.emit('requestUnlockNode', { nodeId });
    }
    
    /**
     * Handle nodeUnlocked event from nodeManagement
     */
    function onNodeUnlocked(data: NodeUnlockedEvent): void {
        const { node, level } = data;
        const isUpgrade = level > 1;
        
        // Update cached rates (if available in event data)
        if ('rates' in data) {
            cachedResourceRates = data.rates as any;
            cachedEnergyPerClick = (data.rates as any).energyPerClick || 0;
        }
        
        if (isUpgrade) {
            showNotification(`${node.icon} ${node.name} upgraded to level ${level}!`, NotificationType.NODE_UNLOCK);
        } else {
            showNotification(`${node.icon} ${node.name} unlocked!`, NotificationType.NODE_UNLOCK);
        }
        
        // Note: Narrations are now handled by useNotificationEngine via event subscription
        
        // Trigger unlock animation
        gameState.setLastUnlockedNode(node.id);
        
        // Request save via event
        eventBus.emit('requestSaveGame', undefined);
    }

    /**
     * Start game intervals
     */
    function startIntervals(): void {
        gameLoopInterval = setInterval(gameLoop, GAME_LOOP_INTERVAL_MS);
        saveInterval = setInterval(() => eventBus.emit('requestSaveGame', undefined), AUTOSAVE_INTERVAL_MS);
        prestigeSaveInterval = setInterval(() => eventBus.emit('requestSavePrestige', undefined), AUTOSAVE_INTERVAL_MS);
    }

    /**
     * Stop game intervals
     */
    function stopIntervals(): void {
        if (gameLoopInterval) clearInterval(gameLoopInterval);
        if (saveInterval) clearInterval(saveInterval);
        if (prestigeSaveInterval) clearInterval(prestigeSaveInterval);
    }

    /**
     * Initialize game on mount
     */
    function initialize(): void {
        loadNotificationHistory();
        
        // Subscribe to events from other composables
        eventBus.on('nodeUnlocked', onNodeUnlocked);
        eventBus.on('resourceRatesChanged', (data) => {
            cachedResourceRates = data;
            cachedEnergyPerClick = data.energyPerClick || 0;
        });
        eventBus.on('gameLoaded', () => {
            // Game state has been restored, request current rates
            eventBus.emit('requestResourceRates', undefined);
        });
        
        // Listen for showNotification events from notification engine
        eventBus.on('notificationShown', ({ notification }) => {
            showNotification(notification.message, notification.type, notification.duration);
        });
        
        // Request initial load
        eventBus.emit('requestLoadPrestige', undefined);
        eventBus.emit('requestLoadGame', undefined);
        
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
