// Game Constants
// ===============

/**
 * Cost multipliers per tier - exponential scaling
 */
export const TIER_COST_MULTIPLIERS = {
    0: 1,      // Core
    1: 1,      // 10-25 energy
    2: 10,     // 100-300 energy
    3: 50,     // 500-2,000 energy
    4: 500,    // 5K-20K energy
    5: 5000,   // 50K-200K energy
    6: 50000,  // 500K-2M energy
    7: 500000  // 10M-50M energy
};

/**
 * Gate requirements for unlocking new tiers
 * Format: { requiredTier: X, requiredCount: Y }
 * Meaning: Need Y nodes from tier X unlocked to access this tier
 */
export const TIER_GATES = {
    3: { requiredTier: 2, requiredCount: 3 },
    4: { requiredTier: 3, requiredCount: 6 },
    5: { requiredTier: 4, requiredCount: 10 },
    6: { requiredTier: 5, requiredCount: 15 },
    7: { requiredTier: 6, requiredCount: 20 }
};
