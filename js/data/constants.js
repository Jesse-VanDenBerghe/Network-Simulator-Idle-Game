// Game Constants
// ===============

/**
 * Branch unlock order and tier mapping
 */
export const BRANCH_UNLOCK_ORDER = [
    'energy',
    'computer'
];

/**
 * Cost multipliers per tier - exponential scaling
 */
export const TIER_COST_MULTIPLIERS = {
    0: 1,      
    1: 1,      
    2: 10,     
    3: 100,     
    4: 1_000,    
    5: 10_000,   
    6: 100_000,  
    7: 1_000_000, 
    8: 10_000_000 
};

export const COST_SHIFT_FOR_RESOURCE = {
    energy: 1,
    data: 2,
    bandwidth: -4
}

/**
 * Timing constants for game loop and saves
 */
export const GAME_LOOP_INTERVAL_MS = 100;       // 10 ticks per second
export const AUTOSAVE_INTERVAL_MS = 30_000;     // Save every 30 seconds
export const MAX_OFFLINE_TIME_S = 86_400;       // 24 hours max offline progress

export const NotificationType = Object.freeze({
    INFO: 'info',
    ERROR: 'error',
    SUCCESS: 'success',
    NARRATION: 'narration',
    NODE_UNLOCK: 'node_unlock'
});

export const DisabledNotificationTypes = new Set([
    NotificationType.NODE_UNLOCK
]);