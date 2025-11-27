// useNotificationEngine Composable
// =================================
// Centralized notification engine that triggers messages based on game events
// Uses indexed lookups for O(1) event handling, persists shown state

import { TriggerType, ComparisonOperator, NotificationDefaults } from '../data/notifications/types.js';
import { getAllNotifications } from '../data/notifications/index.js';
import { NotificationType } from '../data/notifications/constants.js';

const SHOWN_NOTIFICATIONS_KEY = 'networkSimShownNotifications';
const NOTIFICATION_QUEUE_DELAY_MS = 500;
const SAVE_DEBOUNCE_MS = 1000;
const TICK_THROTTLE_MS = 500;  // Check resource/idle thresholds every 500ms

/**
 * Build indexed notification maps for O(1) lookups
 * @param {Array} notifications - All notification definitions
 * @returns {Object} Indexed maps by trigger type
 */
function buildNotificationIndex(notifications) {
    const index = {
        // Event-based triggers → Map<key, notification[]>
        [TriggerType.ON_NODE_UNLOCKED]: new Map(),
        [TriggerType.ON_NODE_LEVEL_REACHED]: new Map(),
        [TriggerType.ON_BRANCH_UNLOCKED]: new Map(),
        [TriggerType.ON_FEATURE_UNLOCKED]: new Map(),
        [TriggerType.ON_TIER_REACHED]: new Map(),
        
        // Simple array triggers (rare events, small arrays)
        [TriggerType.ON_FIRST_LAUNCH]: [],
        [TriggerType.ON_ASCENSION]: [],
        [TriggerType.ON_OFFLINE_RETURN]: [],
        
        // Tick-based triggers (special handling with sorting)
        [TriggerType.ON_RESOURCE_AMOUNT_REACHED]: {
            energy: [],
            data: [],
            bandwidth: []
        },
        [TriggerType.ON_IDLE_TIME]: []
    };
    
    for (const notification of notifications) {
        const { trigger } = notification;
        if (!trigger?.type) continue;
        
        switch (trigger.type) {
            case TriggerType.ON_NODE_UNLOCKED: {
                const key = trigger.nodeId;
                if (!index[trigger.type].has(key)) {
                    index[trigger.type].set(key, []);
                }
                index[trigger.type].get(key).push(notification);
                break;
            }
            
            case TriggerType.ON_NODE_LEVEL_REACHED: {
                const key = `${trigger.nodeId}:${trigger.level}`;
                if (!index[trigger.type].has(key)) {
                    index[trigger.type].set(key, []);
                }
                index[trigger.type].get(key).push(notification);
                break;
            }
            
            case TriggerType.ON_BRANCH_UNLOCKED: {
                const key = trigger.branch;
                if (!index[trigger.type].has(key)) {
                    index[trigger.type].set(key, []);
                }
                index[trigger.type].get(key).push(notification);
                break;
            }
            
            case TriggerType.ON_FEATURE_UNLOCKED: {
                const key = trigger.feature;
                if (!index[trigger.type].has(key)) {
                    index[trigger.type].set(key, []);
                }
                index[trigger.type].get(key).push(notification);
                break;
            }
            
            case TriggerType.ON_TIER_REACHED: {
                const key = String(trigger.tier);
                if (!index[trigger.type].has(key)) {
                    index[trigger.type].set(key, []);
                }
                index[trigger.type].get(key).push(notification);
                break;
            }
            
            case TriggerType.ON_RESOURCE_AMOUNT_REACHED: {
                const resource = trigger.resource || 'energy';
                if (index[trigger.type][resource]) {
                    index[trigger.type][resource].push(notification);
                }
                break;
            }
            
            case TriggerType.ON_FIRST_LAUNCH:
            case TriggerType.ON_ASCENSION:
            case TriggerType.ON_OFFLINE_RETURN:
            case TriggerType.ON_IDLE_TIME:
                index[trigger.type].push(notification);
                break;
        }
    }
    
    // Sort resource thresholds by threshold value for binary search
    for (const resource of ['energy', 'data', 'bandwidth']) {
        index[TriggerType.ON_RESOURCE_AMOUNT_REACHED][resource].sort(
            (a, b) => a.trigger.threshold - b.trigger.threshold
        );
    }
    
    // Sort idle time triggers
    index[TriggerType.ON_IDLE_TIME].sort(
        (a, b) => a.trigger.idleSeconds - b.trigger.idleSeconds
    );
    
    // Sort offline return triggers
    index[TriggerType.ON_OFFLINE_RETURN].sort(
        (a, b) => (a.trigger.offlineSeconds || 0) - (b.trigger.offlineSeconds || 0)
    );
    
    return index;
}

/**
 * Check if a resource comparison matches
 * @param {number} current - Current resource value
 * @param {string} comparison - Comparison operator
 * @param {number} threshold - Threshold value
 * @returns {boolean}
 */
function checkComparison(current, comparison, threshold) {
    switch (comparison) {
        case ComparisonOperator.GREATER_EQUAL:
        case '>=':
            return current >= threshold;
        case ComparisonOperator.LESS_EQUAL:
        case '<=':
            return current <= threshold;
        case ComparisonOperator.EQUAL:
        case '==':
            return current === threshold;
        case ComparisonOperator.GREATER:
        case '>':
            return current > threshold;
        case ComparisonOperator.LESS:
        case '<':
            return current < threshold;
        default:
            return current >= threshold;
    }
}

export function useNotificationEngine(eventBus) {
    // ==========================================
    // STATE
    // ==========================================
    
    // Shown notifications Set for O(1) lookup
    let shownNotifications = new Set();
    
    // Notification index for O(1) event handling
    let notificationIndex = null;
    
    // All notifications (for persistence lookup)
    let allNotifications = [];
    
    // Queue for stacking notifications
    let notificationQueue = [];
    let isProcessingQueue = false;
    
    // Debounce save timer
    let saveTimeout = null;
    
    // Tick throttling
    let lastTickCheck = 0;
    
    // Tier tracking (for onTierReached)
    const triggeredTiers = new Set();
    
    // Resource threshold tracking (for avoiding re-triggers)
    const triggeredThresholds = {
        energy: new Set(),
        data: new Set(),
        bandwidth: new Set()
    };
    
    // Idle tracking
    let lastInteractionTime = Date.now();
    let triggeredIdleThresholds = new Set();
    
    // ==========================================
    // PERSISTENCE
    // ==========================================
    
    /**
     * Load shown notifications from localStorage
     */
    function loadShownState() {
        try {
            const saved = localStorage.getItem(SHOWN_NOTIFICATIONS_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                shownNotifications = new Set(Array.isArray(parsed) ? parsed : []);
            }
        } catch (e) {
            console.error('Failed to load shown notifications:', e);
            shownNotifications = new Set();
        }
    }
    
    /**
     * Save shown notifications to localStorage (debounced)
     */
    function saveShownState() {
        if (saveTimeout) return;
        
        saveTimeout = setTimeout(() => {
            try {
                localStorage.setItem(
                    SHOWN_NOTIFICATIONS_KEY,
                    JSON.stringify([...shownNotifications])
                );
            } catch (e) {
                if (e.name === 'QuotaExceededError') {
                    console.warn('Storage quota exceeded - shown notifications not saved');
                } else {
                    console.error('Failed to save shown notifications:', e);
                }
            }
            saveTimeout = null;
        }, SAVE_DEBOUNCE_MS);
    }
    
    /**
     * Mark a notification as shown
     * @param {string} id - Notification ID
     */
    function markShown(id) {
        shownNotifications.add(id);
        saveShownState();
    }
    
    /**
     * Check if notification was already shown
     * @param {string} id - Notification ID
     * @returns {boolean}
     */
    function wasShown(id) {
        return shownNotifications.has(id);
    }
    
    /**
     * Reset shown notifications
     * @param {boolean} persistentOnly - If true, only reset non-persistent notifications
     */
    function resetShownNotifications(persistentOnly = false) {
        if (persistentOnly) {
            // Only remove notifications where persistAcrossAscension is false
            for (const notification of allNotifications) {
                if (!notification.persistAcrossAscension) {
                    shownNotifications.delete(notification.id);
                }
            }
        } else {
            shownNotifications.clear();
        }
        
        // Reset threshold tracking
        for (const resource of ['energy', 'data', 'bandwidth']) {
            triggeredThresholds[resource].clear();
        }
        triggeredTiers.clear();
        triggeredIdleThresholds.clear();
        
        saveShownState();
    }
    
    // ==========================================
    // QUEUE MANAGEMENT
    // ==========================================
    
    /**
     * Queue a notification for display
     * @param {Object} notification - Notification to queue
     */
    function queueNotification(notification) {
        // Skip if already shown
        if (wasShown(notification.id)) return;
        
        // Add to queue with priority sorting
        notificationQueue.push(notification);
        notificationQueue.sort((a, b) => 
            (b.priority || NotificationDefaults.priority) - 
            (a.priority || NotificationDefaults.priority)
        );
        
        processQueue();
    }
    
    /**
     * Process notification queue with delays
     */
    function processQueue() {
        if (isProcessingQueue || notificationQueue.length === 0) return;
        
        isProcessingQueue = true;
        
        const notification = notificationQueue.shift();
        
        // Mark as shown
        markShown(notification.id);
        
        // Emit to gameLoop for display
        eventBus.emit('showNotification', {
            message: notification.message,
            type: notification.type || NotificationType.NARRATION,
            duration: notification.duration || NotificationDefaults.duration
        });
        
        // Process next after delay
        setTimeout(() => {
            isProcessingQueue = false;
            processQueue();
        }, NOTIFICATION_QUEUE_DELAY_MS);
    }
    
    // ==========================================
    // EVENT HANDLERS
    // ==========================================
    
    /**
     * Handle node unlocked event
     * @param {Object} data - { node, newLevel, isUpgrade }
     */
    function onNodeUnlocked({ node, newLevel, isUpgrade }) {
        if (!notificationIndex) return;
        
        // Check onNodeUnlocked triggers (only for first unlock)
        if (!isUpgrade) {
            const nodeNotifications = notificationIndex[TriggerType.ON_NODE_UNLOCKED].get(node.id);
            if (nodeNotifications) {
                for (const n of nodeNotifications) {
                    queueNotification(n);
                }
            }
            
            // Check tier reached
            const tierKey = String(node.tier);
            if (!triggeredTiers.has(tierKey)) {
                triggeredTiers.add(tierKey);
                const tierNotifications = notificationIndex[TriggerType.ON_TIER_REACHED].get(tierKey);
                if (tierNotifications) {
                    for (const n of tierNotifications) {
                        queueNotification(n);
                    }
                }
            }
        }
        
        // Check onNodeLevelReached triggers (for upgrades)
        const levelKey = `${node.id}:${newLevel}`;
        const levelNotifications = notificationIndex[TriggerType.ON_NODE_LEVEL_REACHED].get(levelKey);
        if (levelNotifications) {
            for (const n of levelNotifications) {
                queueNotification(n);
            }
        }
    }
    
    /**
     * Handle branch unlocked event
     * @param {Object} data - { branch }
     */
    function onBranchUnlocked({ branch }) {
        if (!notificationIndex) return;
        
        const notifications = notificationIndex[TriggerType.ON_BRANCH_UNLOCKED].get(branch);
        if (notifications) {
            for (const n of notifications) {
                queueNotification(n);
            }
        }
    }
    
    /**
     * Handle feature unlocked event
     * @param {Object} data - { feature }
     */
    function onFeatureUnlocked({ feature }) {
        if (!notificationIndex) return;
        
        const notifications = notificationIndex[TriggerType.ON_FEATURE_UNLOCKED].get(feature);
        if (notifications) {
            for (const n of notifications) {
                queueNotification(n);
            }
        }
    }
    
    /**
     * Handle game loaded event (check first launch)
     * @param {Object} data - { isFirstLaunch }
     */
    function onGameLoaded({ isFirstLaunch } = {}) {
        if (!notificationIndex) return;
        
        if (isFirstLaunch) {
            const notifications = notificationIndex[TriggerType.ON_FIRST_LAUNCH];
            for (const n of notifications) {
                queueNotification(n);
            }
        }
    }
    
    /**
     * Handle ascension complete event
     * @param {Object} data - { count }
     */
    function onAscensionComplete({ count } = {}) {
        if (!notificationIndex) return;
        
        // Reset non-persistent shown notifications
        resetShownNotifications(true);
        
        // Check ascension triggers
        const notifications = notificationIndex[TriggerType.ON_ASCENSION];
        for (const n of notifications) {
            // Filter by count if specified
            if (n.trigger.count === undefined || n.trigger.count === count) {
                queueNotification(n);
            }
        }
    }
    
    /**
     * Handle offline return event
     * @param {Object} data - { offlineSeconds }
     */
    function onOfflineReturn({ offlineSeconds }) {
        if (!notificationIndex) return;
        
        const notifications = notificationIndex[TriggerType.ON_OFFLINE_RETURN];
        for (const n of notifications) {
            // Filter by minimum offline time
            const minSeconds = n.trigger.offlineSeconds || 0;
            if (offlineSeconds >= minSeconds) {
                queueNotification(n);
            }
        }
    }
    
    /**
     * Record user interaction (resets idle timer)
     */
    function recordInteraction() {
        lastInteractionTime = Date.now();
        triggeredIdleThresholds.clear();
    }
    
    /**
     * Check resource thresholds (called periodically, throttled)
     * @param {Object} resources - Current resource values { energy, data, bandwidth }
     */
    function checkResourceThresholds(resources) {
        if (!notificationIndex) return;
        
        for (const resource of ['energy', 'data', 'bandwidth']) {
            const current = resources[resource] || 0;
            const thresholds = notificationIndex[TriggerType.ON_RESOURCE_AMOUNT_REACHED][resource];
            
            // Early exit if no thresholds
            if (!thresholds || thresholds.length === 0) continue;
            
            // Check each threshold (sorted ascending)
            for (const n of thresholds) {
                // Skip if already triggered
                if (triggeredThresholds[resource].has(n.id)) continue;
                
                const { threshold, comparison } = n.trigger;
                
                // For >= comparisons, early exit once current < threshold
                if ((comparison === '>=' || !comparison) && current < threshold) {
                    break;
                }
                
                if (checkComparison(current, comparison || '>=', threshold)) {
                    triggeredThresholds[resource].add(n.id);
                    queueNotification(n);
                }
            }
        }
    }
    
    /**
     * Check idle time thresholds (called periodically, throttled)
     */
    function checkIdleThresholds() {
        if (!notificationIndex) return;
        
        const idleSeconds = (Date.now() - lastInteractionTime) / 1000;
        const thresholds = notificationIndex[TriggerType.ON_IDLE_TIME];
        
        for (const n of thresholds) {
            // Skip if already triggered this session
            if (triggeredIdleThresholds.has(n.id)) continue;
            
            if (idleSeconds >= n.trigger.idleSeconds) {
                triggeredIdleThresholds.add(n.id);
                queueNotification(n);
            }
        }
    }
    
    /**
     * Handle game tick event (throttled resource/idle checks)
     * @param {Object} data - { resources, now }
     */
    function onGameTick({ resources, now }) {
        // Throttle checks to every TICK_THROTTLE_MS
        if (now - lastTickCheck < TICK_THROTTLE_MS) return;
        lastTickCheck = now;
        
        checkResourceThresholds(resources);
        checkIdleThresholds();
    }
    
    // ==========================================
    // INITIALIZATION
    // ==========================================
    
    /**
     * Initialize the notification engine
     */
    function initialize() {
        // Load persisted state
        loadShownState();
        
        // Load all notifications and build index
        allNotifications = getAllNotifications();
        notificationIndex = buildNotificationIndex(allNotifications);
        
        // Subscribe to events
        eventBus.on('nodeUnlocked', onNodeUnlocked);
        eventBus.on('branchUnlocked', onBranchUnlocked);
        eventBus.on('featureUnlocked', onFeatureUnlocked);
        eventBus.on('gameLoaded', onGameLoaded);
        eventBus.on('ascensionComplete', onAscensionComplete);
        eventBus.on('offlineReturn', onOfflineReturn);
        eventBus.on('userInteraction', recordInteraction);
        eventBus.on('gameTick', onGameTick);
        
        // Debug helper
        if (typeof window !== 'undefined') {
            window.__resetNarrations = (all = false) => {
                resetShownNotifications(!all);
                console.log('Narrations reset. Refresh to see first launch again.');
            };
        }
    }
    
    // ==========================================
    // RETURN
    // ==========================================
    return {
        // Initialize
        initialize,
        
        // State access (for debugging/testing)
        wasShown,
        
        // Manual triggers (for testing)
        queueNotification,
        
        // Tick-based checks (called from game loop, throttled)
        checkResourceThresholds,
        checkIdleThresholds,
        
        // Interaction tracking
        recordInteraction,
        
        // Reset
        resetShownNotifications
    };
}
