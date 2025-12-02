// Changelog Data
// ===============
// Version history for the game

export interface ChangelogSection {
    Added?: string[];
    Changed?: string[];
    Fixed?: string[];
    Removed?: string[];
}

export interface ChangelogEntry {
    version: string;
    date: string;
    sections: ChangelogSection;
}

export const ChangelogData: ChangelogEntry[] = [
    {
        version: '0.5.1',
        date: '2025-11-26',
        sections: {
            'Added': [
                'Changelog modal with version history',
                'Keyboard shortcut (Esc) to close modals'
            ],
            'Changed': [
                'Adjusted the bandwidth generation values a bit',
                'Disabled tier unlock gates (for now)'
            ],
            'Fixed': [],
            'Removed': [
                'Ascension cost scaling of node upgrades'
            ]
        }
    },
    {
        version: '0.5.0',
        date: '2025-11-20',
        sections: {
            'Added': [
                'Ascension system with Quantum Cores',
                'Prestige upgrades across multiple tiers',
                'Statistics tracking for game progress'
            ],
            'Changed': [
                'Refactored codebase to use composables pattern',
                'Improved save/load system'
            ],
            'Fixed': [],
            'Removed': []
        }
    },
    {
        version: '0.4.0',
        date: '2025-11-15',
        sections: {
            'Added': [
                'Bandwidth resource system',
                'New tier 5 and tier 6 nodes',
                'Particle effects for node unlocking',
                'Keyboard shortcut (u) to unlock selected nodes'
            ],
            'Changed': [
                'Updated node icons and visual design',
                'Improved radial layout algorithm'
            ],
            'Fixed': [
                'Node overlap issues in skill tree',
                'Save file corruption on unexpected shutdown'
            ],
            'Removed': []
        }
    }
];
