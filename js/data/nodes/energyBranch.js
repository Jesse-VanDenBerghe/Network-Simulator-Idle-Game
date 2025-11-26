// Energy branch
// Focuses on energy generation
// ====================

export const energyBranch = {
    // == Tier 1 Nodes ==
    energy_unlock: {
        id: 'energy_unlock',
        name: 'Hand crank',
        icon: '⚡',
        tier: 1,
        branch: 'energy',
        x: 0,
        y: 0,
        description: 'You find a simple hand crank. Why not give it a turn, whats the worst that could happen?.....',
        requires: ['core'],
        cost: { energy: 0 },
        effects: {
            energyPerClick: 1,
            narrate: {
                text: 'When you turn the crank, you hear a faint humming sound...',
                duration: 8000
            },
            description: '+1 Energy per crank'
        }
    },

    // == Tier 2 Nodes ==
    energy_2_1: {
        id: 'energy_2_1',
        name: 'Oil',
        icon: '⚡',
        tier: 2,
        branch: 'energy',
        x: 0,
        y: 0,
        description: 'The crank is a bit stiff, maybe some oil would help it turn more smoothly?',
        requires: ['energy_unlock'],
        cost: { energy: 5 },
        effects: {
            energyPerClick: 1,
            description: '+1 Energy per crank'
        }
    },

    energy_2_2: {
        id: 'energy_2_2',
        name: 'Lightbulb',
        icon: '💡',
        tier: 2,
        branch: 'energy',
        x: 0,
        y: 0,
        description: 'Let there be light!',
        requires: ['energy_2_1', 'energy_2_3'],
        cost: { energy: 25 },
        effects: {
            description: 'Can\'t see in the dark? No problem, this lightbulb will help you out.',
            narrate: {
                text: 'When you turn on the light, the room is illuminated. The shed is empty, but there\'s an attic hatch above you that wasn\'t visible before.',
                duration: 10000
            }
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
        description: ' My hamster loves running in this thing, and it generates energy too!',
        requires: ['energy_unlock'],
        cost: { energy: 5},
        effects: {
            automation: { resource: 'energy', rate: 0.5 },
            description: '+0.5 Energy/second (passive)'
        }
    },

    // == Tier 3 Nodes ==
    
    energy_3_1: {
        id: 'energy_3_1',
        name: 'Explore Attic',
        icon: '📦',
        tier: 2,
        branch: 'energy',
        x: 0,
        y: 0,
        description: 'Since we have light now, why not search grandpa\'s attic for cool stuff?',
        requires: ['energy_2_2'],
        cost: { energy: 5 },
        effects: {
            unlockBranch: 'computer',
            narrate: {
                text: 'You found an old computer up in the attic! Lets see if it still works...',
                duration: 10000
            }
        }
    },
};