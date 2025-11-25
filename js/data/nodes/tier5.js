// Tier 5 Nodes - Master unlocks
// ==============================

export const tier5Nodes = {
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
    }
};
