// Branch Utilities
// =================
// Functions for managing branch-based progression

import { BRANCH_UNLOCK_ORDER, BRANCH_UNLOCK_TIER } from '../data/constants.js';

/**
 * Get all currently unlocked branches based on tier gate nodes
 * @param {Set<string>} unlockedNodeIds - Set of unlocked node IDs
 * @param {Object} nodesData - All nodes data
 * @returns {Set<string>} Set of branch names that are unlocked
 */
export function getUnlockedBranches(unlockedNodeIds, nodesData) {
    const unlockedBranches = new Set();
    
    // Always unlock the first branch (power) when starting
    unlockedBranches.add('power');
    
    // Check each tier gate to see if it's unlocked
    unlockedNodeIds.forEach(nodeId => {
        const node = nodesData[nodeId];
        if (node && node.isTierGate) {
            // Find which branch this tier gate unlocks (the next one in order)
            const currentBranchIndex = BRANCH_UNLOCK_ORDER.indexOf(node.branch);
            if (currentBranchIndex >= 0 && currentBranchIndex < BRANCH_UNLOCK_ORDER.length - 1) {
                const nextBranch = BRANCH_UNLOCK_ORDER[currentBranchIndex + 1];
                unlockedBranches.add(nextBranch);
            }
        }
    });
    
    return unlockedBranches;
}

/**
 * Check if a specific branch is unlocked
 * @param {string} branch - Branch name to check
 * @param {Set<string>} unlockedNodeIds - Set of unlocked node IDs
 * @param {Object} nodesData - All nodes data
 * @returns {boolean} True if the branch is unlocked
 */
export function isBranchUnlocked(branch, unlockedNodeIds, nodesData) {
    if (!branch) return true; // Core node has no branch
    
    const unlockedBranches = getUnlockedBranches(unlockedNodeIds, nodesData);
    return unlockedBranches.has(branch);
}

/**
 * Get the next branch that can be unlocked
 * @param {Set<string>} unlockedNodeIds - Set of unlocked node IDs
 * @param {Object} nodesData - All nodes data
 * @returns {string|null} The next branch to unlock, or null if all unlocked
 */
export function getNextBranchToUnlock(unlockedNodeIds, nodesData) {
    const unlockedBranches = getUnlockedBranches(unlockedNodeIds, nodesData);
    
    for (const branch of BRANCH_UNLOCK_ORDER) {
        if (!unlockedBranches.has(branch)) {
            return branch;
        }
    }
    
    return null; // All branches unlocked
}

/**
 * Get the maximum tier available for a given branch
 * @param {string} branch - Branch name
 * @param {Set<string>} unlockedNodeIds - Set of unlocked node IDs
 * @param {Object} nodesData - All nodes data
 * @returns {number} The maximum tier that is unlocked for this branch
 */
export function getMaxTierForBranch(branch, unlockedNodeIds, nodesData) {
    if (!branch) return 0; // Core
    
    const branchStartTier = BRANCH_UNLOCK_TIER[branch];
    if (!branchStartTier) return 0;
    
    // Find the highest tier gate that has been unlocked for this branch
    let maxTier = branchStartTier;
    
    unlockedNodeIds.forEach(nodeId => {
        const node = nodesData[nodeId];
        if (node && node.isTierGate && node.branch === branch) {
            // This branch's tier gate is unlocked, so the branch can progress to the next tier
            maxTier = node.tier + 1;
        }
    });
    
    return maxTier;
}

// Export to global scope for use by non-module scripts
if (typeof window !== 'undefined') {
    window.BranchUtils = {
        getUnlockedBranches,
        isBranchUnlocked,
        getNextBranchToUnlock,
        getMaxTierForBranch
    };
}
