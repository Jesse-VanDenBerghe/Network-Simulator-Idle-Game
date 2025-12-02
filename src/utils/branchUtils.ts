// Branch Utilities
// =================
// Functions for managing branch-based progression

import { BRANCH_UNLOCK_ORDER } from '@/data/constants';

/**
 * Check if a specific branch is unlocked
 */
export function isBranchUnlocked(branch: string | undefined, unlockedBranches: Set<string>): boolean {
    if (!branch) return true; // Core node has no branch
    return unlockedBranches.has(branch);
}

/**
 * Get the next branch that can be unlocked
 */
export function getNextBranchToUnlock(unlockedBranches: Set<string>): string | null {
    for (const branch of BRANCH_UNLOCK_ORDER) {
        if (!unlockedBranches.has(branch)) {
            return branch;
        }
    }
    return null;
}
