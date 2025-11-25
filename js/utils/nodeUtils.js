// Node Utilities
// ===============

import { TIER_COST_MULTIPLIERS, TIER_GATES } from '../data/constants.js';

/**
 * Get the cost of a node scaled by its tier multiplier and prestige bonuses
 * @param {Object} node - The node object
 * @param {number} ascensionCount - Current ascension count (unused, kept for compatibility)
 * @param {Object} prestigeBonuses - Prestige bonuses object (optional)
 * @returns {Object} The scaled cost object { resource: amount }
 */
export function getScaledNodeCost(node, ascensionCount = 0, prestigeBonuses = null) {
    const baseCost = node.cost;
    const tierMultiplier = TIER_COST_MULTIPLIERS[node.tier] || 1;
    
    // Prestige cost reduction
    let costReduction = 1;
    if (prestigeBonuses) {
        // Apply general cost multiplier
        if (prestigeBonuses.costMultiplier) {
            costReduction *= prestigeBonuses.costMultiplier;
        }
        // Apply tier-specific cost multipliers
        if (prestigeBonuses.tierCostMultipliers && prestigeBonuses.tierCostMultipliers[node.tier]) {
            costReduction *= prestigeBonuses.tierCostMultipliers[node.tier];
        }
    }
    
    const scaled = {};
    for (const [resource, amount] of Object.entries(baseCost)) {
        const finalCost = amount * tierMultiplier * costReduction;
        scaled[resource] = Math.floor(finalCost);
    }
    return scaled;
}

/**
 * Count how many nodes of a specific tier are unlocked
 * @param {number} tier - The tier to count
 * @param {Set<string>} unlockedNodeIds - Set of unlocked node IDs
 * @param {Object} nodesData - All nodes data
 * @returns {number} The count of unlocked nodes in that tier
 */
export function countUnlockedInTier(tier, unlockedNodeIds, nodesData) {
    let count = 0;
    unlockedNodeIds.forEach(id => {
        const node = nodesData[id];
        if (node && node.tier === tier) {
            count++;
        }
    });
    return count;
}

/**
 * Check if a tier is unlocked based on gate requirements
 * @param {number} tier - The tier to check
 * @param {Set<string>} unlockedNodeIds - Set of unlocked node IDs
 * @param {Object} nodesData - All nodes data
 * @returns {boolean} True if the tier is unlocked
 */
export function isTierUnlocked(tier, unlockedNodeIds, nodesData) {
    const gate = TIER_GATES[tier];
    if (!gate) return true;
    
    const count = countUnlockedInTier(gate.requiredTier, unlockedNodeIds, nodesData);
    return count >= gate.requiredCount;
}

/**
 * Get all connections between nodes for rendering
 * @param {Object} nodesData - All nodes data
 * @returns {Array} Array of connection objects with from/to/coordinates
 */
export function getConnections(nodesData) {
    const connections = [];
    Object.values(nodesData).forEach(node => {
        node.requires.forEach(reqId => {
            const reqNode = nodesData[reqId];
            if (reqNode) {
                connections.push({
                    from: reqId,
                    to: node.id,
                    x1: reqNode.x + 40,
                    y1: reqNode.y + 40,
                    x2: node.x + 40,
                    y2: node.y + 40
                });
            }
        });
    });
    return connections;
}
