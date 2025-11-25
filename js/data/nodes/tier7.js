// Tier 7 Nodes - Godhood (Final tier)
// ====================================

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
    }
};
