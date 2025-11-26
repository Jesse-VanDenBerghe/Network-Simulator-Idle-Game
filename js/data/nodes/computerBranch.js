// Computer branch
// Focuses on data processing and management.
// ====================

export const computerBranch = {

    // == Tier 1 Nodes ==
    computer_unlock: {
        id: 'computer_unlock',
        name: 'Grandpa\'s old PC',
        icon: '💻',
        tier: 1,
        branch: 'computer',
        description: 'An old computer left behind by your grandfather. Let\'s boot it up and see what it can do!',
        requires: ['core'],
        cost: { energy: 15 },
        effects: {
            description: 'Unlock computer systems and the Computer branch'
        }
    },
};
