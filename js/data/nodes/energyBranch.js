// Energy branch
// Focuses on energy generation
// ====================

export const energyBranch = {
    // == Tier 1 Nodes ==
    hand_crank: {
        id: 'hand_crank',
        name: 'Hand crank',
        icon: '🔧',
        tier: 1,
        branch: 'energy',
        description: 'You find a simple hand crank. Why not give it a turn, whats the worst that could happen?.....',
        requires: ['old_shed'],
        cost: { energy: 0 },
        effects: {
            energyPerClick: 1,
            description: '+1 Energy per crank'
        }
    },

    // == Tier 2 Nodes ==
    lubricant: {
        id: 'lubricant',
        name: 'Lubricant',
        icon: '🧴',
        tier: 2,
        branch: 'energy',
        description: 'The crank is a bit stiff, maybe some oil would help it turn more smoothly?',
        requires: ['hand_crank'],
        cost: { energy: 10 },
        effects: {
            energyPerClick: 1,
            description: '+1 Energy per crank'
        }
    },

    lightbulb: {
        id: 'lightbulb',
        name: 'Lightbulb',
        icon: '💡',
        tier: 2,
        branch: 'energy',
        description: 'Let there be light!',
        requires: ['lubricant', 'hamster_wheel'],
        cost: { energy: 50 },
        effects: {
            description: 'Can\'t see in the dark? No problem, this lightbulb will help you out.'
        }
    },

    hamster_wheel: {
        id: 'hamster_wheel',
        name: 'Hamster Wheel',
        icon: '🐹',
        tier: 2,
        branch: 'energy',
        description: ' My hamster Lucy loves running in this thing, and it generates energy too!',
        requires: ['hand_crank'],
        cost: { energy: 25},
        effects: {
            automation: { resource: 'energy', rate: 0.5 },
            description: '+0.5 Energy/second (passive)'
        }
    },
    
    attic: {
        id: 'attic',
        name: 'Explore Attic',
        icon: '📦',
        tier: 2,
        branch: 'energy',
        description: 'Since we have light now, why not search grandpa\'s attic for cool stuff?',
        requires: ['lightbulb'],
        cost: { energy: 100 },
        effects: {
            unlockBranch: 'computer'
        }
    },

    // == Tier 3 Nodes ==
    crank_harder: {
        id: 'crank_harder',
        name: 'Turn harder',
        icon: '💪',
        tier: 3,
        branch: 'energy',
        description: 'Why not put some muscle into it? Give that crank a good, hard turn!',
        requires: ['lubricant'],
        cost: { energy: 5 },
        maxLevel: 10,
        costScaling: 1.5,
        effects: {
            energyPerClick: 2,
            description: '+2 Energy per crank',
            levelEffects: {
                10: {
                    disableCrank: true
                }
            }
        }
    },

    catch_rat: {
        id: 'catch_rat',
        name: 'Catch a rat',
        icon: '🐀',
        tier: 3,
        branch: 'energy',
        description: 'There\'s a rat running around in here, maybe we can train it to run in the wheel?',
        requires: ['hamster_wheel'],
        cost: { energy: 10 },
        maxLevel: 5,
        costScaling: 1.5,
        effects: {
            automation: { resource: 'energy', rate: 1 },
            description: '+1 Energy/second per level (passive)'
        }
    },

    old_generator: {
        id: 'old_generator',
        name: 'Old Generator',
        icon: '⚙️',
        tier: 3,
        branch: 'energy',
        description: 'In the back of the attic, you find an old generator that looks like it could still work. Maybe we can power it up?',
        requires: ['attic'],
        cost: { energy: 100, data: 50 },
        effects: {
            automation: { resource: 'energy', rate: 25 },
            description: '+25 Energy/second (passive)'
        }
    },

    rat_king: {
        id: 'rat_king',
        name: 'Rat king',
        icon: '👑',
        tier: 3,
        branch: 'energy',
        description: 'After catching a few rats, one of them seems to be the leader. Maybe if we catch it, the others will follow?',
        requires: [{ id: 'catch_rat', level: 5 }],
        cost: { energy: 100 , data: 10},
        effects: {
            automation: { resource: 'energy', rate: 10 },
            description: '+10 Energy/second (passive)'
        }
    },

    // == Tier 4 Nodes ==
    
};