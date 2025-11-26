// Data branch
// Focusses on data generation and management.
// ====================

export const dataBranch = {
    // == Tier 1 Nodes ==
    data_unlock: {
        id: 'data_unlock',
        name: 'Data!',
        icon: '📊',
        tier: 1,
        branch: 'data',
        x: 0,
        y: 0,
        description: 'Unlock the ability to process data',
        requires: ['core'],
        cost: { energy: 10 },
        effects: {
            unlockDataProcessing: true,
            unlockBranch: 'data',
            description: 'Unlock data processing and the Data branch'
        }
    },

    // == Tier 2 Nodes ==
    data_2_1: {
        id: 'data_2_1',
        name: 'Data Storage',
        icon: '💾',
        tier: 2,
        branch: 'data',
        x: 0,
        y: 0,
        description: 'Store and accumulate more data.',
        requires: ['data_unlock'],
        cost: { energy: 12, data: 5 },
        effects: {
            dataPerClick: 1,
            description: '+1 Data per process'
        }
    },

    data_2_2: {
        id: 'data_2_2',
        name: 'Data Miner',
        icon: '⛏️',
        tier: 2,
        branch: 'data',
        x: 0,
        y: 0,
        description: 'Automatically mines data from the network.',
        requires: ['data_unlock'],
        cost: { energy: 30, data: 5 },
        effects: {
            automation: { resource: 'data', rate: 0.5 },
            description: '+0.5 Data/second (passive)'
        }
    },
};