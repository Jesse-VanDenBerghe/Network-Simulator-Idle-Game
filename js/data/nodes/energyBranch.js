// Energy branch
// Focuses on energy generation
// ====================

export const energyBranch = {
    // == Tier 1 Nodes ==
    energy_unlock: {
        id: 'energy_unlock',
        name: 'Hand crank',
        icon: '🔧',
        tier: 1,
        branch: 'energy',
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
        name: 'Lubricant',
        icon: '🧴',
        tier: 2,
        branch: 'energy',
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
        icon: '🐹',
        tier: 2,
        branch: 'energy',
        description: ' My hamster loves running in this thing, and it generates energy too!',
        requires: ['energy_unlock'],
        cost: { energy: 5},
        effects: {
            automation: { resource: 'energy', rate: 0.5 },
            description: '+0.5 Energy/second (passive)'
        }
    },
    
    energy_2_4: {
        id: 'energy_2_4',
        name: 'Explore Attic',
        icon: '📦',
        tier: 2,
        branch: 'energy',
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

    // == Tier 3 Nodes ==
    energy_3_1: {
        id: 'energy_3_1',
        name: 'Turn harder',
        icon: '💪',
        tier: 3,
        branch: 'energy',
        description: 'Why not put some muscle into it? Give that crank a good, hard turn!',
        requires: ['energy_2_1'],
        cost: { energy: 100 },
        effects: {
            energyPerClick: 2,
            description: '+2 Energy per crank'
        }
    },

    energy_3_2: {
        id: 'energy_3_2',
        name: 'Catch a rat',
        icon: '🐀',
        tier: 3,
        branch: 'energy',
        description: 'There\'s a rat running around in here, maybe we can train it to run in the wheel?',
        requires: ['energy_2_3'],
        cost: { energy: 10 },
        effects: {
            automation: { resource: 'energy', rate: 1 },
            description: '+1 Energy/second (passive)'
        }
    },

    energy_3_3: {
        id: 'energy_3_3',
        name: 'Old Generator',
        icon: '⚙️',
        tier: 3,
        branch: 'energy',
        description: 'In the back of the attic, you find an old generator that looks like it could still work. Maybe we can power it up?',
        requires: ['energy_2_4'],
        cost: { energy: 100 },
        effects: {
            automation: { resource: 'energy', rate: 10 },
            description: '+10 Energy/second (passive)'
        }
    },
};