// Notification System Type Definitions
// =====================================

/**
 * Notification display types
 */
export enum NotificationType {
    NARRATION = 'narration',
    HINT = 'hint',
    ACHIEVEMENT = 'achievement',
    TERMINAL = 'terminal'
}

/**
 * Trigger types for conditional notifications
 */
export enum TriggerType {
    // One-time events
    ON_FIRST_LAUNCH = 'onFirstLaunch',
    
    // Node-based triggers
    ON_NODE_UNLOCKED = 'onNodeUnlocked',
    ON_NODE_LEVEL_REACHED = 'onNodeLevelReached',
    
    // Resource triggers
    ON_RESOURCE_AMOUNT_REACHED = 'onResourceAmountReached',
    
    // Unlock triggers
    ON_BRANCH_UNLOCKED = 'onBranchUnlocked',
    ON_FEATURE_UNLOCKED = 'onFeatureUnlocked',
    ON_TIER_REACHED = 'onTierReached',
    
    // Progression triggers
    ON_ASCENSION = 'onAscension',
    
    // Time-based triggers
    ON_OFFLINE_RETURN = 'onOfflineReturn',
    ON_IDLE_TIME = 'onIdleTime'
}

/**
 * Comparison operators for resource thresholds
 */
export enum ComparisonOperator {
    GREATER_EQUAL = '>=',
    LESS_EQUAL = '<=',
    EQUAL = '==',
    GREATER = '>',
    LESS = '<'
}

/**
 * Base trigger configuration
 */
export interface BaseTrigger {
    type: TriggerType;
}

/**
 * Node unlock trigger
 */
export interface NodeUnlockedTrigger extends BaseTrigger {
    type: TriggerType.ON_NODE_UNLOCKED;
    nodeId: string;
}

/**
 * Node level trigger
 */
export interface NodeLevelTrigger extends BaseTrigger {
    type: TriggerType.ON_NODE_LEVEL_REACHED;
    nodeId: string;
    level: number;
}

/**
 * Resource threshold trigger
 */
export interface ResourceTrigger extends BaseTrigger {
    type: TriggerType.ON_RESOURCE_AMOUNT_REACHED;
    resource: 'energy' | 'data';
    threshold: number;
    comparison: ComparisonOperator;
}

/**
 * Branch unlock trigger
 */
export interface BranchUnlockedTrigger extends BaseTrigger {
    type: TriggerType.ON_BRANCH_UNLOCKED;
    branch: string;
}

/**
 * Feature unlock trigger
 */
export interface FeatureUnlockedTrigger extends BaseTrigger {
    type: TriggerType.ON_FEATURE_UNLOCKED;
    feature: string;
}

/**
 * Tier reached trigger
 */
export interface TierReachedTrigger extends BaseTrigger {
    type: TriggerType.ON_TIER_REACHED;
    tier: number;
}

/**
 * Ascension trigger
 */
export interface AscensionTrigger extends BaseTrigger {
    type: TriggerType.ON_ASCENSION;
    count?: number; // Optional: trigger on specific ascension count
}

/**
 * Offline return trigger
 */
export interface OfflineReturnTrigger extends BaseTrigger {
    type: TriggerType.ON_OFFLINE_RETURN;
    minOfflineSeconds: number;
}

/**
 * Idle time trigger
 */
export interface IdleTimeTrigger extends BaseTrigger {
    type: TriggerType.ON_IDLE_TIME;
    idleSeconds: number;
}

/**
 * First launch trigger (no additional properties)
 */
export interface FirstLaunchTrigger extends BaseTrigger {
    type: TriggerType.ON_FIRST_LAUNCH;
}

/**
 * Union of all trigger types
 */
export type NotificationTrigger =
    | FirstLaunchTrigger
    | NodeUnlockedTrigger
    | NodeLevelTrigger
    | ResourceTrigger
    | BranchUnlockedTrigger
    | FeatureUnlockedTrigger
    | TierReachedTrigger
    | AscensionTrigger
    | OfflineReturnTrigger
    | IdleTimeTrigger;

/**
 * Notification definition
 */
export interface Notification {
    id: string;
    type: NotificationType;
    trigger: NotificationTrigger;
    message: string;
    duration: number; // milliseconds
    persistAcrossAscension: boolean;
    priority: number; // Higher = shown first if multiple match
    delay?: number; // Optional delay before showing (milliseconds)
}

/**
 * Notification display state
 */
export interface NotificationDisplay {
    id: string;
    type: NotificationType;
    message: string;
    duration: number;
    timestamp: number;
}

/**
 * Notification history entry
 */
export interface NotificationHistoryEntry {
    id: string;
    type: NotificationType;
    message: string;
    timestamp: number;
    read: boolean;
}

/**
 * Notification engine state
 */
export interface NotificationState {
    shownNotifications: Set<string>;
    history: NotificationHistoryEntry[];
    activeNotifications: NotificationDisplay[];
}

/**
 * Notification duration presets (milliseconds)
 */
export const NotificationDurations = {
    NARRATION_SHORT: 5000,
    NARRATION_MEDIUM: 8000,
    NARRATION_LONG: 12000,
    HINT_SHORT: 4000,
    HINT_MEDIUM: 6000,
    ACHIEVEMENT: 5000,
    TERMINAL: 10000
} as const;
