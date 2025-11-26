// Tier 7 Nodes - Endgame
// =======================

export const tier7Nodes = {
    universe_simulation: {
        id: 'universe_simulation',
        name: 'Universe Simulation',
        icon: '🌌',
        tier: 7,
        branch: 'endgame',
        description: 'Simulate the entire universe.',
        requires: ['core'],
        cost: { energy: 10000, data: 5000 },
        effects: {
            allRatesMultiplier: 5,
            description: '5x all passive rates - You win!'
        }
    }
};
