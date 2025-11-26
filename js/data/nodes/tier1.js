// Tier 1 Nodes - Power branch + Processing gate
// ===============================================

export const tier1Nodes = {
    // === POWER BRANCH ===
    energy_boost: {
        id: 'energy_boost',
        name: 'Energy Boost',
        icon: '⚡',
        tier: 1,
        branch: 'power',
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

    // === PROCESSING BRANCH TIER 1 (unlocks Processing) ===
    data_processing: {
        id: 'data_processing',
        name: 'Data Processing',
        icon: '📊',
        tier: 1,
        branch: 'processing',
        isTierGate: true,
        x: 1900,
        y: 1050,
        description: 'Unlock the ability to process data and access Processing branch.',
        requires: ['core'],
        cost: { energy: 50 },
        effects: {
            unlockDataProcessing: true,
            description: 'Unlocks Processing branch and Tier 2'
        }
    }
};
