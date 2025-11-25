// Prestige Data Module - Upgrade definitions and prestige logic
// ==============================================================

const PrestigeData = {
    // =============================================
    // UPGRADE DEFINITIONS
    // =============================================
    upgrades: {
        // TIER 1 (1-5 cores)
        quick_start: {
            id: 'quick_start',
            name: 'Quick Start',
            tier: 1,
            cost: 2,
            description: 'Start with +5 Energy',
            requires: [],
            effect: { startingEnergy: 5 }
        },
        click_power_1: {
            id: 'click_power_1',
            name: 'Click Power I',
            tier: 1,
            cost: 3,
            description: '+1 base Energy per click',
            requires: [],
            effect: { bonusEnergyPerClick: 1 }
        },
        headstart_1: {
            id: 'headstart_1',
            name: 'Headstart I',
            tier: 1,
            cost: 5,
            description: 'Start with Energy Boost unlocked',
            requires: [],
            effect: { startingNodes: ['energy_boost'] }
        },
        efficient_learning: {
            id: 'efficient_learning',
            name: 'Efficient Learning',
            tier: 1,
            cost: 4,
            description: '-10% all node costs',
            requires: [],
            effect: { costMultiplier: 0.9 }
        },
        
        // TIER 2 (10-25 cores)
        auto_clicker_1: {
            id: 'auto_clicker_1',
            name: 'Auto-Clicker I',
            tier: 2,
            cost: 15,
            description: '+0.5 Energy/s from start',
            requires: ['click_power_1'],
            effect: { startingAutomation: { energy: 0.5 } }
        },
        data_affinity: {
            id: 'data_affinity',
            name: 'Data Affinity',
            tier: 2,
            cost: 10,
            description: 'Start with Data Processing unlocked',
            requires: ['headstart_1'],
            effect: { startingNodes: ['data_processing'] }
        },
        cost_reduction_1: {
            id: 'cost_reduction_1',
            name: 'Cost Reduction I',
            tier: 2,
            cost: 20,
            description: '-25% all node costs',
            requires: ['efficient_learning'],
            effect: { costMultiplier: 0.75 }
        },
        speed_research: {
            id: 'speed_research',
            name: 'Speed Research',
            tier: 2,
            cost: 15,
            description: 'Tier 1-2 nodes cost 50% less',
            requires: ['efficient_learning'],
            effect: { tierCostMultipliers: { 1: 0.5, 2: 0.5 } }
        },
        
        // TIER 3 (50-100 cores)
        genesis_protocol: {
            id: 'genesis_protocol',
            name: 'Genesis Protocol',
            tier: 3,
            cost: 50,
            description: 'Start with 3 random Tier 1 nodes',
            requires: ['data_affinity'],
            effect: { randomStartingNodes: { tier: 1, count: 3 } }
        },
        quantum_efficiency: {
            id: 'quantum_efficiency',
            name: 'Quantum Efficiency',
            tier: 3,
            cost: 75,
            description: '+50% all automation rates',
            requires: ['auto_clicker_1'],
            effect: { automationMultiplier: 1.5 }
        },
        cost_reduction_2: {
            id: 'cost_reduction_2',
            name: 'Cost Reduction II',
            tier: 3,
            cost: 100,
            description: '-50% all node costs',
            requires: ['cost_reduction_1'],
            effect: { costMultiplier: 0.5 }
        },
        core_multiplier: {
            id: 'core_multiplier',
            name: 'Core Multiplier',
            tier: 3,
            cost: 80,
            description: '+25% Quantum Cores earned',
            requires: [],
            effect: { coreMultiplier: 1.25 }
        },
        
        // TIER 4 (200-500 cores)
        instant_tier_1: {
            id: 'instant_tier_1',
            name: 'Instant Tier 1',
            tier: 4,
            cost: 200,
            description: 'Start with ALL Tier 1 nodes',
            requires: ['genesis_protocol'],
            effect: { startAllTier: 1 }
        },
        eternal_generator: {
            id: 'eternal_generator',
            name: 'Eternal Generator',
            tier: 4,
            cost: 300,
            description: '+5 Energy/s permanent',
            requires: ['quantum_efficiency'],
            effect: { startingAutomation: { energy: 5 } }
        },
        bandwidth_genesis: {
            id: 'bandwidth_genesis',
            name: 'Bandwidth Genesis',
            tier: 4,
            cost: 250,
            description: 'Start with Bandwidth unlocked',
            requires: ['data_affinity'],
            effect: { startingNodes: ['bandwidth_unlock'] }
        },
        prestige_mastery: {
            id: 'prestige_mastery',
            name: 'Prestige Mastery',
            tier: 4,
            cost: 500,
            description: '2x Quantum Cores earned',
            requires: ['core_multiplier'],
            effect: { coreMultiplier: 2 }
        }
    },

    // =============================================
    // HELPER FUNCTIONS
    // =============================================
    
    /**
     * Check if an upgrade's requirements are met
     */
    canPurchaseUpgrade(upgradeId, purchasedUpgrades) {
        const upgrade = this.upgrades[upgradeId];
        if (!upgrade) return false;
        
        // Check if already purchased
        if (purchasedUpgrades.has(upgradeId)) return false;
        
        // Check requirements
        return upgrade.requires.every(reqId => purchasedUpgrades.has(reqId));
    },

    /**
     * Get all upgrades organized by tier
     */
    getUpgradesByTier() {
        const byTier = { 1: [], 2: [], 3: [], 4: [] };
        
        Object.values(this.upgrades).forEach(upgrade => {
            if (byTier[upgrade.tier]) {
                byTier[upgrade.tier].push(upgrade);
            }
        });
        
        return byTier;
    },

    /**
     * Get upgrades that are currently purchasable
     */
    getAvailableUpgrades(purchasedUpgrades, quantumCores) {
        return Object.values(this.upgrades).filter(upgrade => {
            if (purchasedUpgrades.has(upgrade.id)) return false;
            
            const requirementsMet = upgrade.requires.every(reqId => 
                purchasedUpgrades.has(reqId)
            );
            
            return requirementsMet && quantumCores >= upgrade.cost;
        });
    }
};
