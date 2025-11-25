// Tier 1 Nodes - Basic unlocks (5 branches from core)
// ====================================================

export const tier1Nodes = {
    // === ENERGY BRANCH (Left) ===
    energy_boost: {
        id: 'energy_boost',
        name: 'Energy Boost',
        icon: '⚡',
        tier: 1,
        x: 900,
        y: 1050,
        description: 'Increases manual energy generation.',
        requires: ['core'],
        cost: { energy: 10 },
        effects: {
            energyPerClick: 1,
            description: '+1 Energy per click'
        }
    },

    // === DATA BRANCH (Right) ===
    data_processing: {
        id: 'data_processing',
        name: 'Data Processing',
        icon: '📊',
        tier: 1,
        x: 1900,
        y: 1050,
        description: 'Unlocks the ability to process data.',
        requires: ['core'],
        cost: { energy: 25 },
        effects: {
            unlockDataProcessing: true,
            description: 'Unlock Data Processing button'
        }
    },

    // === NETWORK BRANCH (Bottom) ===
    network_basics: {
        id: 'network_basics',
        name: 'Network Basics',
        icon: '🌐',
        tier: 1,
        x: 1400,
        y: 1500,
        description: 'Learn the fundamentals of networking.',
        requires: ['core'],
        cost: { energy: 20 },
        effects: {
            description: 'Required for advanced networking nodes'
        }
    },

    // === RESEARCH BRANCH (Top) ===
    research_basics: {
        id: 'research_basics',
        name: 'Research Lab',
        icon: '🔬',
        tier: 1,
        x: 1400,
        y: 900,
        description: 'Establish basic research capabilities.',
        requires: ['core'],
        cost: { energy: 15 },
        effects: {
            description: 'Unlocks research and upgrade paths'
        }
    },

    // === OPTIMIZATION BRANCH (Top-Left) ===
    power_management: {
        id: 'power_management',
        name: 'Power Management',
        icon: '🔧',
        tier: 1,
        x: 1100,
        y: 1000,
        description: 'Better manage your power resources.',
        requires: ['core'],
        cost: { energy: 18 },
        effects: {
            energyPerClick: 1,
            description: '+1 Energy per click'
        }
    }
};
