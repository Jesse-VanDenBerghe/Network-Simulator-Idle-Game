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
            description: 'Increase max data capacity by 16 KB',
            narrate: {
                text: 'You plug in the USB stick. The computer recognizes it immediately, expanding its available storage. You can now store much more data than before!',
                duration: 8000
            }
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
            description: 'Generate +1 additional bit of data per tick',
            levelEffects: {
                2: {
                    narrate: {
                        text: 'You carefully adjust the system settings to overclock the CPU. The computer hums louder as it works harder, but data generation speeds up noticeably.',
                        duration: 8000
                    }
                },
                5: {
                    narrate: {
                        text: 'The overclocking is really paying off now! The computer is pushing its limits, and data is flowing in at an impressive rate.',
                        duration: 8000
                    }
                },
                10: {
                    narrate: {
                        text: 'As you see steam start to rise from the computer, you realize you might have pushed it a bit too far. I guess this is the most this old machine can handle!',
                        duration: 8000
                    }
                }
            }
        }
    },
};
