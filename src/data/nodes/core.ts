// Tier 0 Nodes - Core
// ====================

import type { Node } from '../../types/node';

export const core: Record<string, Node> = {
    old_shed: {
        id: 'old_shed',
        name: 'Old Shed',
        icon: '🏠',
        tier: 0,
        branch: null,
        description: 'You just inherited this old shed from your grandfather. It looks abandoned, but maybe there\'s something useful inside?',
        requires: [],
        cost: {},
        effects: {
            description: 'Starting node - unlocked by default'
        }
    }
};
