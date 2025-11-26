// Tier 6 Nodes - Transcendence (Ultimate unlocks)
// ================================================

export const tier6Nodes = {
    // === EXISTING NODES (PRESERVED) ===
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
            automation: { resource: 'bandwidth', rate: 40 },
            allRatesMultiplier: 5,
            description: '+40 Bandwidth/s, 5x all rates'
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

    // === NEW NODES ===
    // Energy Branch
    zero_entropy: {
        id: 'zero_entropy',
        name: 'Zero Entropy',
        icon: '❄️',
        tier: 6,
        description: 'Perfect energy efficiency.',
        requires: ['universal_energy'],
        cost: { energy: 25, data: 8, bandwidth: 2 },
        effects: {
            automation: { resource: 'energy', rate: 800 },
            description: '+800 Energy/second'
        }
    },

    dark_matter_harvest: {
        id: 'dark_matter_harvest',
        name: 'Dark Harvest',
        icon: '🌑',
        tier: 6,
        description: 'Harvest dark matter for energy.',
        requires: ['zero_entropy'],
        cost: { energy: 40, data: 15, bandwidth: 4 },
        effects: {
            automation: { resource: 'energy', rate: 1200 },
            description: '+1200 Energy/second'
        }
    },

    antimatter_factory: {
        id: 'antimatter_factory',
        name: 'Antimatter Fac',
        icon: '🏭',
        tier: 6,
        description: 'Mass produce antimatter.',
        requires: ['dark_matter_harvest'],
        cost: { energy: 60, data: 25, bandwidth: 8 },
        effects: {
            automation: { resource: 'energy', rate: 2000 },
            description: '+2000 Energy/second'
        }
    },

    // Data Branch
    knowledge_singularity: {
        id: 'knowledge_singularity',
        name: 'Knowledge Singularity',
        icon: '🎓',
        tier: 6,
        description: 'Infinite knowledge density.',
        requires: ['akashic_records'],
        cost: { energy: 30, data: 20, bandwidth: 3 },
        effects: {
            automation: { resource: 'data', rate: 200 },
            dataMultiplier: 5,
            description: '+200 Data/s, 5x multiplier'
        }
    },

    universal_library: {
        id: 'universal_library',
        name: 'Universal Lib',
        icon: '📚',
        tier: 6,
        description: 'Library of Babel realized.',
        requires: ['knowledge_singularity'],
        cost: { energy: 40, data: 30, bandwidth: 5 },
        effects: {
            automation: { resource: 'data', rate: 400 },
            description: '+400 Data/second'
        }
    },

    thought_processor: {
        id: 'thought_processor',
        name: 'Thought Processor',
        icon: '💭',
        tier: 6,
        description: 'Process pure thought.',
        requires: ['universal_library'],
        cost: { energy: 50, data: 40, bandwidth: 8 },
        effects: {
            automation: { resource: 'data', rate: 800 },
            dataPerClick: 50,
            description: '+800 Data/s, +50/click'
        }
    },

    // Network Branch
    teleportation_grid: {
        id: 'teleportation_grid',
        name: 'Teleport Grid',
        icon: '⚛️',
        tier: 6,
        description: 'Instant transport network.',
        requires: ['hivemind'],
        cost: { energy: 40, data: 20, bandwidth: 10 },
        effects: {
            automation: { resource: 'bandwidth', rate: 80 },
            description: '+80 Bandwidth/second'
        }
    },

    subspace_transceiver: {
        id: 'subspace_transceiver',
        name: 'Subspace Comms',
        icon: '📡',
        tier: 6,
        description: 'Communicate through subspace.',
        requires: ['teleportation_grid'],
        cost: { energy: 60, data: 30, bandwidth: 20 },
        effects: {
            automation: { resource: 'bandwidth', rate: 150 },
            description: '+150 Bandwidth/second'
        }
    },

    neural_uplink: {
        id: 'neural_uplink',
        name: 'Neural Uplink',
        icon: '🔌',
        tier: 6,
        description: 'Direct brain-to-network uplink.',
        requires: ['hivemind'],
        cost: { energy: 50, data: 25, bandwidth: 15 },
        effects: {
            allRatesMultiplier: 2,
            description: '2x all passive rates'
        }
    },

    // Research/Special
    technological_singularity: {
        id: 'technological_singularity',
        name: 'Singularity',
        icon: '🌌',
        tier: 6,
        description: 'Runaway technological growth.',
        requires: ['omega_point'],
        cost: { energy: 80, data: 40, bandwidth: 10 },
        effects: {
            allRatesMultiplier: 5,
            description: '5x all passive rates'
        }
    },

    ascended_biology: {
        id: 'ascended_biology',
        name: 'Ascended Bio',
        icon: '🧬',
        tier: 6,
        description: 'Biology merged with technology.',
        requires: ['technological_singularity'],
        cost: { energy: 60, data: 30, bandwidth: 5 },
        effects: {
            energyPerClick: 100,
            description: '+100 Energy per click'
        }
    },

    pure_energy_form: {
        id: 'pure_energy_form',
        name: 'Energy Form',
        icon: '👻',
        tier: 6,
        description: 'Shed the physical body.',
        requires: ['ascended_biology'],
        cost: { energy: 100, data: 50, bandwidth: 20 },
        effects: {
            allRatesMultiplier: 3,
            description: '3x all passive rates'
        }
    },

    // Connections/Bridges
    cosmic_bridge: {
        id: 'cosmic_bridge',
        name: 'Cosmic Bridge',
        icon: '🌉',
        tier: 6,
        description: 'Bridge between energy and data.',
        requires: ['universal_energy', 'akashic_records'],
        cost: { energy: 50, data: 50, bandwidth: 10 },
        effects: {
            automation: { resource: 'energy', rate: 500 },
            automation: { resource: 'data', rate: 100 },
            description: '+500 Energy/s, +100 Data/s'
        }
    },

    void_shield: {
        id: 'void_shield',
        name: 'Void Shield',
        icon: '🛡️',
        tier: 6,
        description: 'Protect against entropy.',
        requires: ['universal_energy'],
        cost: { energy: 60, data: 20, bandwidth: 5 },
        effects: {
            energyPerClick: 200,
            description: '+200 Energy per click'
        }
    },

    quantum_encryption: {
        id: 'quantum_encryption',
        name: 'Quantum Encrypt',
        icon: '🔐',
        tier: 6,
        description: 'Unbreakable encryption.',
        requires: ['hivemind'],
        cost: { energy: 40, data: 40, bandwidth: 10 },
        effects: {
            dataMultiplier: 3,
            description: '3x Data multiplier'
        }
    },

    transdimensional_server: {
        id: 'transdimensional_server',
        name: 'Trans-D Server',
        icon: '🖥️',
        tier: 6,
        description: 'Server existing in 4D.',
        requires: ['akashic_records', 'omega_point'],
        cost: { energy: 70, data: 60, bandwidth: 15 },
        effects: {
            automation: { resource: 'data', rate: 500 },
            description: '+500 Data/second'
        }
    }
};
