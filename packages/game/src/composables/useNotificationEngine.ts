// useNotificationEngine Composable
// =================================
// Centralized notification engine that triggers messages based on game events
// Uses indexed lookups for O(1) event handling, persists shown state

import { TriggerType, ComparisonOperator } from '@network-simulator/shared/types/notification';
import type { Notification } from '@network-simulator/shared/types/notification';
import { NotificationType, DisabledNotificationTypes } from '@network-simulator/shared/data/notifications/constants';
import type { EventMap } from '@network-simulator/shared/types/event';
import { getAllNotifications } from '@network-simulator/shared/data/notifications';

const SHOWN_NOTIFICATIONS_KEY = 'networkSimShownNotifications';
const NOTIFICATION_QUEUE_DELAY_MS = 500;
const SAVE_DEBOUNCE_MS = 1000;
const TICK_THROTTLE_MS = 500;  // Check resource/idle thresholds every 500ms

/**
 * Event bus interface (minimal typing)
 */
interface EventBus {
    on<K extends keyof EventMap>(eventName: K, callback: (data: EventMap[K]) => void): () => void;
    emit<K extends keyof EventMap>(eventName: K, data: EventMap[K]): void;
}

/**
 * Notification defaults
 */
const NotificationDefaults = {
    duration: 8000,
    priority: 5
};

/**
 * Indexed notification structure
 */
interface NotificationIndex {
    [TriggerType.ON_NODE_UNLOCKED]: Map<string, Notification[]>;
    [TriggerType.ON_NODE_LEVEL_REACHED]: Map<string, Notification[]>;
    [TriggerType.ON_BRANCH_UNLOCKED]: Map<string, Notification[]>;
    [TriggerType.ON_FEATURE_UNLOCKED]: Map<string, Notification[]>;
    [TriggerType.ON_TIER_REACHED]: Map<string, Notification[]>;
    [TriggerType.ON_FIRST_LAUNCH]: Notification[];
    [TriggerType.ON_ASCENSION]: Notification[];
    [TriggerType.ON_OFFLINE_RETURN]: Notification[];
    [TriggerType.ON_RESOURCE_AMOUNT_REACHED]: Record<string, Notification[]>;
    [TriggerType.ON_IDLE_TIME]: Notification[];
}

/**
 * Build indexed notification maps for O(1) lookups
 */
function buildNotificationIndex(notifications: Notification[]): NotificationIndex {
    const index: any = {
        [TriggerType.ON_NODE_UNLOCKED]: new Map(),
        [TriggerType.ON_NODE_LEVEL_REACHED]: new Map(),
        [TriggerType.ON_BRANCH_UNLOCKED]: new Map(),
        [TriggerType.ON_FEATURE_UNLOCKED]: new Map(),
        [TriggerType.ON_TIER_REACHED]: new Map(),
        [TriggerType.ON_FIRST_LAUNCH]: [],
        [TriggerType.ON_ASCENSION]: [],
        [TriggerType.ON_OFFLINE_RETURN]: [],
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
                const key = (trigger as any).nodeId;
                if (!index[trigger.type].has(key)) {
                    index[trigger.type].set(key, []);
                }
                index[trigger.type].get(key).push(notification);
                break;
            }
            
            case TriggerType.ON_NODE_LEVEL_REACHED: {
                const key = `${(trigger as any).nodeId}:${(trigger as any).level}`;
                if (!index[trigger.type].has(key)) {
                    index[trigger.type].set(key, []);
                }
                index[trigger.type].get(key).push(notification);
                break;
            }
            
            case TriggerType.ON_BRANCH_UNLOCKED:
            case TriggerType.ON_FEATURE_UNLOCKED: {
                const key = (trigger as any).branch || (trigger as any).feature;
                if (!index[trigger.type].has(key)) {
                    index[trigger.type].set(key, []);
                }
                index[trigger.type].get(key).push(notification);
                break;
            }
            
            case TriggerType.ON_TIER_REACHED: {
                const key = String((trigger as any).tier);
                if (!index[trigger.type].has(key)) {
                    index[trigger.type].set(key, []);
                }
                index[trigger.type].get(key).push(notification);
                break;
            }
            
            case TriggerType.ON_RESOURCE_AMOUNT_REACHED: {
                const resource = (trigger as any).resource || 'energy';
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
    
    // Sort resource thresholds by threshold value
    for (const resource of ['energy', 'data', 'bandwidth']) {
        index[TriggerType.ON_RESOURCE_AMOUNT_REACHED][resource].sort(
            (a: Notification, b: Notification) => ((a.trigger as any).threshold || 0) - ((b.trigger as any).threshold || 0)
        );
    }
    
    // Sort idle time triggers
    index[TriggerType.ON_IDLE_TIME].sort(
        (a: Notification, b: Notification) => ((a.trigger as any).idleSeconds || 0) - ((b.trigger as any).idleSeconds || 0)
    );
    
    return index;
}

/**
 * Check if a resource comparison matches
 */
function checkComparison(current: number, comparison: string | undefined, threshold: number): boolean {
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

/**
 * Return type for useNotificationEngine composable
 */
export interface UseNotificationEngineReturn {
    initialize: () => void;
    wasShown: (id: string) => boolean;
    queueNotification: (notification: Notification) => void;
    checkResourceThresholds: (resources: Record<string, number>) => void;
    checkIdleThresholds: () => void;
    recordInteraction: () => void;
    resetShownNotifications: (persistentOnly?: boolean) => void;
}

export function useNotificationEngine(eventBus: EventBus): UseNotificationEngineReturn {
    // ==========================================
    // STATE
    // ==========================================
    
    let shownNotifications = new Set<string>();
    let notificationIndex: NotificationIndex | null = null;
    let allNotifications: Notification[] = [];
    let notificationQueue: Notification[] = [];
    let isProcessingQueue = false;
    let saveTimeout: ReturnType<typeof setTimeout> | null = null;
    let lastTickCheck = 0;
    const triggeredTiers = new Set<string>();
    const triggeredThresholds: Record<string, Set<string>> = {
        energy: new Set(),
        data: new Set(),
        bandwidth: new Set()
    };
    let lastInteractionTime = Date.now();
    let triggeredIdleThresholds = new Set<string>();
    
    // ==========================================
    // PERSISTENCE
    // ==========================================
    
    function loadShownState(): void {
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
    
    function saveShownState(): void {
        if (saveTimeout) return;
        
        saveTimeout = setTimeout(() => {
            try {
                localStorage.setItem(
                    SHOWN_NOTIFICATIONS_KEY,
                    JSON.stringify([...shownNotifications])
                );
            } catch (e: any) {
                if (e.name === 'QuotaExceededError') {
                    console.warn('Storage quota exceeded - shown notifications not saved');
                } else {
                    console.error('Failed to save shown notifications:', e);
                }
            }
            saveTimeout = null;
        }, SAVE_DEBOUNCE_MS);
    }
    
    function markShown(id: string): void {
        shownNotifications.add(id);
        saveShownState();
    }
    
    function wasShown(id: string): boolean {
        return shownNotifications.has(id);
    }
    
    function resetShownNotifications(persistentOnly: boolean = false): void {
        if (persistentOnly) {
            for (const notification of allNotifications) {
                if (!notification.persistAcrossAscension) {
                    shownNotifications.delete(notification.id);
                }
            }
        } else {
            shownNotifications.clear();
        }
        
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
    
    function queueNotification(notification: Notification): void {
        if (wasShown(notification.id)) return;
        
        // Skip disabled notification types
        if (DisabledNotificationTypes.has(notification.type || NotificationType.NARRATION)) return;
        
        notificationQueue.push(notification);
        notificationQueue.sort((a, b) => 
            (b.priority || NotificationDefaults.priority) - 
            (a.priority || NotificationDefaults.priority)
        );
        
        processQueue();
    }
    
    function processQueue(): void {
        if (isProcessingQueue || notificationQueue.length === 0) return;
        
        isProcessingQueue = true;
        
        const notification = notificationQueue.shift()!;
        markShown(notification.id);
        
        const displayDelay = (notification as any).delay || 0;
        
        setTimeout(() => {
            eventBus.emit('notificationShown', {
                notification: {
                    id: notification.id,
                    message: notification.message,
                    type: notification.type || NotificationType.NARRATION,
                    duration: notification.duration || NotificationDefaults.duration
                } as any
            });
        }, displayDelay);
        
        setTimeout(() => {
            isProcessingQueue = false;
            processQueue();
        }, displayDelay + NOTIFICATION_QUEUE_DELAY_MS);
    }
    
    // ==========================================
    // EVENT HANDLERS
    // ==========================================
    
    function onNodeUnlocked({ node, level }: any): void {
        if (!notificationIndex) return;
        
        const isUpgrade = level > 1;
        
        if (!isUpgrade) {
            const nodeNotifications = notificationIndex[TriggerType.ON_NODE_UNLOCKED].get(node.id);
            if (nodeNotifications) {
                for (const n of nodeNotifications) {
                    queueNotification(n);
                }
            }
            
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
        
        const levelKey = `${node.id}:${level}`;
        const levelNotifications = notificationIndex[TriggerType.ON_NODE_LEVEL_REACHED].get(levelKey);
        if (levelNotifications) {
            for (const n of levelNotifications) {
                queueNotification(n);
            }
        }
    }
    
    function onBranchUnlocked({ branch }: any): void {
        if (!notificationIndex) return;
        const notifications = notificationIndex[TriggerType.ON_BRANCH_UNLOCKED].get(branch);
        if (notifications) {
            for (const n of notifications) {
                queueNotification(n);
            }
        }
    }
    
    function onFeatureUnlocked({ feature }: any): void {
        if (!notificationIndex) return;
        const notifications = notificationIndex[TriggerType.ON_FEATURE_UNLOCKED].get(feature);
        if (notifications) {
            for (const n of notifications) {
                queueNotification(n);
            }
        }
    }
    
    function onGameLoaded({ saveExists }: any = {}): void {
        if (!notificationIndex) return;
        if (!saveExists) {
            const notifications = notificationIndex[TriggerType.ON_FIRST_LAUNCH];
            for (const n of notifications) {
                queueNotification(n);
            }
        }
    }
    
    function onAscensionComplete({ ascensionCount }: any = {}): void {
        if (!notificationIndex) return;
        resetShownNotifications(true);
        
        const notifications = notificationIndex[TriggerType.ON_ASCENSION];
        for (const n of notifications) {
            if ((n.trigger as any).count === undefined || (n.trigger as any).count === ascensionCount) {
                queueNotification(n);
            }
        }
    }
    
    function recordInteraction(): void {
        lastInteractionTime = Date.now();
        triggeredIdleThresholds.clear();
    }
    
    function checkResourceThresholds(resources: Record<string, number>): void {
        if (!notificationIndex) return;
        
        for (const resource of ['energy', 'data', 'bandwidth']) {
            const current = resources[resource] || 0;
            const thresholds = notificationIndex[TriggerType.ON_RESOURCE_AMOUNT_REACHED][resource];
            
            if (!thresholds || thresholds.length === 0) continue;
            
            for (const n of thresholds) {
                if (triggeredThresholds[resource].has(n.id)) continue;
                
                const { threshold, comparison } = n.trigger as any;
                
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
    
    function checkIdleThresholds(): void {
        if (!notificationIndex) return;
        
        const idleSeconds = (Date.now() - lastInteractionTime) / 1000;
        const thresholds = notificationIndex[TriggerType.ON_IDLE_TIME];
        
        for (const n of thresholds) {
            if (triggeredIdleThresholds.has(n.id)) continue;
            
            if (idleSeconds >= ((n.trigger as any).idleSeconds || 0)) {
                triggeredIdleThresholds.add(n.id);
                queueNotification(n);
            }
        }
    }
    
    function onGameTick(_data: any): void {
        const now = Date.now();
        if (now - lastTickCheck < TICK_THROTTLE_MS) return;
        lastTickCheck = now;
        
        // Note: Resources would be passed via event - simplified here
        checkIdleThresholds();
    }
    
    // ==========================================
    // INITIALIZATION
    // ==========================================
    
    function initialize(): void {
        loadShownState();
        allNotifications = getAllNotifications();
        notificationIndex = buildNotificationIndex(allNotifications);
        
        eventBus.on('nodeUnlocked', onNodeUnlocked);
        eventBus.on('branchUnlocked', onBranchUnlocked);
        eventBus.on('featureUnlocked', onFeatureUnlocked);
        eventBus.on('gameLoaded', onGameLoaded);
        eventBus.on('ascension', onAscensionComplete);
        eventBus.on('gameTick', onGameTick);
        
        // Debug helper
        if (typeof window !== 'undefined') {
            (window as any).__resetNarrations = (all: boolean = false) => {
                resetShownNotifications(!all);
                console.log('Narrations reset. Refresh to see first launch again.');
            };
        }
    }
    
    return {
        initialize,
        wasShown,
        queueNotification,
        checkResourceThresholds,
        checkIdleThresholds,
        recordInteraction,
        resetShownNotifications
    };
}
