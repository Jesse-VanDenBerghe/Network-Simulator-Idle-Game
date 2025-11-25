// Tier 2 Nodes - Intermediate unlocks
// ====================================

export const tier2Nodes = {
    // === ENERGY BRANCH ===
    generator_mk1: {
        id: 'generator_mk1',
        name: 'Generator Mk1',
        icon: '🔋',
        tier: 2,
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

    efficiency_1: {
        id: 'efficiency_1',
        name: 'Efficiency I',
        icon: '📈',
        tier: 2,
        x: 750,
        y: 850,
        description: 'Improves energy generation efficiency.',
        requires: ['energy_boost'],
        cost: { energy: 20 },
        effects: {
            energyPerClick: 2,
            description: '+2 Energy per click'
        }
    },

    capacitor: {
        id: 'capacitor',
        name: 'Capacitor Bank',
        icon: '🪫',
        tier: 2,
        x: 900,
        y: 800,
        description: 'Store excess energy for later use.',
        requires: ['energy_boost'],
        cost: { energy: 18 },
        effects: {
            energyPerClick: 1,
            description: '+1 Energy per click'
        }
    },

    solar_panel: {
        id: 'solar_panel',
        name: 'Solar Panel',
        icon: '☀️',
        tier: 2,
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

    // === DATA BRANCH ===
    data_storage: {
        id: 'data_storage',
        name: 'Data Storage',
        icon: '💾',
        tier: 2,
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

    data_cache: {
        id: 'data_cache',
        name: 'Data Cache',
        icon: '📦',
        tier: 2,
        x: 2200,
        y: 1150,
        description: 'Quick access to frequently used data.',
        requires: ['data_processing'],
        cost: { energy: 15, data: 4 },
        effects: {
            dataPerClick: 1,
            description: '+1 Data per process'
        }
    },

    compression: {
        id: 'compression',
        name: 'Compression',
        icon: '🗜️',
        tier: 2,
        x: 1900,
        y: 850,
        description: 'Compress data for efficient storage.',
        requires: ['data_processing'],
        cost: { energy: 20, data: 3 },
        effects: {
            dataMultiplier: 1.2,
            description: '1.2x Data gains'
        }
    },

    // === NETWORK BRANCH ===
    router: {
        id: 'router',
        name: 'Router',
        icon: '📡',
        tier: 2,
        x: 1150,
        y: 1650,
        description: 'Routes data more efficiently through your network.',
        requires: ['network_basics'],
        cost: { energy: 18, data: 6 },
        effects: {
            dataMultiplier: 1.5,
            description: '1.5x Data processing'
        }
    },

    firewall: {
        id: 'firewall',
        name: 'Firewall',
        icon: '🛡️',
        tier: 2,
        x: 1650,
        y: 1650,
        description: 'Protects your network and improves stability.',
        requires: ['network_basics'],
        cost: { energy: 25, data: 8 },
        effects: {
            description: 'Required for security branch'
        }
    },

    switch: {
        id: 'switch',
        name: 'Network Switch',
        icon: '🔀',
        tier: 2,
        x: 1400,
        y: 1700,
        description: 'Connect multiple devices efficiently.',
        requires: ['network_basics'],
        cost: { energy: 22, data: 5 },
        effects: {
            automation: { resource: 'data', rate: 0.3 },
            description: '+0.3 Data/second (passive)'
        }
    },

    // === RESEARCH BRANCH ===
    algorithms: {
        id: 'algorithms',
        name: 'Algorithms',
        icon: '🧮',
        tier: 2,
        x: 1200,
        y: 750,
        description: 'Develop efficient algorithms.',
        requires: ['research_basics'],
        cost: { energy: 15, data: 5 },
        effects: {
            dataPerClick: 1,
            description: '+1 Data per process'
        }
    },

    optimization: {
        id: 'optimization',
        name: 'Optimization',
        icon: '⚙️',
        tier: 2,
        x: 1600,
        y: 750,
        description: 'Optimize all system processes.',
        requires: ['research_basics'],
        cost: { energy: 18, data: 6 },
        effects: {
            allRatesMultiplier: 1.1,
            description: '1.1x all passive rates'
        }
    },

    simulation: {
        id: 'simulation',
        name: 'Simulation',
        icon: '🎯',
        tier: 2,
        x: 1400,
        y: 700,
        description: 'Run simulations to predict outcomes.',
        requires: ['research_basics'],
        cost: { energy: 16, data: 5 },
        effects: {
            description: 'Required for advanced simulations'
        }
    },

    // === OPTIMIZATION BRANCH ===
    heat_sink: {
        id: 'heat_sink',
        name: 'Heat Sink',
        icon: '❄️',
        tier: 2,
        x: 950,
        y: 750,
        description: 'Better cooling for improved performance.',
        requires: ['power_management'],
        cost: { energy: 12, data: 2 },
        effects: {
            energyPerClick: 1,
            description: '+1 Energy per click'
        }
    },

    voltage_regulator: {
        id: 'voltage_regulator',
        name: 'Voltage Regulator',
        icon: '⚡',
        tier: 2,
        x: 800,
        y: 700,
        description: 'Stabilize power output.',
        requires: ['power_management'],
        cost: { energy: 18 },
        effects: {
            automation: { resource: 'energy', rate: 0.3 },
            description: '+0.3 Energy/second (passive)'
        }
    }
};
