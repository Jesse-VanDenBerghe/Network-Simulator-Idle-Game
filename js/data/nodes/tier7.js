// Tier 7 Nodes - Godhood (Final tier before Cosmic)
// =================================================

export const tier7Nodes = {
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
    },

    // === DIVINE POWER ===
    law_manipulation: {
        id: 'law_manipulation',
        name: 'Law Manipulation',
        icon: '⚖️',
        tier: 7,
        description: 'Rewrite the laws of physics.',
        requires: ['universe_simulation'],
        cost: { energy: 25, data: 12, bandwidth: 3 },
        effects: {
            automation: { resource: 'energy', rate: 2000 },
            description: '+2000 Energy/second'
        }
    },

    energy_materialization: {
        id: 'energy_materialization',
        name: 'Matter Create',
        icon: '🧱',
        tier: 7,
        description: 'Convert energy directly into matter.',
        requires: ['law_manipulation'],
        cost: { energy: 30, data: 15, bandwidth: 4 },
        effects: {
            energyPerClick: 200,
            automation: { resource: 'energy', rate: 3000 },
            description: '+3000 Energy/s, +200/click'
        }
    },

    sun_forge: {
        id: 'sun_forge',
        name: 'Sun Forge',
        icon: '☀️',
        tier: 7,
        description: 'Create stars on demand.',
        requires: ['energy_materialization'],
        cost: { energy: 40, data: 20, bandwidth: 5 },
        effects: {
            automation: { resource: 'energy', rate: 5000 },
            description: '+5000 Energy/second'
        }
    },

    supernova_harvest: {
        id: 'supernova_harvest',
        name: 'Supernova',
        icon: '💥',
        tier: 7,
        description: 'Harvest the energy of dying stars.',
        requires: ['sun_forge'],
        cost: { energy: 50, data: 25, bandwidth: 6 },
        effects: {
            automation: { resource: 'energy', rate: 10000 },
            description: '+10,000 Energy/second'
        }
    },

    gravity_well: {
        id: 'gravity_well',
        name: 'Gravity Well',
        icon: '🧲',
        tier: 7,
        description: 'Bend gravity to your will.',
        requires: ['law_manipulation'],
        cost: { energy: 35, data: 15, bandwidth: 4 },
        effects: {
            energyPerClick: 300,
            description: '+300 Energy per click'
        }
    },

    // === DIVINE KNOWLEDGE ===
    matter_programming: {
        id: 'matter_programming',
        name: 'Matter Code',
        icon: '🧬',
        tier: 7,
        description: 'Program matter at the atomic level.',
        requires: ['universe_simulation'],
        cost: { energy: 25, data: 20, bandwidth: 3 },
        effects: {
            automation: { resource: 'data', rate: 1000 },
            dataMultiplier: 10,
            description: '+1000 Data/s, 10x multiplier'
        }
    },

    dna_sequencer: {
        id: 'dna_sequencer',
        name: 'Life Architect',
        icon: '🧬',
        tier: 7,
        description: 'Design lifeforms from scratch.',
        requires: ['matter_programming'],
        cost: { energy: 30, data: 25, bandwidth: 4 },
        effects: {
            automation: { resource: 'data', rate: 2000 },
            description: '+2000 Data/second'
        }
    },

    history_editor: {
        id: 'history_editor',
        name: 'History Editor',
        icon: '📜',
        tier: 7,
        description: 'Edit the past to change the present.',
        requires: ['matter_programming'],
        cost: { energy: 40, data: 30, bandwidth: 5 },
        effects: {
            automation: { resource: 'data', rate: 3000 },
            dataPerClick: 100,
            description: '+3000 Data/s, +100/click'
        }
    },

    future_sight: {
        id: 'future_sight',
        name: 'Future Sight',
        icon: '🔮',
        tier: 7,
        description: 'See all possible futures.',
        requires: ['history_editor'],
        cost: { energy: 50, data: 40, bandwidth: 6 },
        effects: {
            dataMultiplier: 20,
            description: '20x Data multiplier'
        }
    },

    probability_engine: {
        id: 'probability_engine',
        name: 'Probability Engine',
        icon: '🎲',
        tier: 7,
        description: 'Control luck and chance.',
        requires: ['future_sight'],
        cost: { energy: 60, data: 50, bandwidth: 8 },
        effects: {
            automation: { resource: 'data', rate: 5000 },
            description: '+5000 Data/second'
        }
    },

    // === DIVINE PRESENCE ===
    instant_transmission: {
        id: 'instant_transmission',
        name: 'Instant Trans',
        icon: '⚡',
        tier: 7,
        description: 'Be everywhere at once.',
        requires: ['universe_simulation'],
        cost: { energy: 30, data: 15, bandwidth: 10 },
        effects: {
            automation: { resource: 'bandwidth', rate: 200 },
            description: '+200 Bandwidth/second'
        }
    },

    omnipresence: {
        id: 'omnipresence',
        name: 'Omnipresence',
        icon: '👀',
        tier: 7,
        description: 'Exist in all places simultaneously.',
        requires: ['instant_transmission'],
        cost: { energy: 50, data: 25, bandwidth: 20 },
        effects: {
            automation: { resource: 'bandwidth', rate: 500 },
            allRatesMultiplier: 2,
            description: '+500 BW/s, 2x all rates'
        }
    },

    telepathy_network: {
        id: 'telepathy_network',
        name: 'Telepathy Net',
        icon: '🧠',
        tier: 7,
        description: 'Connect all minds instantly.',
        requires: ['omnipresence'],
        cost: { energy: 80, data: 40, bandwidth: 40 },
        effects: {
            automation: { resource: 'bandwidth', rate: 1000 },
            description: '+1000 Bandwidth/second'
        }
    },

    hive_controller: {
        id: 'hive_controller',
        name: 'Hive Controller',
        icon: '👑',
        tier: 7,
        description: 'Absolute control over the collective.',
        requires: ['telepathy_network'],
        cost: { energy: 120, data: 60, bandwidth: 60 },
        effects: {
            allRatesMultiplier: 3,
            description: '3x all passive rates'
        }
    },

    // === DIVINE ASCENSION ===
    immortality: {
        id: 'immortality',
        name: 'Immortality',
        icon: '☥',
        tier: 7,
        description: 'Live forever.',
        requires: ['universe_simulation'],
        cost: { energy: 100, data: 50, bandwidth: 10 },
        effects: {
            allRatesMultiplier: 5,
            description: '5x all passive rates'
        }
    },

    dimension_creation: {
        id: 'dimension_creation',
        name: 'Dimension Create',
        icon: '🚪',
        tier: 7,
        description: 'Create new pocket dimensions.',
        requires: ['immortality'],
        cost: { energy: 200, data: 100, bandwidth: 20 },
        effects: {
            automation: { resource: 'energy', rate: 5000 },
            automation: { resource: 'data', rate: 2500 },
            description: '+5000 Energy/s, +2500 Data/s'
        }
    },

    soul_harvest: {
        id: 'soul_harvest',
        name: 'Soul Harvest',
        icon: '👻',
        tier: 7,
        description: 'Collect souls for power.',
        requires: ['dimension_creation'],
        cost: { energy: 300, data: 150, bandwidth: 30 },
        effects: {
            energyPerClick: 1000,
            description: '+1000 Energy per click'
        }
    },

    divine_intervention: {
        id: 'divine_intervention',
        name: 'Divine Intervene',
        icon: '✋',
        tier: 7,
        description: 'Miraculous events occur.',
        requires: ['immortality'],
        cost: { energy: 150, data: 80, bandwidth: 15 },
        effects: {
            allRatesMultiplier: 2,
            description: '2x all passive rates'
        }
    },

    // === COSMIC GATES ===
    cosmic_awareness: {
        id: 'cosmic_awareness',
        name: 'Cosmic Aware',
        icon: '🌌',
        tier: 7,
        description: 'Become aware of the greater cosmos.',
        requires: ['probability_engine', 'supernova_harvest'],
        cost: { energy: 500, data: 250, bandwidth: 50 },
        effects: {
            automation: { resource: 'data', rate: 10000 },
            description: '+10,000 Data/second'
        }
    },

    void_gaze: {
        id: 'void_gaze',
        name: 'Gaze into Void',
        icon: '👁️',
        tier: 7,
        description: 'When you gaze into the void...',
        requires: ['hive_controller'],
        cost: { energy: 400, data: 200, bandwidth: 100 },
        effects: {
            automation: { resource: 'bandwidth', rate: 2000 },
            description: '+2000 Bandwidth/second'
        }
    },

    reality_anchor: {
        id: 'reality_anchor',
        name: 'Reality Anchor',
        icon: '⚓',
        tier: 7,
        description: 'Prevent reality from collapsing.',
        requires: ['dimension_creation'],
        cost: { energy: 600, data: 300, bandwidth: 60 },
        effects: {
            automation: { resource: 'energy', rate: 20000 },
            description: '+20,000 Energy/second'
        }
    },

    transcendence_prep: {
        id: 'transcendence_prep',
        name: 'Preparation',
        icon: '🧘',
        tier: 7,
        description: 'Prepare body and mind for cosmic scale.',
        requires: ['cosmic_awareness', 'void_gaze', 'reality_anchor'],
        cost: { energy: 1000, data: 500, bandwidth: 200 },
        effects: {
            allRatesMultiplier: 10,
            description: '10x all passive rates'
        }
    },

    ascension_gate: {
        id: 'ascension_gate',
        name: 'Ascension Gate',
        icon: '⛩️',
        tier: 7,
        description: 'The gateway to the cosmic tier.',
        requires: ['transcendence_prep'],
        cost: { energy: 2000, data: 1000, bandwidth: 500 },
        effects: {
            allRatesMultiplier: 20,
            description: 'Ready for Tier 8'
        }
    }
};
