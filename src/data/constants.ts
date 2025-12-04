// Game Constants
// ===============

import type { ResourceId } from '../types/game';

/**
 * Branch unlock order and tier mapping
 */
export const BRANCH_UNLOCK_ORDER: readonly string[] = [
    'energy',
    'computer'
] as const;

/**
 * Cost multipliers per tier - exponential scaling
 */
export const TIER_COST_MULTIPLIERS: Record<number, number> = {
    0: 1,      
    1: 1,      
    2: 10,     
    3: 100,     
    4: 1_000,    
    5: 10_000,   
    6: 100_000,  
    7: 1_000_000, 
    8: 10_000_000 
} as const;

export const COST_SHIFT_FOR_RESOURCE: Record<ResourceId, number> = {
    energy: 1,
    data: 2
} as const;

/**
 * Timing constants for game loop and saves
 */
export const GAME_LOOP_INTERVAL_MS = 100;       // 10 ticks per second
export const AUTOSAVE_INTERVAL_MS = 30_000;     // Save every 30 seconds
export const MAX_OFFLINE_TIME_S = 86_400;       // 24 hours max offline progress

/**
 * Layout configuration for skill tree positioning
 */
export const LAYOUT_CONFIG = Object.freeze({
    CENTER_X: 1400,
    CENTER_Y: 1400,
    TIER_SPACING: 180,
    SAME_TIER_OFFSET: 60,
    NODE_SPACING: 100,
    NODE_SIZE: 80
});
