// Node Utilities
// ===============

import { TIER_COST_MULTIPLIERS, COST_SHIFT_FOR_RESOURCE } from '../data/constants.js';
import { ASCENSION_COST_MULTIPLIER } from '../data/config.js';

/**
 * Get tier multiplier for a resource, shifted by COST_SHIFT_FOR_RESOURCE
 * e.g. data at tier 3 with shift 2 => uses multiplier for tier 1
 */
function getTierMultiplierForResource(tier, resource) {
    const shift = COST_SHIFT_FOR_RESOURCE[resource] || 0;
    const effectiveTier = Math.max(0, tier - shift);
    return TIER_COST_MULTIPLIERS[effectiveTier] || 1;
}

/**
 * Get the cost of a node scaled by its tier multiplier, ascension count, prestige bonuses, and level
 * @param {Object} node - The node object
 * @param {number} ascensionCount - Current ascension count (default 0)
 * @param {Object} prestigeBonuses - Prestige bonuses object (optional)
 * @param {number} currentLevel - Current level of the node (default 0)
 * @returns {Object} The scaled cost object { resource: amount }
 */
export function getScaledNodeCost(node, ascensionCount = 0, prestigeBonuses = null, currentLevel = 0) {
    const baseCost = node.cost;
    
    // Ascension scaling: each ascension increases costs by ASCENSION_COST_MULTIPLIER (compounds)
    const ascensionMultiplier = Math.pow(ASCENSION_COST_MULTIPLIER, ascensionCount);
    
    // Level scaling: apply costScaling multiplier for each level above 0
    const costScaling = node.costScaling || 1;
    const levelMultiplier = currentLevel > 0 ? Math.pow(costScaling, currentLevel) : 1;
    
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
        const tierMultiplier = getTierMultiplierForResource(node.tier, resource);
        const finalCost = amount * tierMultiplier * ascensionMultiplier * levelMultiplier * costReduction;
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
 * Check if a tier is unlocked (always returns true now - tier gates removed)
 * @param {number} tier - The tier to check
 * @param {Set<string>} unlockedNodeIds - Set of unlocked node IDs
 * @param {Object} nodesData - All nodes data
 * @returns {boolean} True if the tier is unlocked
 */
export function isTierUnlocked(tier, unlockedNodeIds, nodesData) {
    return true;
}

/**
 * Get all connections between nodes for rendering
 * @param {Object} nodesData - All nodes data
 * @returns {Array} Array of connection objects with from/to/coordinates
 */
export function getConnections(nodesData) {
    const connections = [];
    Object.values(nodesData).forEach(node => {
        node.requires.forEach(req => {
            const reqId = typeof req === 'string' ? req : req.id;
            const reqNode = nodesData[reqId];
            if (reqNode) {
                // Skip connections from tier gates to nodes in a different branch
                // This prevents visual connections between unlocking gates and newly unlocked branches
                if (reqNode.isTierGate && node.branch !== reqNode.branch) {
                    return; // Skip this connection
                }
                
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
