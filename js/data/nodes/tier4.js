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
            automation: { resource: 'bandwidth', rate: 2 },
            allRatesMultiplier: 1.5,
            description: '+2 Bandwidth/s, 1.5x all rates'
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
            automation: { resource: 'bandwidth', rate: 1 },
            description: '+1 Bandwidth/second (passive)'
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
            automation: { resource: 'bandwidth', rate: 0.6 },
            description: '+0.6 Bandwidth/s'
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
            automation: { resource: 'bandwidth', rate: 1.6 },
            allRatesMultiplier: 1.2,
            description: '+1.6 Bandwidth/s, 1.2x rates'
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
            automation: { resource: 'bandwidth', rate: 1 },
            description: '+1 Bandwidth/s'
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
    },

    // === NEW ENERGY NODES ===
    geothermal_plant: {
        id: 'geothermal_plant',
        name: 'Geothermal',
        icon: '🌋',
        tier: 4,
        description: 'Energy from Earth\'s core.',
        requires: ['fusion_core'],
        cost: { energy: 25, data: 5, bandwidth: 1 },
        effects: {
            automation: { resource: 'energy', rate: 12 },
            description: '+12 Energy/second'
        }
    },

    tidal_generator: {
        id: 'tidal_generator',
        name: 'Tidal Gen',
        icon: '🌊',
        tier: 4,
        description: 'Harness gravitational forces.',
        requires: ['wind_turbine'],
        cost: { energy: 20, data: 4, bandwidth: 1 },
        effects: {
            automation: { resource: 'energy', rate: 8 },
            description: '+8 Energy/second'
        }
    },

    microwave_transmission: {
        id: 'microwave_transmission',
        name: 'Microwave Power',
        icon: '📡',
        tier: 4,
        description: 'Wireless energy transmission.',
        requires: ['plasma_conduit'],
        cost: { energy: 30, data: 10, bandwidth: 2 },
        effects: {
            energyPerClick: 8,
            automation: { resource: 'energy', rate: 5 },
            description: '+5 Energy/s, +8/click'
        }
    },

    nanobot_construction: {
        id: 'nanobot_construction',
        name: 'Nanobot Build',
        icon: '🦟',
        tier: 4,
        description: 'Self-repairing infrastructure.',
        requires: ['zero_point'],
        cost: { energy: 45, data: 15, bandwidth: 2 },
        effects: {
            allRatesMultiplier: 1.2,
            description: '1.2x all passive rates'
        }
    },

    // === NEW DATA NODES ===
    quantum_cryptography: {
        id: 'quantum_cryptography',
        name: 'Quantum Crypto',
        icon: '🔐',
        tier: 4,
        description: 'Unbreakable security keys.',
        requires: ['quantum_processor'],
        cost: { energy: 25, data: 15, bandwidth: 2 },
        effects: {
            dataMultiplier: 2,
            description: '2x Data multiplier'
        }
    },

    blockchain_network: {
        id: 'blockchain_network',
        name: 'Blockchain',
        icon: '⛓️',
        tier: 4,
        description: 'Decentralized ledger.',
        requires: ['distributed_computing'],
        cost: { energy: 30, data: 20, bandwidth: 2 },
        effects: {
            automation: { resource: 'data', rate: 5 },
            dataPerClick: 10,
            description: '+5 Data/s, +10/click'
        }
    },

    cloud_compute_cluster: {
        id: 'cloud_compute_cluster',
        name: 'Cloud Cluster',
        icon: '☁️',
        tier: 4,
        description: 'Scalable computing resources.',
        requires: ['data_lake'],
        cost: { energy: 20, data: 15, bandwidth: 3 },
        effects: {
            automation: { resource: 'data', rate: 8 },
            description: '+8 Data/second'
        }
    },

    edge_computing: {
        id: 'edge_computing',
        name: 'Edge Computing',
        icon: '📱',
        tier: 4,
        description: 'Processing near the source.',
        requires: ['cloud_compute_cluster'],
        cost: { energy: 25, data: 12, bandwidth: 4 },
        effects: {
            dataMultiplier: 1.5,
            automation: { resource: 'data', rate: 6 },
            description: '+6 Data/s, 1.5x multiplier'
        }
    },

    // === NEW NETWORK NODES ===
    satellite_constellation: {
        id: 'satellite_constellation',
        name: 'Sat Constellation',
        icon: '🛰️',
        tier: 4,
        description: 'Global internet coverage.',
        requires: ['mesh_network'],
        cost: { energy: 40, data: 10, bandwidth: 5 },
        effects: {
            automation: { resource: 'bandwidth', rate: 4 },
            description: '+4 Bandwidth/second'
        }
    },

    undersea_cable: {
        id: 'undersea_cable',
        name: 'Undersea Cable',
        icon: '🦑',
        tier: 4,
        description: 'High-speed transoceanic links.',
        requires: ['cdn'],
        cost: { energy: 35, data: 8, bandwidth: 3 },
        effects: {
            automation: { resource: 'bandwidth', rate: 3 },
            description: '+3 Bandwidth/second'
        }
    },

    cyber_warfare: {
        id: 'cyber_warfare',
        name: 'Cyber Warfare',
        icon: '⚔️',
        tier: 4,
        description: 'Offensive network capabilities.',
        requires: ['zero_day'],
        cost: { energy: 50, data: 20, bandwidth: 5 },
        effects: {
            allRatesMultiplier: 1.3,
            description: '1.3x all passive rates'
        }
    },

    penetration_testing: {
        id: 'penetration_testing',
        name: 'Pen Testing',
        icon: '🕵️',
        tier: 4,
        description: 'Identify system weaknesses.',
        requires: ['vpn'],
        cost: { energy: 20, data: 10, bandwidth: 2 },
        effects: {
            dataMultiplier: 1.5,
            description: '1.5x Data multiplier'
        }
    },

    // === NEW RESEARCH NODES ===
    genetic_algorithm_v2: {
        id: 'genetic_algorithm_v2',
        name: 'Genetic Algo V2',
        icon: '🧬',
        tier: 4,
        description: 'Advanced evolutionary code.',
        requires: ['quantum_simulation'],
        cost: { energy: 30, data: 20, bandwidth: 2 },
        effects: {
            automation: { resource: 'data', rate: 10 },
            description: '+10 Data/second'
        }
    },

    automated_trading: {
        id: 'automated_trading',
        name: 'Auto Trading',
        icon: '📈',
        tier: 4,
        description: 'High-frequency algorithmic trading.',
        requires: ['ai_core'],
        cost: { energy: 25, data: 25, bandwidth: 3 },
        effects: {
            energyPerClick: 15,
            description: '+15 Energy per click'
        }
    },

    predictive_analytics: {
        id: 'predictive_analytics',
        name: 'Predictive Analytics',
        icon: '🔮',
        tier: 4,
        description: 'Predict future trends.',
        requires: ['big_data'],
        cost: { energy: 35, data: 30, bandwidth: 2 },
        effects: {
            dataMultiplier: 2,
            description: '2x Data multiplier'
        }
    },

    virtual_reality: {
        id: 'virtual_reality',
        name: 'Virtual Reality',
        icon: '🥽',
        tier: 4,
        description: 'Immersive digital worlds.',
        requires: ['neural_processor'],
        cost: { energy: 40, data: 40, bandwidth: 5 },
        effects: {
            automation: { resource: 'bandwidth', rate: 2 },
            description: '+2 Bandwidth/second'
        }
    }
};
