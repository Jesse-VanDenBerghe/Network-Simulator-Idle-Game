// Tier 3 Nodes - Power (3) + Processing (3) + Network (3 + gate)
// ================================================================

export const tier3Nodes = {
    // === POWER BRANCH (3 nodes) ===
    generator_mk2: {
        id: 'generator_mk2',
        name: 'Generator Mk2',
        icon: '🔌',
        tier: 3,
        branch: 'power',
        x: 400,
        y: 850,
        description: 'Advanced generator with improved output.',
        requires: ['generator_mk1'],
        cost: { energy: 15, data: 5 },
        effects: {
            automation: { resource: 'energy', rate: 3 },
            description: '+3 Energy/second (passive)'
        }
    },

    wind_turbine: {
        id: 'wind_turbine',
        name: 'Wind Turbine',
        icon: '🌪️',
        tier: 3,
        branch: 'power',
        x: 300,
        y: 1150,
        description: 'Generate energy from wind.',
        requires: ['solar_panel'],
        cost: { energy: 12, data: 4 },
        effects: {
            automation: { resource: 'energy', rate: 2 },
            description: '+2 Energy/second (passive)'
        }
    },

    overclocking: {
        id: 'overclocking',
        name: 'Overclocking',
        icon: '🚀',
        tier: 3,
        branch: 'power',
        x: 550,
        y: 700,
        description: 'Push your systems beyond their limits.',
        requires: ['generator_mk1'],
        cost: { energy: 20, data: 8 },
        effects: {
            energyPerClick: 5,
            description: '+5 Energy per click'
        }
    },

    // === PROCESSING BRANCH (3 nodes) ===
    parallel_processing: {
        id: 'parallel_processing',
        name: 'Parallel Process',
        icon: '🔀',
        tier: 3,
        branch: 'processing',
        x: 2250,
        y: 750,
        description: 'Process multiple data streams simultaneously.',
        requires: ['data_storage'],
        cost: { energy: 18, data: 10 },
        effects: {
            dataPerClick: 3,
            dataMultiplier: 2,
            description: '+3 Data per process, 2x multiplier'
        }
    },

    database: {
        id: 'database',
        name: 'Database',
        icon: '🗄️',
        tier: 3,
        branch: 'processing',
        x: 2400,
        y: 850,
        description: 'Structured data storage system.',
        requires: ['data_processing'],
        cost: { energy: 14, data: 8 },
        effects: {
            automation: { resource: 'data', rate: 1.5 },
            description: '+1.5 Data/second (passive)'
        }
    },

    compression: {
        id: 'compression',
        name: 'Compression',
        icon: '🗜️',
        tier: 3,
        branch: 'processing',
        x: 1900,
        y: 850,
        description: 'Compress data for efficient storage.',
        requires: ['data_storage'],
        cost: { energy: 20, data: 8 },
        effects: {
            dataMultiplier: 1.3,
            description: '1.3x Data gains'
        }
    },

    // === NETWORK BRANCH (3 nodes) ===
    firewall: {
        id: 'firewall',
        name: 'Firewall',
        icon: '🛡️',
        tier: 3,
        branch: 'network',
        x: 1650,
        y: 1650,
        description: 'Protects your network and improves stability.',
        requires: ['router'],
        cost: { energy: 25, data: 12 },
        effects: {
            description: 'Required for security branch'
        }
    },

    network_switch: {
        id: 'network_switch',
        name: 'Network Switch',
        icon: '🔀',
        tier: 3,
        branch: 'network',
        x: 1400,
        y: 1700,
        description: 'Connect multiple devices efficiently.',
        requires: ['router'],
        cost: { energy: 22, data: 10 },
        effects: {
            automation: { resource: 'data', rate: 0.5 },
            description: '+0.5 Data/second (passive)'
        }
    },

    load_balancer: {
        id: 'load_balancer',
        name: 'Load Balancer',
        icon: '⚖️',
        tier: 3,
        branch: 'network',
        x: 1150,
        y: 1750,
        description: 'Distributes network load efficiently.',
        requires: ['router'],
        cost: { energy: 28, data: 14 },
        effects: {
            dataMultiplier: 1.3,
            description: '1.3x Data processing'
        }
    },

    // === RESEARCH BRANCH TIER 3 (unlocks Research) ===
    algorithms: {
        id: 'algorithms',
        name: 'Algorithms',
        icon: '🧮',
        tier: 3,
        branch: 'research',
        isTierGate: true,
        x: 1400,
        y: 750,
        description: 'Develop efficient algorithms and unlock Research branch.',
        requires: ['core'],
        cost: { energy: 200, data: 50 },
        effects: {
            dataPerClick: 4,
            description: 'Unlocks Research branch and Tier 4. +4 Data per process'
        }
    }
};
