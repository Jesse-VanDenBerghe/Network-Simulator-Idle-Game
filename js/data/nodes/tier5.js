// Tier 5 Nodes - Master unlocks
// ==============================

export const tier5Nodes = {
    // === ENERGY MASTERY (EXISTING) ===
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

    // === DATA MASTERY (EXISTING) ===
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

    // === NETWORK MASTERY (EXISTING) ===
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
            automation: { resource: 'bandwidth', rate: 10 },
            allRatesMultiplier: 2,
            description: '+10 Bandwidth/s, 2x all rates'
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
            automation: { resource: 'bandwidth', rate: 6 },
            description: '+6 Bandwidth/s'
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
            automation: { resource: 'bandwidth', rate: 8 },
            dataMultiplier: 3,
            description: '+8 Bandwidth/s, 3x Data'
        }
    },

    // === RESEARCH MASTERY (EXISTING) ===
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
            allRatesMultiplier: 4,
            description: '4x all passive rates'
        }
    },

    // === NEW ENERGY NODES ===
    plasma_fusion: {
        id: 'plasma_fusion',
        name: 'Plasma Fusion',
        icon: '☀️',
        tier: 5,
        description: 'Self-sustaining plasma reaction.',
        requires: ['fusion_core'],
        cost: { energy: 25, data: 5, bandwidth: 1 },
        effects: {
            automation: { resource: 'energy', rate: 50 },
            description: '+50 Energy/second'
        }
    },

    orbital_collector: {
        id: 'orbital_collector',
        name: 'Orbital Collector',
        icon: '🛰️',
        tier: 5,
        description: 'Harvest energy from orbit.',
        requires: ['dyson_sphere'],
        cost: { energy: 40, data: 8, bandwidth: 2 },
        effects: {
            automation: { resource: 'energy', rate: 80 },
            description: '+80 Energy/second'
        }
    },

    gamma_ray_harvester: {
        id: 'gamma_ray_harvester',
        name: 'Gamma Harvester',
        icon: '⚡',
        tier: 5,
        description: 'Capture gamma ray bursts.',
        requires: ['stellar_forge'],
        cost: { energy: 60, data: 10, bandwidth: 3 },
        effects: {
            energyPerClick: 40,
            automation: { resource: 'energy', rate: 120 },
            description: '+40/click, +120 Energy/s'
        }
    },

    quantum_vacuum: {
        id: 'quantum_vacuum',
        name: 'Quantum Vacuum',
        icon: '🕳️',
        tier: 5,
        description: 'Zero-point energy extraction.',
        requires: ['cosmic_battery'],
        cost: { energy: 50, data: 12, bandwidth: 2 },
        effects: {
            automation: { resource: 'energy', rate: 150 },
            description: '+150 Energy/second'
        }
    },

    // === NEW DATA NODES ===
    neural_grid: {
        id: 'neural_grid',
        name: 'Neural Grid',
        icon: '🧠',
        tier: 5,
        description: 'Brain-like computing grid.',
        requires: ['quantum_memory'],
        cost: { energy: 30, data: 15, bandwidth: 2 },
        effects: {
            automation: { resource: 'data', rate: 40 },
            description: '+40 Data/second'
        }
    },

    logic_crystal: {
        id: 'logic_crystal',
        name: 'Logic Crystal',
        icon: '💎',
        tier: 5,
        description: 'Crystalline data storage.',
        requires: ['omniscient_database'],
        cost: { energy: 25, data: 20, bandwidth: 1 },
        effects: {
            dataMultiplier: 2,
            description: '2x Data multiplier'
        }
    },

    hyper_algorithm: {
        id: 'hyper_algorithm',
        name: 'Hyper Algorithm',
        icon: '🔢',
        tier: 5,
        description: 'Self-improving algorithms.',
        requires: ['reality_compiler'],
        cost: { energy: 35, data: 18, bandwidth: 2 },
        effects: {
            dataPerClick: 25,
            description: '+25 Data per click'
        }
    },

    simulated_reality: {
        id: 'simulated_reality',
        name: 'Sim Reality',
        icon: '🕶️',
        tier: 5,
        description: 'Full sensory simulation.',
        requires: ['consciousness_upload'],
        cost: { energy: 50, data: 30, bandwidth: 4 },
        effects: {
            automation: { resource: 'data', rate: 60 },
            description: '+60 Data/second'
        }
    },

    // === NEW NETWORK NODES ===
    ft_communication: {
        id: 'ft_communication',
        name: 'FTL Comms',
        icon: '🚀',
        tier: 5,
        description: 'Faster-than-light data transfer.',
        requires: ['galactic_network'],
        cost: { energy: 40, data: 12, bandwidth: 3 },
        effects: {
            automation: { resource: 'bandwidth', rate: 15 },
            description: '+15 Bandwidth/second'
        }
    },

    wormhole_gateway: {
        id: 'wormhole_gateway',
        name: 'Wormhole Gate',
        icon: '🌀',
        tier: 5,
        description: 'Stable wormholes for transport.',
        requires: ['quantum_entanglement'],
        cost: { energy: 50, data: 15, bandwidth: 4 },
        effects: {
            automation: { resource: 'bandwidth', rate: 20 },
            allRatesMultiplier: 1.5,
            description: '+20 BW/s, 1.5x all rates'
        }
    },

    dark_fiber: {
        id: 'dark_fiber',
        name: 'Dark Fiber',
        icon: '🌑',
        tier: 5,
        description: 'Unused intergalactic cabling.',
        requires: ['shadow_network'],
        cost: { energy: 35, data: 10, bandwidth: 2 },
        effects: {
            automation: { resource: 'bandwidth', rate: 12 },
            description: '+12 Bandwidth/second'
        }
    },

    // === NEW SPECIAL NODES ===
    nano_swarm: {
        id: 'nano_swarm',
        name: 'Nano Swarm',
        icon: '🦟',
        tier: 5,
        description: 'Self-replicating nanobots.',
        requires: ['superintelligence'],
        cost: { energy: 45, data: 20, bandwidth: 3 },
        effects: {
            allRatesMultiplier: 1.5,
            description: '1.5x all passive rates'
        }
    },

    time_manipulation: {
        id: 'time_manipulation',
        name: 'Time Control',
        icon: '⏱️',
        tier: 5,
        description: 'Localized time acceleration.',
        requires: ['multiverse_access'],
        cost: { energy: 70, data: 30, bandwidth: 5 },
        effects: {
            allRatesMultiplier: 2,
            description: '2x all passive rates'
        }
    },

    planetary_computer: {
        id: 'planetary_computer',
        name: 'Planetary PC',
        icon: '🌍',
        tier: 5,
        description: 'Convert a planet into a computer.',
        requires: ['omniscient_database', 'stellar_forge'],
        cost: { energy: 100, data: 50, bandwidth: 10 },
        effects: {
            automation: { resource: 'data', rate: 100 },
            automation: { resource: 'energy', rate: 100 },
            description: '+100 Data/s, +100 Energy/s'
        }
    },

    stellar_engine: {
        id: 'stellar_engine',
        name: 'Stellar Engine',
        icon: '⚙️',
        tier: 5,
        description: 'Move stars with engines.',
        requires: ['stellar_forge', 'orbital_collector'],
        cost: { energy: 80, data: 20, bandwidth: 5 },
        effects: {
            energyPerClick: 50,
            description: '+50 Energy per click'
        }
    },

    void_storage: {
        id: 'void_storage',
        name: 'Void Storage',
        icon: '⬛',
        tier: 5,
        description: 'Store matter in the void.',
        requires: ['singularity_tap'],
        cost: { energy: 60, data: 30, bandwidth: 4 },
        effects: {
            automation: { resource: 'energy', rate: 200 },
            description: '+200 Energy/second'
        }
    },

    dark_flow: {
        id: 'dark_flow',
        name: 'Dark Flow',
        icon: '🌊',
        tier: 5,
        description: 'Energy from cosmic drift.',
        requires: ['dark_fiber', 'quantum_vacuum'],
        cost: { energy: 55, data: 25, bandwidth: 3 },
        effects: {
            automation: { resource: 'energy', rate: 180 },
            description: '+180 Energy/second'
        }
    },

    sentient_code: {
        id: 'sentient_code',
        name: 'Sentient Code',
        icon: '🤖',
        tier: 5,
        description: 'Code that thinks for itself.',
        requires: ['superintelligence', 'consciousness_upload'],
        cost: { energy: 50, data: 40, bandwidth: 5 },
        effects: {
            dataMultiplier: 3,
            description: '3x Data multiplier'
        }
    }
};
