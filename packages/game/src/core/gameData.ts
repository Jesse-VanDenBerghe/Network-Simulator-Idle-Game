// Game Data Module - Re-exports from /data and /utils
// ===================================================
// Source of truth is now in:
// - src/data/nodes/ - All 70 game nodes
// - src/data/constants.ts - Game constants
// - src/data/resources.ts - Resource definitions
// - src/data/config.ts - Feature flags
// - src/utils/nodeUtils.ts - Helper functions
// This file provides backward compatibility by re-exporting everything as GameData

import { allNodes } from '@network-simulator/shared/data/nodes';
import { TIER_COST_MULTIPLIERS, BRANCH_UNLOCK_ORDER } from '@network-simulator/shared/data/constants';
import { RESOURCES } from '@network-simulator/shared/data/resources';
import { FEATURE_FLAGS } from '@network-simulator/shared/data/config';
import type { Node, NodeCost, NodeRequirement } from '@network-simulator/shared/types';
import { 
    getScaledNodeCost as getScaledNodeCostUtil,
    countUnlockedInTier as countUnlockedInTierUtil,
    isTierUnlocked as isTierUnlockedUtil,
    getConnections as getConnectionsUtil,
    checkRequirementMet as checkRequirementMetUtil,
    type ScaledCostOptions,
    type NodeConnection
} from '@network-simulator/shared/utils/nodeUtils';

class GameDataClass {
    // Configuration
    readonly FEATURE_FLAGS = FEATURE_FLAGS;
    readonly TIER_COST_MULTIPLIERS = TIER_COST_MULTIPLIERS;
    readonly BRANCH_UNLOCK_ORDER = BRANCH_UNLOCK_ORDER;
    
    // Data
    readonly resources = RESOURCES;
    readonly nodes = allNodes;
    
    /**
     * Get the cost of a node scaled by tier, ascension, prestige bonuses, and level
     */
    getScaledNodeCost(node: Node, options: ScaledCostOptions = {}): NodeCost {
        return getScaledNodeCostUtil(node, options);
    }
    
    /**
     * Count how many nodes of a specific tier are unlocked
     */
    countUnlockedInTier(tier: number, unlockedNodeIds: Set<string>): number {
        return countUnlockedInTierUtil(Number(tier), unlockedNodeIds, this.nodes);
    }
    
    /**
     * Check if a tier is unlocked
     */
    isTierUnlocked(_tier: number, _unlockedNodeIds: Set<string>): boolean {
        return isTierUnlockedUtil();
    }
    
    /**
     * Get all connections between nodes for rendering
     */
    getConnections(): NodeConnection[] {
        return getConnectionsUtil(this.nodes);
    }
    
    /**
     * Check if a single requirement is met
     */
    checkRequirementMet(
        req: NodeRequirement,
        unlockedNodes: Set<string>,
        nodeLevels: Record<string, number>
    ): boolean {
        return checkRequirementMetUtil(req, unlockedNodes, nodeLevels);
    }
}

// Create singleton instance
const GameData = new GameDataClass();

// Export as default
export default GameData;

// Also export the class for typing purposes
export type { GameDataClass };
