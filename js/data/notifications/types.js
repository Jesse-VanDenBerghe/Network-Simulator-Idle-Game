// Notification Trigger Types
// ==========================
// Constants for trigger-based notification system

/**
 * Trigger types for the notification engine
 * Each type maps to specific event data and matching logic
 */
export const TriggerType = Object.freeze({
    // One-time events
    ON_FIRST_LAUNCH: 'onFirstLaunch',           // Fires once ever (first game load)
    
    // Node-based triggers
    ON_NODE_UNLOCKED: 'onNodeUnlocked',         // { nodeId } - when node first unlocked
    ON_NODE_LEVEL_REACHED: 'onNodeLevelReached', // { nodeId, level } - specific level reached
    
    // Resource triggers (tick-based, throttled)
    ON_RESOURCE_AMOUNT_REACHED: 'onResourceAmountReached', // { resource, threshold, comparison }
    
    // Unlock triggers
    ON_BRANCH_UNLOCKED: 'onBranchUnlocked',     // { branch } - when branch becomes available
    ON_FEATURE_UNLOCKED: 'onFeatureUnlocked',   // { feature } - e.g., dataProcessing
    ON_TIER_REACHED: 'onTierReached',           // { tier } - first node of tier X unlocked
    
    // Progression triggers
    ON_ASCENSION: 'onAscension',                // { count } - on ascension (can filter by count)
    
    // Time-based triggers
    ON_OFFLINE_RETURN: 'onOfflineReturn',       // { offlineSeconds } - player returns after away
    ON_IDLE_TIME: 'onIdleTime'                  // { idleSeconds } - no interaction for X seconds
});

/**
 * Comparison operators for resource thresholds
 */
export const ComparisonOperator = Object.freeze({
    GREATER_EQUAL: '>=',
    LESS_EQUAL: '<=',
    EQUAL: '==',
    GREATER: '>',
    LESS: '<'
});

/**
 * Default values for notification config
 */
export const NotificationDefaults = Object.freeze({
    duration: 8000,
    priority: 5,
    persistAcrossAscension: false
});
