// Game Data Module - Re-exports from /data and /utils
// ===================================================
// Source of truth is now in:
// - js/data/nodes/ - All 70 game nodes
// - js/data/constants.js - Game constants
// - js/data/resources.js - Resource definitions
// - js/data/config.js - Feature flags
// - js/utils/nodeUtils.js - Helper functions
// This file provides backward compatibility by re-exporting everything as GameData

import { allNodes } from './data/nodes/index.js';
import { TIER_COST_MULTIPLIERS, BRANCH_UNLOCK_ORDER } from './data/constants.js';
import { RESOURCES } from './data/resources.js';
import { FEATURE_FLAGS } from './data/config.js';
import { 
    getScaledNodeCost as getScaledNodeCostUtil,
    countUnlockedInTier as countUnlockedInTierUtil,
    isTierUnlocked as isTierUnlockedUtil,
    getConnections as getConnectionsUtil,
    checkRequirementMet as checkRequirementMetUtil
} from './utils/nodeUtils.js';

const GameData = {
    // Configuration
    FEATURE_FLAGS,
    TIER_COST_MULTIPLIERS,
    BRANCH_UNLOCK_ORDER,
    
    // Data
    resources: RESOURCES,
    nodes: allNodes,
    
    // Helper Methods
    
    /**
     * Format a number with appropriate suffixes (K, M, B, T, etc.)
     * @param {number} num - The number to format
     * @returns {string} Formatted number string
     */
    formatNumber(num) {
        if (num < 1000) {
            if (num < 10) return parseFloat(Number(num).toFixed(2)).toString();
            if (num < 100) return parseFloat(Number(num).toFixed(1)).toString();
            return Math.floor(Number(num)).toString();
        }
        
        const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
        const tier = Math.floor(Math.log10(Math.abs(Number(num))) / 3);
        
        if (tier >= suffixes.length) {
            return Number(num).toExponential(2);
        }
        
        const scaled = Number(num) / Math.pow(1000, tier);
        const decimals = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2;
        return scaled.toFixed(decimals) + suffixes[tier];
    },
    
    /**
     * Get the cost of a node scaled by tier, ascension, prestige bonuses, and level
     * @param {Object} node - The node object
     * @param {Object} [options={}] - Options object
     * @param {number} [options.ascensionCount=0] - Current ascension count
     * @param {Object|null} [options.prestigeBonuses=null] - Prestige bonuses object
     * @param {number} [options.currentLevel=0] - Current level of the node
     * @returns {Object} The scaled cost object { resource: amount }
     */
    getScaledNodeCost(node, options = {}) {
        return getScaledNodeCostUtil(node, options);
    },
    
    /**
     * Count how many nodes of a specific tier are unlocked
     * @param {number} tier - The tier to count
     * @param {Set<string>} unlockedNodeIds - Set of unlocked node IDs
     * @returns {number} The count of unlocked nodes in that tier
     */
    countUnlockedInTier(tier, unlockedNodeIds) {
        return countUnlockedInTierUtil(Number(tier), unlockedNodeIds, this.nodes);
    },
    
    /**
     * Check if a tier is unlocked
     * @param {number} tier - The tier to check
     * @param {Set<string>} unlockedNodeIds - Set of unlocked node IDs
     * @returns {boolean} True if the tier is unlocked
     */
    isTierUnlocked(tier, unlockedNodeIds) {
        return isTierUnlockedUtil(Number(tier), unlockedNodeIds, this.nodes);
    },
    
    /**
     * Get all connections between nodes for rendering
     * @returns {Array} Array of connection objects with from/to/coordinates
     */
    getConnections() {
        return getConnectionsUtil(this.nodes);
    },
    
    /**
     * Check if a single requirement is met
     * @param {string|Object} req - Requirement (string id or { id, level })
     * @param {Set<string>} unlockedNodes - Set of unlocked node IDs
     * @param {Object} nodeLevels - Map of node ID to level
     * @returns {boolean} True if requirement is met
     */
    checkRequirementMet(req, unlockedNodes, nodeLevels) {
        return checkRequirementMetUtil(req, unlockedNodes, nodeLevels);
    },
    
    /**
     * Initialize the layout engine with this game data
     */
    initializeLayout() {
        if (typeof LayoutEngine !== 'undefined') {
            LayoutEngine.initializeLayout(this);
        }
    }
};

// Export globally for use by other scripts
window.GameData = GameData;

export default GameData;
