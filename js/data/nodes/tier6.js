// Tier 6 Nodes - Transcendence (Ultimate unlocks)
// ================================================

export const tier6Nodes = {
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
    }
};
