// Tier 5 Nodes - All 5 branches + Cloud gate
// ===========================================

export const tier5Nodes = {
    // === CLOUD BRANCH TIER 5 (unlocks Cloud) ===
    cloud_infrastructure: {
        id: 'cloud_infrastructure',
        name: 'Cloud Infrastructure',
        icon: '☁️',
        tier: 5,
        branch: 'cloud',
        isTierGate: true,
        description: 'Deploy cloud infrastructure and unlock Cloud branch.',
        requires: ['core'],
        cost: { energy: 1000, data: 300 },
        effects: {
            description: 'Unlocks Cloud branch and Tier 6'
        }
    }
};
