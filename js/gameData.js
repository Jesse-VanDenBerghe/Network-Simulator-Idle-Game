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
    getConnections as getConnectionsUtil
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
    formatNumber(num) {
        if (num < 1000) {
            if (num < 10) return parseFloat(num.toFixed(2)).toString();
            if (num < 100) return parseFloat(num.toFixed(1)).toString();
            return Math.floor(num).toString();
        }
        
        const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
        const tier = Math.floor(Math.log10(Math.abs(num)) / 3);
        
        if (tier >= suffixes.length) {
            return num.toExponential(2);
        }
        
        const scaled = num / Math.pow(1000, tier);
        const decimals = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2;
        return scaled.toFixed(decimals) + suffixes[tier];
    },
    
    getScaledNodeCost(node, ascensionCount = 0, prestigeBonuses = null) {
        return getScaledNodeCostUtil(node, ascensionCount, prestigeBonuses);
    },
    
    countUnlockedInTier(tier, unlockedNodeIds) {
        return countUnlockedInTierUtil(tier, unlockedNodeIds, this.nodes);
    },
    
    isTierUnlocked(tier, unlockedNodeIds) {
        return isTierUnlockedUtil(tier, unlockedNodeIds, this.nodes);
    },
    
    getConnections() {
        return getConnectionsUtil(this.nodes);
    },
    
    initializeLayout() {
        if (typeof LayoutEngine !== 'undefined') {
            LayoutEngine.initializeLayout(this);
        }
    }
};

// Export globally for use by other scripts
window.GameData = GameData;

export default GameData;
