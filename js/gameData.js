// Game Data Module - Node definitions and game constants
// ======================================================
// Note: Nodes are now imported from separate tier files in js/data/nodes/

import { allNodes } from './data/nodes/index.js';

const GameData = {
    // =============================================
    // CONFIGURATION & CONSTANTS
    // =============================================
    
    // Feature flags
    FEATURE_FLAGS: {
        DOTS_TO_AVAILABLE_NODES: false, // Show gray dots traveling to available (locked) nodes
    },
    
    // Cost multipliers per tier (Exponential scaling)
    TIER_COST_MULTIPLIERS: {
        0: 1,      // Core
        1: 1,      // 10-25 energy
        2: 10,     // 100-300 energy
        3: 50,     // 500-2,000 energy
        4: 500,    // 5K-20K energy
        5: 5000,   // 50K-200K energy
        6: 50000,  // 500K-2M energy
        7: 500000  // 10M-50M energy
    },

    // Gate requirements for unlocking new tiers
    TIER_GATES: {
        3: { requiredTier: 2, requiredCount: 3 },
        4: { requiredTier: 3, requiredCount: 6 },
        5: { requiredTier: 4, requiredCount: 10 },
        6: { requiredTier: 5, requiredCount: 15 },
        7: { requiredTier: 6, requiredCount: 20 }
    },

    // Resource definitions
    resources: {
        energy: {
            id: 'energy',
            name: 'Energy',
            icon: '⚡',
            color: '#00ffaa'
        },
        data: {
            id: 'data',
            name: 'Data',
            icon: '📊',
            color: '#00aaff'
        },
        bandwidth: {
            id: 'bandwidth',
            name: 'Bandwidth',
            icon: '📡',
            color: '#ff00aa'
        }
    },

    // Node definitions (imported from tier files)
    nodes: allNodes,

    // Legacy inline nodes preserved below for reference (can be removed after testing)
    _legacyNodes: {
        // =============================================
        // TIER 0 - Core (Starting node)
        // =============================================
        core: {
            id: 'core',
            name: 'Core System',
            icon: '🔮',
            tier: 0,
            x: 1400,
            y: 1200,
            description: 'The central hub of your network. Everything begins here.',
            requires: [],
            cost: {},
            effects: {
                description: 'Starting node - unlocked by default'
            }
        },

        // =============================================
        // TIER 1 - Basic unlocks (5 branches from core)
        // =============================================
        
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
        },

        // =============================================
        // TIER 2 - Intermediate unlocks
        // =============================================

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
        },

        // =============================================
        // TIER 3 - Advanced unlocks
        // =============================================

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
                automation: { resource: 'bandwidth', rate: 0.5 },
                description: 'Unlock Bandwidth resource, +0.5 Bandwidth/s'
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

        // =============================================
        // TIER 4 - Expert unlocks
        // =============================================

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
        },

        // =============================================
        // TIER 5 - Master unlocks (NEW!)
        // =============================================

        // === ENERGY MASTERY ===
        stellar_forge: {
            id: 'stellar_forge',
            name: 'Stellar Forge',
            icon: '⭐',
            tier: 5,
            x: 100,
            y: 700,
            description: 'Forge new stars for energy.',
            requires: ['fusion_core', 'antimatter_reactor'],
            cost: { energy: 20, data: 4, bandwidth: 1 },
            effects: {
                automation: { resource: 'energy', rate: 100 },
                description: '+100 Energy/second (passive)'
            }
        },

        singularity_tap: {
            id: 'singularity_tap',
            name: 'Singularity Tap',
            icon: '🕳️',
            tier: 5,
            x: 100,
            y: 1050,
            description: 'Extract energy from black holes.',
            requires: ['dyson_sphere'],
            cost: { energy: 50, data: 10, bandwidth: 2 },
            effects: {
                automation: { resource: 'energy', rate: 200 },
                description: '+200 Energy/second (passive)'
            }
        },

        cosmic_battery: {
            id: 'cosmic_battery',
            name: 'Cosmic Battery',
            icon: '🔋',
            tier: 5,
            x: 400,
            y: 350,
            description: 'Store universe-scale energy.',
            requires: ['zero_point', 'plasma_conduit'],
            cost: { energy: 16, data: 3, bandwidth: 1 },
            effects: {
                energyPerClick: 25,
                automation: { resource: 'energy', rate: 20 },
                description: '+25 per click, +20 Energy/s'
            }
        },

        // === DATA MASTERY ===
        quantum_memory: {
            id: 'quantum_memory',
            name: 'Quantum Memory',
            icon: '💎',
            tier: 5,
            x: 2450,
            y: 450,
            description: 'Store data in quantum states.',
            requires: ['quantum_processor'],
            cost: { energy: 10, data: 5, bandwidth: 1 },
            effects: {
                automation: { resource: 'data', rate: 20 },
                dataMultiplier: 5,
                description: '+20 Data/s, 5x multiplier'
            }
        },

        omniscient_database: {
            id: 'omniscient_database',
            name: 'Omniscient DB',
            icon: '📚',
            tier: 5,
            x: 2700,
            y: 850,
            description: 'Contains all possible data.',
            requires: ['data_lake', 'big_data'],
            cost: { energy: 16, data: 8, bandwidth: 1 },
            effects: {
                automation: { resource: 'data', rate: 30 },
                description: '+30 Data/second (passive)'
            }
        },

        reality_compiler: {
            id: 'reality_compiler',
            name: 'Reality Compiler',
            icon: '🌌',
            tier: 5,
            x: 2100,
            y: 400,
            description: 'Compile data into reality.',
            requires: ['distributed_computing', 'holographic_storage'],
            cost: { energy: 12, data: 6, bandwidth: 1 },
            effects: {
                dataPerClick: 15,
                allRatesMultiplier: 2,
                description: '+15 per process, 2x all rates'
            }
        },

        // === NETWORK MASTERY ===
        galactic_network: {
            id: 'galactic_network',
            name: 'Galactic Network',
            icon: '🌌',
            tier: 5,
            x: 1400,
            y: 2300,
            description: 'Network spanning galaxies.',
            requires: ['neural_network'],
            cost: { energy: 30, data: 10, bandwidth: 2 },
            effects: {
                automation: { resource: 'bandwidth', rate: 5 },
                allRatesMultiplier: 2,
                description: '+5 Bandwidth/s, 2x all rates'
            }
        },

        quantum_entanglement: {
            id: 'quantum_entanglement',
            name: 'Quantum Link',
            icon: '🔗',
            tier: 5,
            x: 950,
            y: 2150,
            description: 'Instant communication via entanglement.',
            requires: ['mesh_network'],
            cost: { energy: 20, data: 7, bandwidth: 1 },
            effects: {
                automation: { resource: 'bandwidth', rate: 3 },
                description: '+3 Bandwidth/s'
            }
        },

        shadow_network: {
            id: 'shadow_network',
            name: 'Shadow Network',
            icon: '👤',
            tier: 5,
            x: 1850,
            y: 2050,
            description: 'Invisible network infrastructure.',
            requires: ['darknet', 'zero_day'],
            cost: { energy: 24, data: 8, bandwidth: 1 },
            effects: {
                automation: { resource: 'bandwidth', rate: 4 },
                dataMultiplier: 3,
                description: '+4 Bandwidth/s, 3x Data'
            }
        },

        // === RESEARCH MASTERY ===
        superintelligence: {
            id: 'superintelligence',
            name: 'Superintelligence',
            icon: '🌟',
            tier: 5,
            x: 900,
            y: 300,
            description: 'Beyond human intelligence.',
            requires: ['ai_core'],
            cost: { energy: 40, data: 16, bandwidth: 2 },
            effects: {
                allRatesMultiplier: 3,
                description: '3x all passive rates'
            }
        },

        consciousness_upload: {
            id: 'consciousness_upload',
            name: 'Mind Upload',
            icon: '💭',
            tier: 5,
            x: 1900,
            y: 300,
            description: 'Transfer consciousness to the network.',
            requires: ['neural_processor'],
            cost: { energy: 36, data: 14, bandwidth: 2 },
            effects: {
                automation: { resource: 'data', rate: 25 },
                description: '+25 Data/s'
            }
        },

        multiverse_access: {
            id: 'multiverse_access',
            name: 'Multiverse Access',
            icon: '🌀',
            tier: 5,
            x: 1400,
            y: 250,
            description: 'Access parallel universes.',
            requires: ['quantum_simulation'],
            cost: { energy: 60, data: 20, bandwidth: 3 },
            effects: {
                energyPerClick: 50,
                dataPerClick: 30,
                allRatesMultiplier: 2.5,
                description: '+50 Energy, +30 Data per click, 2.5x rates'
            }
        },

        // =============================================
        // TIER 6 - Transcendence (Ultimate unlocks)
        // =============================================

        universal_energy: {
            id: 'universal_energy',
            name: 'Universal Energy',
            icon: '✨',
            tier: 6,
            x: 100,
            y: 900,
            description: 'Tap into the energy of the universe itself.',
            requires: ['stellar_forge', 'singularity_tap'],
            cost: { energy: 20, data: 5, bandwidth: 1 },
            effects: {
                automation: { resource: 'energy', rate: 500 },
                description: '+500 Energy/second (passive)'
            }
        },

        akashic_records: {
            id: 'akashic_records',
            name: 'Akashic Records',
            icon: '📜',
            tier: 6,
            x: 2700,
            y: 650,
            description: 'Access the universal database of all knowledge.',
            requires: ['quantum_memory', 'omniscient_database'],
            cost: { energy: 16, data: 10, bandwidth: 1 },
            effects: {
                automation: { resource: 'data', rate: 100 },
                dataMultiplier: 10,
                description: '+100 Data/s, 10x multiplier'
            }
        },

        hivemind: {
            id: 'hivemind',
            name: 'Hivemind',
            icon: '🐝',
            tier: 6,
            x: 1400,
            y: 2500,
            description: 'Collective consciousness of all networks.',
            requires: ['galactic_network', 'quantum_entanglement', 'shadow_network'],
            cost: { energy: 24, data: 8, bandwidth: 2 },
            effects: {
                automation: { resource: 'bandwidth', rate: 20 },
                allRatesMultiplier: 5,
                description: '+20 Bandwidth/s, 5x all rates'
            }
        },

        omega_point: {
            id: 'omega_point',
            name: 'Omega Point',
            icon: '🔱',
            tier: 6,
            x: 1400,
            y: 150,
            description: 'The ultimate convergence of all intelligence.',
            requires: ['superintelligence', 'consciousness_upload', 'multiverse_access'],
            cost: { energy: 30, data: 15, bandwidth: 2 },
            effects: {
                allRatesMultiplier: 10,
                energyPerClick: 100,
                dataPerClick: 100,
                description: '10x all rates, +100 per click'
            }
        },

        // =============================================
        // TIER 7 - Godhood (Final tier)
        // =============================================

        universe_simulation: {
            id: 'universe_simulation',
            name: 'Universe Simulation',
            icon: '🌐',
            tier: 7,
            x: 1400,
            y: 2700,
            description: 'Simulate entire universes at will.',
            requires: ['omega_point', 'universal_energy', 'akashic_records', 'hivemind'],
            cost: { energy: 20, data: 10, bandwidth: 2 },
            effects: {
                automation: { resource: 'energy', rate: 1000 },
                automation: { resource: 'data', rate: 500 },
                automation: { resource: 'bandwidth', rate: 100 },
                allRatesMultiplier: 100,
                description: 'You have become a god.'
            }
        }
    }, // End of _legacyNodes - can be removed after testing

    // =============================================
    // HELPER FUNCTIONS
    // =============================================

    /**
     * Count how many nodes of a specific tier are unlocked
     * @param {number} tier - The tier to count
     * @param {Set<string>} unlockedNodeIds - Set of unlocked node IDs
     * @returns {number} The count of unlocked nodes in that tier
     */
    countUnlockedInTier(tier, unlockedNodeIds) {
        let count = 0;
        unlockedNodeIds.forEach(id => {
            const node = this.nodes[id];
            if (node && node.tier === tier) {
                count++;
            }
        });
        return count;
    },

    /**
     * Check if a tier is unlocked based on gate requirements
     * @param {number} tier - The tier to check
     * @param {Set<string>} unlockedNodeIds - Set of unlocked node IDs
     * @returns {boolean} True if the tier is unlocked
     */
    isTierUnlocked(tier, unlockedNodeIds) {
        const gate = this.TIER_GATES[tier];
        if (!gate) return true;
        
        const count = this.countUnlockedInTier(gate.requiredTier, unlockedNodeIds);
        return count >= gate.requiredCount;
    },

    /**
     * Get the cost of a node scaled by its tier multiplier, ascension count, and prestige bonuses
     * @param {Object} node - The node object
     * @param {number} ascensionCount - Current ascension count (default 0)
     * @param {Object} prestigeBonuses - Prestige bonuses object (optional)
     * @returns {Object} The scaled cost object { resource: amount }
     */
    getScaledNodeCost(node, ascensionCount = 0, prestigeBonuses = null) {
        const baseCost = node.cost;
        const tierMultiplier = this.TIER_COST_MULTIPLIERS[node.tier] || 1;
        
        // Ascension scaling: each ascension increases costs by 50%
        const ascensionMultiplier = Math.pow(1.5, ascensionCount);
        
        // Prestige cost reduction
        let costReduction = 1;
        if (prestigeBonuses) {
            // Apply general cost multiplier
            if (prestigeBonuses.costMultiplier) {
                costReduction *= prestigeBonuses.costMultiplier;
            }
            // Apply tier-specific cost multipliers
            if (prestigeBonuses.tierCostMultipliers && prestigeBonuses.tierCostMultipliers[node.tier]) {
                costReduction *= prestigeBonuses.tierCostMultipliers[node.tier];
            }
        }
        
        const scaled = {};
        for (const [resource, amount] of Object.entries(baseCost)) {
            const finalCost = amount * tierMultiplier * ascensionMultiplier * costReduction;
            scaled[resource] = Math.floor(finalCost);
        }
        return scaled;
    },

    formatNumber(num) {
        if (num < 1000) {
            if (num < 10) return parseFloat(num.toFixed(2)).toString();
            if (num < 100) return parseFloat(num.toFixed(1)).toString();
            return Math.floor(num).toString();
        }
        
        const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
        const tier = Math.floor(Math.log10(Math.abs(num)) / 3);
        
        if (tier >= suffixes.length) {
            return num.toExponential(2);
        }
        
        const scaled = num / Math.pow(1000, tier);
        const decimals = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2;
        return scaled.toFixed(decimals) + suffixes[tier];
    },

    // Get all node connections for rendering
    getConnections() {
        const connections = [];
        Object.values(this.nodes).forEach(node => {
            node.requires.forEach(reqId => {
                const reqNode = this.nodes[reqId];
                if (reqNode) {
                    connections.push({
                        from: reqId,
                        to: node.id,
                        x1: reqNode.x + 40,
                        y1: reqNode.y + 40,
                        x2: node.x + 40,
                        y2: node.y + 40
                    });
                }
            });
        });
        return connections;
    },

    // Initialize layout - call once on load
    initializeLayout() {
        if (typeof LayoutEngine !== 'undefined') {
            LayoutEngine.applyLayout(this);
        }
    }
};

// Export GameData globally for use by other scripts
window.GameData = GameData;

export default GameData;
