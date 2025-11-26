// useNodeValidation Composable
// =============================
// Extracted validation logic from SkillTree for reusability and testability

import GameData from '../gameData.js';
import { isBranchUnlocked } from '../utils/branchUtils.js';

// ==========================================
// PURE VALIDATION FUNCTIONS (for Options API or direct use)
// ==========================================

/**
 * Check if a node is available for unlocking
 * @param {Object} node - The node to check
 * @param {Set} unlockedNodes - Set of unlocked node IDs
 * @param {Object} nodeLevels - Map of node ID to level
 * @returns {boolean} True if node is available
 */
export function checkNodeAvailable(node, unlockedNodes, nodeLevels) {
    if (!node) return false;
    if (unlockedNodes.has(node.id)) return false;
    if (!node.requires || !Array.isArray(node.requires)) return true;
    
    return node.requires.every(req => 
        GameData.checkRequirementMet(req, unlockedNodes, nodeLevels)
    );
}

/**
 * Check if player can afford a node's cost
 * @param {Object} node - The node to check
 * @param {Object} resources - Current resources { energy, data }
 * @param {Object} options - Options for cost calculation
 * @param {Set} unlockedNodes - Set of unlocked node IDs
 * @param {Object} nodeLevels - Map of node ID to level
 * @returns {boolean} True if player can afford it
 */
export function checkCanAffordNode(node, resources, options, unlockedNodes, nodeLevels) {
    if (!node || !checkNodeAvailable(node, unlockedNodes, nodeLevels)) return false;
    
    const scaledCost = GameData.getScaledNodeCost(node, options);
    
    for (const [resource, amount] of Object.entries(scaledCost)) {
        if ((resources[resource] ?? 0) < amount) return false;
    }
    return true;
}

/**
 * Check if a tier is locked for a node
 * @param {Object} node - The node to check
 * @param {Set} unlockedNodes - Set of unlocked node IDs
 * @returns {boolean} True if tier is locked
 */
export function checkTierLocked(node, unlockedNodes) {
    if (!node) return true;
    return !GameData.isTierUnlocked(node.tier, unlockedNodes);
}

/**
 * Check if a node is visible (should be rendered)
 * @param {Object} node - The node to check
 * @param {Set} unlockedNodes - Set of unlocked node IDs
 * @param {Set} unlockedBranches - Set of unlocked branch names
 * @param {Object} nodeLevels - Map of node ID to level
 * @returns {boolean} True if node should be visible
 */
export function checkNodeVisible(node, unlockedNodes, unlockedBranches, nodeLevels) {
    if (!node) return false;
    
    // Tier gate nodes are visible even if branch isn't unlocked (they unlock the branch)
    if (!node.isTierGate) {
        if (!isBranchUnlocked(node.branch, unlockedBranches)) {
            return false;
        }
    }
    
    return unlockedNodes.has(node.id) || checkNodeAvailable(node, unlockedNodes, nodeLevels);
}

// ==========================================
// COMPOSABLE (for Composition API components)
// ==========================================

/**
 * Provides node validation utilities as reactive composable
 * @param {Object} gameState - Game state from useGameState
 * @param {Object} prestigeState - Prestige state from usePrestigeState
 * @returns {Object} Validation methods
 */
export function useNodeValidation(gameState, prestigeState) {
    function isNodeAvailable(node) {
        return checkNodeAvailable(node, gameState.unlockedNodes.value, gameState.nodeLevels);
    }

    function canAffordNode(node) {
        return checkCanAffordNode(
            node,
            gameState.resources,
            {
                ascensionCount: prestigeState?.ascensionCount?.value ?? 0,
                prestigeBonuses: prestigeState?.prestigeBonuses?.value ?? null
            },
            gameState.unlockedNodes.value,
            gameState.nodeLevels
        );
    }

    function isNodeUnlocked(nodeId) {
        return gameState.unlockedNodes.value.has(nodeId);
    }

    function isTierLocked(node) {
        return checkTierLocked(node, gameState.unlockedNodes.value);
    }

    function isNodeVisible(node) {
        return checkNodeVisible(
            node,
            gameState.unlockedNodes.value,
            gameState.unlockedBranches.value,
            gameState.nodeLevels
        );
    }

    return {
        isNodeAvailable,
        canAffordNode,
        isNodeUnlocked,
        isTierLocked,
        isNodeVisible
    };
}
