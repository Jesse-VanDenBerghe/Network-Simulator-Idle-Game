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
        requires: ['core'],
        cost: { energy: 15 },
        effects: {
            description: 'Unlock computer systems and the Computer branch',
            narrate: {
                text: 'You power on the old PC. The screen flickers to life, displaying a command prompt. It seems functional, albeit slow.',
                duration: 8000
            }
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
            narrate: {
                text: 'You type /help into the command prompt. \nAvailable commands:\n- /generate: Generate data, but at what cost?.',
                duration: 8000
            }
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
            narrate: {
                text: 'You execute /generate. On the screen appears a single progressbar that slowly fills up. VEEEERY SLOW. After a while, it completes you see: "Data generation complete. 1 bit created."',
                duration: 10000
            },
            description: 'Unlock data processing capabilities'
        }
    }
};
