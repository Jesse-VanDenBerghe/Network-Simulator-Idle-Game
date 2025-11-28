// Computer branch
// Focuses on data processing and management.
// ====================

export const computerBranch = {

    // == Tier 1 Nodes ==
    gpa_old_pc: {
        id: 'gpa_old_pc',
        name: 'Grandpa\'s old PC',
        icon: '💻',
        tier: 1,
        branch: 'computer',
        description: 'An old computer left behind by your grandfather. Let\'s boot it up and see what it can do!',
        requires: ['old_shed'],
        cost: { energy: 15 },
        effects: {
            description: 'Unlock computer systems and the Computer branch'
        }
    },

    // == Tier 2 Nodes ==
    command_help: {
        id: 'command_help',
        name: '/help',
        icon: 'x',
        tier: 2,
        branch: 'computer',
        description: 'A simple command that provides assistance. Maybe it can help you understand the computer better?',
        requires: ['gpa_old_pc'],
        cost: { energy: 30 },
        effects: {
            description: 'Display available commands'
        }
    },

    command_generate: {
        id: 'command_generate',
        name: '/generate',
        icon: '📊',
        tier: 2,
        branch: 'computer',
        description: 'A command to process raw data and extract useful information. This could be valuable for your operations.',
        requires: ['command_help'],
        cost: { energy: 50 },
        effects: {
            unlockDataGeneration: true,
            unlockDataProcessing: true,
            description: 'Unlock data processing capabilities'
        }
    },

    // == Tier 3 Nodes ==

    ram_adjustment: {
        id: 'ram_adjustment',
        name: 'RAM Adjustment',
        icon: '🧠',
        tier: 3,
        branch: 'computer',
        description: 'A ram stick is loose, better adjust it to improve processing speed.',
        requires: ['command_generate'],
        cost: { energy: 40, data: 10 },
        maxLevel: 4,
        costScaling: 1.5,
        effects: {
            dataGenSpeedMultiplier: 1.5,
            description: 'Data generates 50% faster'
        }
    },

    usb_stick: {
        id: 'usb_stick',
        name: 'USB Stick',
        icon: '📀',
        tier: 3,
        branch: 'computer',
        description: 'You remember this old USB stick you had in your pocket. Because who doesn\'t carry around a USB stick in 2025? Let\'s plug it in to increase our data storage capacity.',
        requires: ['command_generate'],
        cost: { energy: 60, data: 1028 },
        effects: {
            maxDataCapacityBonus: 1028 * 16,
            description: 'Increase max data capacity by 16 KB'
        }
    },

    overclock: {
        id: 'overclock',
        name: 'Overclock',
        icon: '⚡',
        tier: 3,
        branch: 'computer',
        description: 'When building your own gaming rig, you always overclocked the CPU for that extra performance boost. Let\'s do it here too!',
        requires: ['command_generate'],
        cost: { energy: 40, data: 5 },
        maxLevel: 10,
        costScaling: 1.5,
        effects: {
            dataGenAmountBonus: 1,
            description: 'Generate +1 additional bit of data per tick'
        }
    },
};
