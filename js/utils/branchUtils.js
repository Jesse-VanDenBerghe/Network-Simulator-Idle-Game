// Branch Utilities
// =================
// Functions for managing branch-based progression

import { BRANCH_UNLOCK_ORDER } from '../data/constants.js';

/**
 * Check if a specific branch is unlocked
 * @param {string} branch - Branch name to check
 * @param {Set<string>} unlockedBranches - Set of unlocked branch names
 * @returns {boolean} True if the branch is unlocked
 */
export function isBranchUnlocked(branch, unlockedBranches) {
    if (!branch) return true; // Core node has no branch
    return unlockedBranches.has(branch);
}

/**
 * Get the next branch that can be unlocked
 * @param {Set<string>} unlockedBranches - Set of unlocked branch names
 * @returns {string|null} The next branch to unlock, or null if all unlocked
 */
export function getNextBranchToUnlock(unlockedBranches) {
    for (const branch of BRANCH_UNLOCK_ORDER) {
        if (!unlockedBranches.has(branch)) {
            return branch;
        }
    }
    return null;
}

// Export to global scope for use by non-module scripts
if (typeof window !== 'undefined') {
    window.BranchUtils = {
        isBranchUnlocked,
        getNextBranchToUnlock
    };
}
