// useNodeValidation Composable
// =============================
// Extracted validation logic from SkillTree for reusability and testability

import type { Node } from 'packages/shared/src/types/node';
import type { ResourceAmounts } from '@/types/game';
import type { UseGameStateReturn } from './useGameState';
import type { UsePrestigeStateReturn } from './usePrestigeState';
import GameData from '@/core/gameData';

/**
 * Options for cost calculation
 */
interface CostOptions {
    ascensionCount: number;
    prestigeBonuses: any;
}

// ==========================================
// PURE VALIDATION FUNCTIONS (for Options API or direct use)
// ==========================================

/**
 * Check if a node is available for unlocking
 * @param node - The node to check
 * @param unlockedNodes - Set of unlocked node IDs
 * @param nodeLevels - Map of node ID to level
 * @returns True if node is available
 */
export function checkNodeAvailable(
    node: Node | null,
    unlockedNodes: Set<string>,
    nodeLevels: Record<string, number>
): boolean {
    if (!node) return false;
    if (unlockedNodes.has(node.id)) return false;
    if (!node.requires || !Array.isArray(node.requires)) return true;
    
    return node.requires.every(req => 
        GameData.checkRequirementMet(req, unlockedNodes, nodeLevels)
    );
}

/**
 * Check if player can afford a node's cost
 * @param node - The node to check
 * @param resources - Current resources
 * @param options - Options for cost calculation
 * @param unlockedNodes - Set of unlocked node IDs
 * @param nodeLevels - Map of node ID to level
 * @returns True if player can afford it
 */
export function checkCanAffordNode(
    node: Node | null,
    resources: ResourceAmounts,
    options: CostOptions,
    unlockedNodes: Set<string>,
    nodeLevels: Record<string, number>
): boolean {
    if (!node || !checkNodeAvailable(node, unlockedNodes, nodeLevels)) return false;
    
    const scaledCost = GameData.getScaledNodeCost(node, options);
    
        for (const [resource, amount] of Object.entries(scaledCost)) {
        if ((resources[resource as keyof ResourceAmounts] ?? 0) < (amount as number)) return false;
    }
    return true;
}

/**
 * Check if a tier is locked for a node
 * @param node - The node to check
 * @param unlockedNodes - Set of unlocked node IDs
 * @returns True if tier is locked
 */
export function checkTierLocked(node: Node | null, unlockedNodes: Set<string>): boolean {
    if (!node) return true;
    return !GameData.isTierUnlocked(node.tier, unlockedNodes);
}

/**
 * Check if a node is visible (should be rendered)
 * @param node - The node to check
 * @param unlockedNodes - Set of unlocked node IDs
 * @param unlockedBranches - Set of unlocked branch names
 * @param nodeLevels - Map of node ID to level
 * @returns True if node should be visible
 */
export function checkNodeVisible(
    node: Node | null,
    unlockedNodes: Set<string>,
    unlockedBranches: Set<string>,
    nodeLevels: Record<string, number>
): boolean {
    if (!node) return false;
    
    // Tier gate nodes are visible even if branch isn't unlocked (they unlock the branch)
    if (!node.isTierGate) {
        // TODO: Import isBranchUnlocked from @/utils/branchUtils once migrated in Phase 6
        // For now, simple check
        if (node.branch && !unlockedBranches.has(node.branch)) {
            return false;
        }
    }
    
    return unlockedNodes.has(node.id) || checkNodeAvailable(node, unlockedNodes, nodeLevels);
}

// ==========================================
// COMPOSABLE (for Composition API components)
// ==========================================

/**
 * Return type for useNodeValidation composable
 */
export interface UseNodeValidationReturn {
    isNodeAvailable: (node: Node | null) => boolean;
    canAffordNode: (node: Node | null) => boolean;
    isNodeUnlocked: (nodeId: string) => boolean;
    isTierLocked: (node: Node | null) => boolean;
    isNodeVisible: (node: Node | null) => boolean;
}

/**
 * Provides node validation utilities as reactive composable
 * @param gameState - Game state from useGameState
 * @param prestigeState - Prestige state from usePrestigeState
 * @returns Validation methods
 */
export function useNodeValidation(
    gameState: UseGameStateReturn,
    prestigeState?: UsePrestigeStateReturn
): UseNodeValidationReturn {
    function isNodeAvailable(node: Node | null): boolean {
        return checkNodeAvailable(node, gameState.unlockedNodes.value, gameState.nodeLevels);
    }

    function canAffordNode(node: Node | null): boolean {
        return checkCanAffordNode(
            node,
            gameState.resources,
            {
                ascensionCount: prestigeState?.prestigeState?.ascensionCount ?? 0,
                prestigeBonuses: prestigeState?.prestigeBonuses?.value ?? null
            },
            gameState.unlockedNodes.value,
            gameState.nodeLevels
        );
    }

    function isNodeUnlocked(nodeId: string): boolean {
        return gameState.unlockedNodes.value.has(nodeId);
    }

    function isTierLocked(node: Node | null): boolean {
        return checkTierLocked(node, gameState.unlockedNodes.value);
    }

    function isNodeVisible(node: Node | null): boolean {
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
