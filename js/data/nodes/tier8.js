// Tier 8 Nodes - Cosmic (Endgame)
// ===============================

export const tier8Nodes = {
    // === COSMIC ENERGY ===
    cosmic_forge: {
        id: 'cosmic_forge',
        name: 'Cosmic Forge',
        icon: '🌟',
        tier: 8,
        description: 'Forge energy from raw stardust.',
        requires: ['universe_simulation'],
        cost: { energy: 100, data: 25, bandwidth: 5 },
        effects: {
            automation: { resource: 'energy', rate: 1000 },
            description: '+1000 Energy/second'
        }
    },

    stellar_nursery: {
        id: 'stellar_nursery',
        name: 'Stellar Nursery',
        icon: '✨',
        tier: 8,
        description: 'Birthplace of stars.',
        requires: ['cosmic_forge'],
        cost: { energy: 150, data: 40, bandwidth: 8 },
        effects: {
            automation: { resource: 'energy', rate: 2500 },
            description: '+2500 Energy/second'
        }
    },

    galaxy_cluster: {
        id: 'galaxy_cluster',
        name: 'Galaxy Cluster',
        icon: '🌌',
        tier: 8,
        description: 'Harness the power of entire galaxy clusters.',
        requires: ['stellar_nursery'],
        cost: { energy: 300, data: 80, bandwidth: 15 },
        effects: {
            automation: { resource: 'energy', rate: 10000 },
            description: '+10,000 Energy/second'
        }
    },

    dark_matter_reactor: {
        id: 'dark_matter_reactor',
        name: 'Dark Matter Reactor',
        icon: '⚫',
        tier: 8,
        description: 'Extract energy from dark matter.',
        requires: ['galaxy_cluster'],
        cost: { energy: 500, data: 120, bandwidth: 25 },
        effects: {
            automation: { resource: 'energy', rate: 25000 },
            energyPerClick: 500,
            description: '+25,000 Energy/s, +500/click'
        }
    },

    vacuum_energy: {
        id: 'vacuum_energy',
        name: 'Vacuum Energy',
        icon: '🌀',
        tier: 8,
        description: 'Infinite energy from empty space.',
        requires: ['dark_matter_reactor'],
        cost: { energy: 1000, data: 200, bandwidth: 50 },
        effects: {
            automation: { resource: 'energy', rate: 100000 },
            description: '+100,000 Energy/second'
        }
    },

    // === UNIVERSAL DATA ===
    void_processor: {
        id: 'void_processor',
        name: 'Void Processor',
        icon: '🕳️',
        tier: 8,
        description: 'Process data in the void.',
        requires: ['universe_simulation'],
        cost: { energy: 80, data: 50, bandwidth: 4 },
        effects: {
            automation: { resource: 'data', rate: 500 },
            dataMultiplier: 20,
            description: '+500 Data/s, 20x multiplier'
        }
    },

    timeline_archivist: {
        id: 'timeline_archivist',
        name: 'Timeline Archivist',
        icon: '⏳',
        tier: 8,
        description: 'Record every timeline variation.',
        requires: ['void_processor'],
        cost: { energy: 120, data: 100, bandwidth: 10 },
        effects: {
            automation: { resource: 'data', rate: 1500 },
            description: '+1500 Data/second'
        }
    },

    reality_simulator: {
        id: 'reality_simulator',
        name: 'Reality Simulator',
        icon: '🎭',
        tier: 8,
        description: 'Simulate alternate realities for data.',
        requires: ['timeline_archivist'],
        cost: { energy: 250, data: 250, bandwidth: 20 },
        effects: {
            automation: { resource: 'data', rate: 5000 },
            dataPerClick: 200,
            description: '+5000 Data/s, +200/click'
        }
    },

    omniscient_core: {
        id: 'omniscient_core',
        name: 'Omniscient Core',
        icon: '👁️',
        tier: 8,
        description: 'Knowing everything that can be known.',
        requires: ['reality_simulator'],
        cost: { energy: 600, data: 600, bandwidth: 40 },
        effects: {
            automation: { resource: 'data', rate: 20000 },
            dataMultiplier: 50,
            description: '+20,000 Data/s, 50x multiplier'
        }
    },

    // === COSMIC NETWORK ===
    interdimensional_link: {
        id: 'interdimensional_link',
        name: 'Dimension Link',
        icon: '🚪',
        tier: 8,
        description: 'Connect to other dimensions.',
        requires: ['universe_simulation'],
        cost: { energy: 150, data: 60, bandwidth: 10 },
        effects: {
            automation: { resource: 'bandwidth', rate: 50 },
            description: '+50 Bandwidth/second'
        }
    },

    wormhole_router: {
        id: 'wormhole_router',
        name: 'Wormhole Router',
        icon: '🌪️',
        tier: 8,
        description: 'Route traffic through wormholes.',
        requires: ['interdimensional_link'],
        cost: { energy: 300, data: 100, bandwidth: 25 },
        effects: {
            automation: { resource: 'bandwidth', rate: 150 },
            allRatesMultiplier: 2,
            description: '+150 Bandwidth/s, 2x all rates'
        }
    },

    entangled_fabric: {
        id: 'entangled_fabric',
        name: 'Entangled Fabric',
        icon: '🕸️',
        tier: 8,
        description: 'The very fabric of space serves the network.',
        requires: ['wormhole_router'],
        cost: { energy: 600, data: 200, bandwidth: 60 },
        effects: {
            automation: { resource: 'bandwidth', rate: 500 },
            description: '+500 Bandwidth/second'
        }
    },

    // === TRANSCENDENT UPGRADES ===
    time_dilation: {
        id: 'time_dilation',
        name: 'Time Dilation',
        icon: '⏱️',
        tier: 8,
        description: 'Slow time to process more.',
        requires: ['stellar_nursery', 'void_processor'],
        cost: { energy: 200, data: 100, bandwidth: 20 },
        effects: {
            allRatesMultiplier: 5,
            description: '5x all passive rates'
        }
    },

    spatial_compression: {
        id: 'spatial_compression',
        name: 'Space Compress',
        icon: '📦',
        tier: 8,
        description: 'Compress space to reduce latency.',
        requires: ['interdimensional_link', 'void_processor'],
        cost: { energy: 200, data: 100, bandwidth: 20 },
        effects: {
            dataMultiplier: 10,
            description: '10x Data multiplier'
        }
    },

    entropy_reversal: {
        id: 'entropy_reversal',
        name: 'Entropy Reversal',
        icon: '🔄',
        tier: 8,
        description: 'Reverse entropy to gain energy.',
        requires: ['cosmic_forge', 'interdimensional_link'],
        cost: { energy: 250, data: 80, bandwidth: 15 },
        effects: {
            energyPerClick: 1000,
            description: '+1000 Energy per click'
        }
    },

    // === COSMIC STRUCTURES ===
    galactic_brain: {
        id: 'galactic_brain',
        name: 'Galactic Brain',
        icon: '🧠',
        tier: 8,
        description: 'Convert a galaxy into a neural network.',
        requires: ['galaxy_cluster', 'timeline_archivist'],
        cost: { energy: 500, data: 300, bandwidth: 50 },
        effects: {
            automation: { resource: 'data', rate: 5000 },
            automation: { resource: 'bandwidth', rate: 200 },
            description: '+5000 Data/s, +200 Bandwidth/s'
        }
    },

    universal_constant: {
        id: 'universal_constant',
        name: 'Universal Constant',
        icon: 'π',
        tier: 8,
        description: 'Alter the constants of the universe.',
        requires: ['reality_simulator', 'wormhole_router'],
        cost: { energy: 800, data: 400, bandwidth: 80 },
        effects: {
            allRatesMultiplier: 10,
            description: '10x all passive rates'
        }
    },

    creation_engine: {
        id: 'creation_engine',
        name: 'Creation Engine',
        icon: '⚙️',
        tier: 8,
        description: 'The engine that drives creation.',
        requires: ['vacuum_energy', 'omniscient_core', 'entangled_fabric'],
        cost: { energy: 2000, data: 1000, bandwidth: 200 },
        effects: {
            automation: { resource: 'energy', rate: 500000 },
            automation: { resource: 'data', rate: 100000 },
            automation: { resource: 'bandwidth', rate: 5000 },
            description: 'Massive resource generation'
        }
    },

    // === MORE COSMIC NODES ===
    star_eater: {
        id: 'star_eater',
        name: 'Star Eater',
        icon: '🍽️',
        tier: 8,
        description: 'Consume stars for raw power.',
        requires: ['stellar_nursery'],
        cost: { energy: 250, data: 50, bandwidth: 10 },
        effects: {
            energyPerClick: 500,
            automation: { resource: 'energy', rate: 5000 },
            description: '+500/click, +5000 Energy/s'
        }
    },

    pulsar_beacon: {
        id: 'pulsar_beacon',
        name: 'Pulsar Beacon',
        icon: '🚨',
        tier: 8,
        description: 'Use pulsars for cosmic timing.',
        requires: ['interdimensional_link'],
        cost: { energy: 200, data: 80, bandwidth: 30 },
        effects: {
            automation: { resource: 'bandwidth', rate: 100 },
            description: '+100 Bandwidth/second'
        }
    },

    nebula_cloud: {
        id: 'nebula_cloud',
        name: 'Nebula Cloud',
        icon: '☁️',
        tier: 8,
        description: 'Store data in interstellar gas.',
        requires: ['void_processor'],
        cost: { energy: 150, data: 150, bandwidth: 15 },
        effects: {
            automation: { resource: 'data', rate: 1000 },
            description: '+1000 Data/second'
        }
    },

    quasar_cannon: {
        id: 'quasar_cannon',
        name: 'Quasar Cannon',
        icon: '🔭',
        tier: 8,
        description: 'Direct quasar jets for transmission.',
        requires: ['galaxy_cluster'],
        cost: { energy: 600, data: 100, bandwidth: 40 },
        effects: {
            automation: { resource: 'energy', rate: 15000 },
            automation: { resource: 'bandwidth', rate: 200 },
            description: '+15k Energy/s, +200 Bandwidth/s'
        }
    },

    black_hole_computer: {
        id: 'black_hole_computer',
        name: 'Black Hole PC',
        icon: '💻',
        tier: 8,
        description: 'Computation at the event horizon.',
        requires: ['dark_matter_reactor', 'void_processor'],
        cost: { energy: 700, data: 400, bandwidth: 50 },
        effects: {
            automation: { resource: 'data', rate: 10000 },
            dataMultiplier: 5,
            description: '+10k Data/s, 5x Data multiplier'
        }
    },

    tachyon_network: {
        id: 'tachyon_network',
        name: 'Tachyon Net',
        icon: '⚡',
        tier: 8,
        description: 'Faster-than-light communication.',
        requires: ['wormhole_router'],
        cost: { energy: 500, data: 200, bandwidth: 100 },
        effects: {
            automation: { resource: 'bandwidth', rate: 300 },
            allRatesMultiplier: 2,
            description: '+300 BW/s, 2x all rates'
        }
    },

    multiverse_map: {
        id: 'multiverse_map',
        name: 'Multiverse Map',
        icon: '🗺️',
        tier: 8,
        description: 'Map of all realities.',
        requires: ['reality_simulator', 'interdimensional_link'],
        cost: { energy: 400, data: 400, bandwidth: 40 },
        effects: {
            dataMultiplier: 15,
            description: '15x Data multiplier'
        }
    },

    cosmic_strings: {
        id: 'cosmic_strings',
        name: 'Cosmic Strings',
        icon: '🎻',
        tier: 8,
        description: 'Vibrate the universe strings.',
        requires: ['vacuum_energy'],
        cost: { energy: 1200, data: 300, bandwidth: 60 },
        effects: {
            energyPerClick: 2000,
            description: '+2000 Energy per click'
        }
    },

    divine_spark: {
        id: 'divine_spark',
        name: 'Divine Spark',
        icon: '🎇',
        tier: 8,
        description: 'The spark that started it all.',
        requires: ['creation_engine'],
        cost: { energy: 5000, data: 2000, bandwidth: 500 },
        effects: {
            allRatesMultiplier: 100,
            description: '100x all passive rates'
        }
    },

    // Filler nodes to reach 30
    dark_energy_sail: {
        id: 'dark_energy_sail',
        name: 'Dark Energy Sail',
        icon: '⛵',
        tier: 8,
        description: 'Propulsion using dark energy.',
        requires: ['dark_matter_reactor'],
        cost: { energy: 600, data: 100, bandwidth: 30 },
        effects: {
            automation: { resource: 'energy', rate: 30000 },
            description: '+30,000 Energy/second'
        }
    },

    holographic_universe: {
        id: 'holographic_universe',
        name: 'Holographic Uni',
        icon: '🌈',
        tier: 8,
        description: 'The universe is a hologram.',
        requires: ['reality_simulator'],
        cost: { energy: 400, data: 350, bandwidth: 30 },
        effects: {
            automation: { resource: 'data', rate: 8000 },
            description: '+8000 Data/second'
        }
    },

    the_end: {
        id: 'the_end',
        name: 'The End',
        icon: '🏁',
        tier: 8,
        description: 'The final node... for now.',
        requires: ['divine_spark'],
        cost: { energy: 10000, data: 5000, bandwidth: 1000 },
        effects: {
            allRatesMultiplier: 1000,
            description: '1000x all passive rates'
        }
    }
};
