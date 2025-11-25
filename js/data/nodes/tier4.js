// Tier 4 Nodes - Expert unlocks
// ==============================

export const tier4Nodes = {
    // === ENERGY BRANCH ===
    fusion_core: {
        id: 'fusion_core',
        name: 'Fusion Core',
        icon: '☢️',
        tier: 4,
        x: 200,
        y: 800,
        description: 'Massive energy production facility.',
        requires: ['generator_mk2'],
        cost: { energy: 20, data: 4, bandwidth: 1 },
        effects: {
            automation: { resource: 'energy', rate: 10 },
            description: '+10 Energy/second (passive)'
        }
    },

    antimatter_reactor: {
        id: 'antimatter_reactor',
        name: 'Antimatter Reactor',
        icon: '⚛️',
        tier: 4,
        x: 350,
        y: 600,
        description: 'Harness matter-antimatter annihilation.',
        requires: ['generator_mk2', 'superconductor'],
        cost: { energy: 30, data: 6, bandwidth: 2 },
        effects: {
            automation: { resource: 'energy', rate: 15 },
            description: '+15 Energy/second (passive)'
        }
    },

    dyson_sphere: {
        id: 'dyson_sphere',
        name: 'Dyson Sphere',
        icon: '🌞',
        tier: 4,
        x: 150,
        y: 1200,
        description: 'Capture a star\'s entire energy output.',
        requires: ['wind_turbine'],
        cost: { energy: 100, data: 20, bandwidth: 4 },
        effects: {
            automation: { resource: 'energy', rate: 50 },
            description: '+50 Energy/second (passive)'
        }
    },

    plasma_conduit: {
        id: 'plasma_conduit',
        name: 'Plasma Conduit',
        icon: '🔥',
        tier: 4,
        x: 450,
        y: 500,
        description: 'Super-heated plasma energy transfer.',
        requires: ['overclocking'],
        cost: { energy: 16, data: 4 },
        effects: {
            energyPerClick: 10,
            description: '+10 Energy per click'
        }
    },

    zero_point: {
        id: 'zero_point',
        name: 'Zero Point Energy',
        icon: '🌀',
        tier: 4,
        x: 600,
        y: 450,
        description: 'Extract energy from quantum vacuum.',
        requires: ['battery_array', 'overclocking'],
        cost: { energy: 40, data: 8, bandwidth: 2 },
        effects: {
            automation: { resource: 'energy', rate: 8 },
            energyPerClick: 5,
            description: '+8 Energy/s, +5 per click'
        }
    },

    // === DATA BRANCH ===
    quantum_processor: {
        id: 'quantum_processor',
        name: 'Quantum CPU',
        icon: '💠',
        tier: 4,
        x: 2350,
        y: 600,
        description: 'Quantum computing capabilities.',
        requires: ['parallel_processing'],
        cost: { energy: 16, data: 6, bandwidth: 2 },
        effects: {
            automation: { resource: 'data', rate: 5 },
            dataMultiplier: 3,
            description: '+5 Data/s, 3x multiplier'
        }
    },

    data_lake: {
        id: 'data_lake',
        name: 'Data Lake',
        icon: '🌊',
        tier: 4,
        x: 2550,
        y: 750,
        description: 'Vast unstructured data storage.',
        requires: ['database'],
        cost: { energy: 12, data: 8, bandwidth: 1 },
        effects: {
            automation: { resource: 'data', rate: 4 },
            description: '+4 Data/second (passive)'
        }
    },

    big_data: {
        id: 'big_data',
        name: 'Big Data',
        icon: '📊',
        tier: 4,
        x: 2550,
        y: 1000,
        description: 'Process massive datasets.',
        requires: ['data_warehouse'],
        cost: { energy: 14, data: 10, bandwidth: 2 },
        effects: {
            dataPerClick: 5,
            dataMultiplier: 2.5,
            description: '+5 per process, 2.5x multiplier'
        }
    },

    distributed_computing: {
        id: 'distributed_computing',
        name: 'Distributed Computing',
        icon: '🌐',
        tier: 4,
        x: 2150,
        y: 550,
        description: 'Harness distributed processing power.',
        requires: ['parallel_processing', 'indexing'],
        cost: { energy: 18, data: 7, bandwidth: 2 },
        effects: {
            automation: { resource: 'data', rate: 3 },
            allRatesMultiplier: 1.25,
            description: '+3 Data/s, 1.25x all rates'
        }
    },

    holographic_storage: {
        id: 'holographic_storage',
        name: 'Holographic Storage',
        icon: '💿',
        tier: 4,
        x: 1950,
        y: 550,
        description: '3D data storage technology.',
        requires: ['deduplication', 'indexing'],
        cost: { energy: 11, data: 6 },
        effects: {
            dataPerClick: 4,
            description: '+4 Data per process'
        }
    },

    // === NETWORK BRANCH ===
    neural_network: {
        id: 'neural_network',
        name: 'Neural Network',
        icon: '🧠',
        tier: 4,
        x: 1400,
        y: 2100,
        description: 'AI-powered automation system.',
        requires: ['bandwidth_unlock'],
        cost: { energy: 30, data: 10, bandwidth: 2 },
        effects: {
            automation: { resource: 'bandwidth', rate: 1 },
            allRatesMultiplier: 1.5,
            description: '+1 Bandwidth/s, 1.5x all rates'
        }
    },

    zero_day: {
        id: 'zero_day',
        name: 'Zero Day',
        icon: '💀',
        tier: 4,
        x: 1950,
        y: 1850,
        description: 'Exploit unknown vulnerabilities.',
        requires: ['encryption'],
        cost: { energy: 40, data: 8, bandwidth: 3 },
        effects: {
            instantUnlock: true,
            description: 'Instantly unlock one random locked node'
        }
    },

    vpn: {
        id: 'vpn',
        name: 'VPN Tunnel',
        icon: '🔒',
        tier: 4,
        x: 2050,
        y: 1700,
        description: 'Secure encrypted tunnels.',
        requires: ['encryption'],
        cost: { energy: 12, data: 5, bandwidth: 1 },
        effects: {
            automation: { resource: 'bandwidth', rate: 0.5 },
            description: '+0.5 Bandwidth/second (passive)'
        }
    },

    cdn: {
        id: 'cdn',
        name: 'CDN',
        icon: '🌍',
        tier: 4,
        x: 850,
        y: 1850,
        description: 'Content Delivery Network.',
        requires: ['load_balancer'],
        cost: { energy: 14, data: 6, bandwidth: 1 },
        effects: {
            automation: { resource: 'bandwidth', rate: 0.3 },
            description: '+0.3 Bandwidth/s'
        }
    },

    mesh_network: {
        id: 'mesh_network',
        name: 'Mesh Network',
        icon: '🕸️',
        tier: 4,
        x: 1100,
        y: 2000,
        description: 'Decentralized network topology.',
        requires: ['gateway', 'bandwidth_unlock'],
        cost: { energy: 16, data: 7, bandwidth: 1 },
        effects: {
            automation: { resource: 'bandwidth', rate: 0.8 },
            allRatesMultiplier: 1.2,
            description: '+0.8 Bandwidth/s, 1.2x rates'
        }
    },

    darknet: {
        id: 'darknet',
        name: 'Darknet Access',
        icon: '🌑',
        tier: 4,
        x: 1700,
        y: 2000,
        description: 'Access the hidden network.',
        requires: ['proxy', 'bandwidth_unlock'],
        cost: { energy: 20, data: 8, bandwidth: 2 },
        effects: {
            automation: { resource: 'bandwidth', rate: 0.5 },
            description: '+0.5 Bandwidth/s'
        }
    },

    // === RESEARCH BRANCH ===
    ai_core: {
        id: 'ai_core',
        name: 'AI Core',
        icon: '🤖',
        tier: 4,
        x: 1000,
        y: 450,
        description: 'Artificial General Intelligence.',
        requires: ['machine_learning'],
        cost: { energy: 24, data: 12, bandwidth: 2 },
        effects: {
            allRatesMultiplier: 1.5,
            description: '1.5x all passive rates'
        }
    },

    neural_processor: {
        id: 'neural_processor',
        name: 'Neural Processor',
        icon: '🧠',
        tier: 4,
        x: 1800,
        y: 450,
        description: 'Brain-inspired computing.',
        requires: ['deep_learning'],
        cost: { energy: 22, data: 11, bandwidth: 2 },
        effects: {
            automation: { resource: 'data', rate: 4 },
            dataMultiplier: 2,
            description: '+4 Data/s, 2x multiplier'
        }
    },

    quantum_simulation: {
        id: 'quantum_simulation',
        name: 'Quantum Sim',
        icon: '🔮',
        tier: 4,
        x: 1400,
        y: 400,
        description: 'Simulate quantum systems.',
        requires: ['monte_carlo', 'genetic_algorithm'],
        cost: { energy: 26, data: 10, bandwidth: 2 },
        effects: {
            dataPerClick: 5,
            energyPerClick: 5,
            description: '+5 Energy and Data per action'
        }
    }
};
