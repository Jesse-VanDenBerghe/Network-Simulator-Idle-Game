// Tier 3 Nodes - Advanced unlocks
// ================================

export const tier3Nodes = {
    // === ENERGY BRANCH ===
    generator_mk2: {
        id: 'generator_mk2',
        name: 'Generator Mk2',
        icon: '🔌',
        tier: 3,
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

    overclocking: {
        id: 'overclocking',
        name: 'Overclocking',
        icon: '🚀',
        tier: 3,
        x: 550,
        y: 700,
        description: 'Push your systems beyond their limits.',
        requires: ['efficiency_1', 'generator_mk1'],
        cost: { energy: 20, data: 8 },
        effects: {
            energyPerClick: 5,
            description: '+5 Energy per click'
        }
    },

    wind_turbine: {
        id: 'wind_turbine',
        name: 'Wind Turbine',
        icon: '🌪️',
        tier: 3,
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

    battery_array: {
        id: 'battery_array',
        name: 'Battery Array',
        icon: '🔋',
        tier: 3,
        x: 750,
        y: 600,
        description: 'Massive energy storage system.',
        requires: ['capacitor'],
        cost: { energy: 14, data: 5 },
        effects: {
            energyPerClick: 3,
            automation: { resource: 'energy', rate: 1 },
            description: '+3 per click, +1 Energy/s'
        }
    },

    superconductor: {
        id: 'superconductor',
        name: 'Superconductor',
        icon: '💫',
        tier: 3,
        x: 650,
        y: 550,
        description: 'Zero-resistance energy transfer.',
        requires: ['voltage_regulator', 'heat_sink'],
        cost: { energy: 18, data: 6 },
        effects: {
            automation: { resource: 'energy', rate: 2 },
            energyPerClick: 2,
            description: '+2 Energy/s, +2 per click'
        }
    },

    // === DATA BRANCH ===
    parallel_processing: {
        id: 'parallel_processing',
        name: 'Parallel Process',
        icon: '🔀',
        tier: 3,
        x: 2250,
        y: 750,
        description: 'Process multiple data streams simultaneously.',
        requires: ['data_storage', 'data_miner'],
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
        x: 2400,
        y: 850,
        description: 'Structured data storage system.',
        requires: ['data_miner'],
        cost: { energy: 14, data: 8 },
        effects: {
            automation: { resource: 'data', rate: 1.5 },
            description: '+1.5 Data/second (passive)'
        }
    },

    data_warehouse: {
        id: 'data_warehouse',
        name: 'Data Warehouse',
        icon: '🏭',
        tier: 3,
        x: 2400,
        y: 1100,
        description: 'Massive data storage facility.',
        requires: ['data_cache'],
        cost: { energy: 16, data: 10 },
        effects: {
            dataPerClick: 2,
            automation: { resource: 'data', rate: 1 },
            description: '+2 per process, +1 Data/s'
        }
    },

    deduplication: {
        id: 'deduplication',
        name: 'Deduplication',
        icon: '🔃',
        tier: 3,
        x: 1850,
        y: 700,
        description: 'Remove duplicate data efficiently.',
        requires: ['compression'],
        cost: { energy: 12, data: 6 },
        effects: {
            dataMultiplier: 1.3,
            description: '1.3x Data gains'
        }
    },

    indexing: {
        id: 'indexing',
        name: 'Indexing',
        icon: '📑',
        tier: 3,
        x: 2000,
        y: 700,
        description: 'Fast data retrieval with indexes.',
        requires: ['compression', 'data_storage'],
        cost: { energy: 14, data: 7 },
        effects: {
            dataPerClick: 2,
            description: '+2 Data per process'
        }
    },

    // === NETWORK BRANCH ===
    bandwidth_unlock: {
        id: 'bandwidth_unlock',
        name: 'Bandwidth',
        icon: '📶',
        tier: 3,
        x: 1400,
        y: 1900,
        description: 'Unlocks bandwidth as a new resource with passive generation.',
        requires: ['router', 'firewall'],
        cost: { energy: 30, data: 10 },
        effects: {
            unlockBandwidth: true,
            automation: { resource: 'bandwidth', rate: 1 },
            description: 'Unlock Bandwidth resource, +1 Bandwidth/s'
        }
    },

    encryption: {
        id: 'encryption',
        name: 'Encryption',
        icon: '🔐',
        tier: 3,
        x: 1800,
        y: 1750,
        description: 'Secure data transmission protocols.',
        requires: ['firewall'],
        cost: { energy: 25, data: 8 },
        effects: {
            description: 'Required for advanced security'
        }
    },

    load_balancer: {
        id: 'load_balancer',
        name: 'Load Balancer',
        icon: '⚖️',
        tier: 3,
        x: 1000,
        y: 1750,
        description: 'Distribute network load evenly.',
        requires: ['router'],
        cost: { energy: 22, data: 7 },
        effects: {
            allRatesMultiplier: 1.15,
            description: '1.15x all passive rates'
        }
    },

    gateway: {
        id: 'gateway',
        name: 'Gateway',
        icon: '🚪',
        tier: 3,
        x: 1200,
        y: 1850,
        description: 'Connect to external networks.',
        requires: ['switch', 'router'],
        cost: { energy: 20, data: 6 },
        effects: {
            automation: { resource: 'data', rate: 1 },
            description: '+1 Data/second (passive)'
        }
    },

    proxy: {
        id: 'proxy',
        name: 'Proxy Server',
        icon: '🎭',
        tier: 3,
        x: 1600,
        y: 1850,
        description: 'Hide your network traffic.',
        requires: ['switch', 'firewall'],
        cost: { energy: 18, data: 5 },
        effects: {
            dataMultiplier: 1.25,
            description: '1.25x Data gains'
        }
    },

    // === RESEARCH BRANCH ===
    machine_learning: {
        id: 'machine_learning',
        name: 'Machine Learning',
        icon: '🤖',
        tier: 3,
        x: 1100,
        y: 600,
        description: 'Teach machines to learn patterns.',
        requires: ['algorithms'],
        cost: { energy: 20, data: 10 },
        effects: {
            dataMultiplier: 1.4,
            description: '1.4x Data gains'
        }
    },

    deep_learning: {
        id: 'deep_learning',
        name: 'Deep Learning',
        icon: '🧬',
        tier: 3,
        x: 1700,
        y: 600,
        description: 'Multi-layer neural processing.',
        requires: ['optimization'],
        cost: { energy: 25, data: 12 },
        effects: {
            allRatesMultiplier: 1.2,
            description: '1.2x all passive rates'
        }
    },

    monte_carlo: {
        id: 'monte_carlo',
        name: 'Monte Carlo',
        icon: '🎲',
        tier: 3,
        x: 1400,
        y: 550,
        description: 'Probabilistic simulations.',
        requires: ['simulation'],
        cost: { energy: 18, data: 8 },
        effects: {
            dataPerClick: 2,
            energyPerClick: 2,
            description: '+2 Energy and Data per action'
        }
    },

    genetic_algorithm: {
        id: 'genetic_algorithm',
        name: 'Genetic Algorithm',
        icon: '🧬',
        tier: 3,
        x: 1250,
        y: 500,
        description: 'Evolution-based optimization.',
        requires: ['algorithms', 'simulation'],
        cost: { energy: 22, data: 9 },
        effects: {
            allRatesMultiplier: 1.15,
            description: '1.15x all passive rates'
        }
    },

    // === NEW NODES ===
    hydro_dam: {
        id: 'hydro_dam',
        name: 'Hydro Dam',
        icon: '💧',
        tier: 3,
        description: 'Power from flowing water.',
        requires: ['wind_turbine'],
        cost: { energy: 18, data: 4 },
        effects: {
            automation: { resource: 'energy', rate: 4 },
            description: '+4 Energy/second'
        }
    },

    biomass_burner: {
        id: 'biomass_burner',
        name: 'Biomass',
        icon: '🍂',
        tier: 3,
        description: 'Burn organic matter.',
        requires: ['generator_mk2'],
        cost: { energy: 15, data: 3 },
        effects: {
            automation: { resource: 'energy', rate: 3 },
            description: '+3 Energy/second'
        }
    },

    smart_grid: {
        id: 'smart_grid',
        name: 'Smart Grid',
        icon: '🕸️',
        tier: 3,
        description: 'Intelligent energy distribution.',
        requires: ['battery_array'],
        cost: { energy: 20, data: 10 },
        effects: {
            allRatesMultiplier: 1.1,
            description: '1.1x all passive rates'
        }
    },

    fiber_optics: {
        id: 'fiber_optics',
        name: 'Fiber Optics',
        icon: '〰️',
        tier: 3,
        description: 'Light-speed data transmission.',
        requires: ['gateway'],
        cost: { energy: 25, data: 12 },
        effects: {
            dataMultiplier: 1.2,
            description: '1.2x Data multiplier'
        }
    },

    satellite_dish: {
        id: 'satellite_dish',
        name: 'Sat Dish',
        icon: '📡',
        tier: 3,
        description: 'Long-range communication.',
        requires: ['proxy'],
        cost: { energy: 30, data: 8 },
        effects: {
            automation: { resource: 'bandwidth', rate: 0.5 },
            description: '+0.5 Bandwidth/second'
        }
    },

    firewall_v2: {
        id: 'firewall_v2',
        name: 'Firewall V2',
        icon: '🧱',
        tier: 3,
        description: 'Advanced packet filtering.',
        requires: ['firewall'],
        cost: { energy: 22, data: 10 },
        effects: {
            dataMultiplier: 1.15,
            description: '1.15x Data multiplier'
        }
    },

    intrusion_detection: {
        id: 'intrusion_detection',
        name: 'IDS',
        icon: '🚨',
        tier: 3,
        description: 'Detect network intruders.',
        requires: ['firewall_v2'],
        cost: { energy: 25, data: 12 },
        effects: {
            allRatesMultiplier: 1.1,
            description: '1.1x all passive rates'
        }
    },

    api_gateway: {
        id: 'api_gateway',
        name: 'API Gateway',
        icon: '🔌',
        tier: 3,
        description: 'Manage API traffic.',
        requires: ['load_balancer'],
        cost: { energy: 20, data: 15 },
        effects: {
            automation: { resource: 'data', rate: 3 },
            description: '+3 Data/second'
        }
    },

    big_table: {
        id: 'big_table',
        name: 'Big Table',
        icon: '🧾',
        tier: 3,
        description: 'Distributed storage system.',
        requires: ['database'],
        cost: { energy: 18, data: 12 },
        effects: {
            automation: { resource: 'data', rate: 2 },
            description: '+2 Data/second'
        }
    },

    nosql_db: {
        id: 'nosql_db',
        name: 'NoSQL DB',
        icon: '📄',
        tier: 3,
        description: 'Flexible data models.',
        requires: ['database'],
        cost: { energy: 16, data: 10 },
        effects: {
            dataPerClick: 3,
            description: '+3 Data per click'
        }
    },

    stream_processing: {
        id: 'stream_processing',
        name: 'Stream Proc',
        icon: '🌊',
        tier: 3,
        description: 'Real-time data processing.',
        requires: ['parallel_processing'],
        cost: { energy: 20, data: 15 },
        effects: {
            automation: { resource: 'data', rate: 4 },
            description: '+4 Data/second'
        }
    }
};
