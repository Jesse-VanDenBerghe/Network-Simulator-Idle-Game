// Energy branch
// Focusses on energy generation and management.
// ====================

export const energyBranch = {
    // == Tier 1 Nodes ==
    energy_unlock: {
        id: 'energy_unlock',
        name: 'Energy!',
        icon: '⚡',
        tier: 1,
        branch: 'energy',
        x: 0,
        y: 0,
        description: 'Increases manual energy generation.',
        requires: ['core'],
        cost: { energy: 10 },
        effects: {
            energyPerClick: 1,
            description: '+1 Energy per click'
        }
    },

    // == Tier 2 Nodes ==
    energy_2_1: {
        id: 'energy_2_1',
        name: 'Power outlet',
        icon: '⚡',
        tier: 2,
        branch: 'energy',
        x: 0,
        y: 0,
        description: 'Basic energy generator. Produces energy automatically.',
        requires: ['energy_unlock'],
        cost: { energy: 5 },
        effects: {
            automation: { resource: 'energy', rate: 1 },
            description: '+1 Energy/second (passive)'
        }
    },

    energy_2_2: {
        id: 'energy_2_2',
        name: 'Data??',
        icon: '❓',
        tier: 2,
        branch: 'energy',
        x: 0,
        y: 0,
        description: 'What to do with all this energy?',
        requires: ['energy_unlock'],
        cost: { energy: 25 },
        effects: {
            unlockBranch: 'data',
            description: 'Unlock the Data branch'
        }
    },

    energy_2_3: {
        id: 'energy_2_3',
        name: 'Hamster Wheel',
        icon: '⚡',
        tier: 2,
        branch: 'energy',
        x: 0,
        y: 0,
        description: 'Harness the power of the sun.',
        requires: ['energy_unlock'],
        cost: { energy: 5},
        effects: {
            automation: { resource: 'energy', rate: 0.5 },
            description: '+0.5 Energy/second (passive)'
        }
    }

};