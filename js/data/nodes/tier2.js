// Tier 2 Nodes - Power (2) + Processing (2) + Network gate
// ==========================================================

export const tier2Nodes = {
    // === POWER BRANCH (2 nodes) ===
    generator_mk1: {
        id: 'generator_mk1',
        name: 'Generator Mk1',
        icon: '🔋',
        tier: 2,
        branch: 'power',
        x: 600,
        y: 950,
        description: 'Basic energy generator. Produces energy automatically.',
        requires: ['energy_boost'],
        cost: { energy: 15, data: 2 },
        effects: {
            automation: { resource: 'energy', rate: 1 },
            description: '+1 Energy/second (passive)'
        }
    },

    solar_panel: {
        id: 'solar_panel',
        name: 'Solar Panel',
        icon: '☀️',
        tier: 2,
        branch: 'power',
        x: 500,
        y: 1100,
        description: 'Harness the power of the sun.',
        requires: ['energy_boost'],
        cost: { energy: 25, data: 5 },
        effects: {
            automation: { resource: 'energy', rate: 0.5 },
            description: '+0.5 Energy/second (passive)'
        }
    },

    // === PROCESSING BRANCH (2 nodes) ===
    data_storage: {
        id: 'data_storage',
        name: 'Data Storage',
        icon: '💾',
        tier: 2,
        branch: 'processing',
        x: 2050,
        y: 850,
        description: 'Store and accumulate more data.',
        requires: ['data_processing'],
        cost: { energy: 12, data: 5 },
        effects: {
            dataPerClick: 1,
            description: '+1 Data per process'
        }
    },

    data_miner: {
        id: 'data_miner',
        name: 'Data Miner',
        icon: '⛏️',
        tier: 2,
        branch: 'processing',
        x: 2200,
        y: 950,
        description: 'Automatically mines data from the network.',
        requires: ['data_processing'],
        cost: { energy: 30, data: 5 },
        effects: {
            automation: { resource: 'data', rate: 0.5 },
            description: '+0.5 Data/second (passive)'
        }
    },

    // === NETWORK BRANCH TIER 2 (unlocks Network) ===
    router: {
        id: 'router',
        name: 'Router',
        icon: '📡',
        tier: 2,
        branch: 'network',
        isTierGate: true,
        x: 1400,
        y: 1650,
        description: 'Routes data efficiently and unlocks Network branch.',
        requires: ['core'],
        cost: { energy: 100, data: 20 },
        effects: {
            dataMultiplier: 1.5,
            description: 'Unlocks Network branch and Tier 3. 1.5x Data processing'
        }
    }
};
