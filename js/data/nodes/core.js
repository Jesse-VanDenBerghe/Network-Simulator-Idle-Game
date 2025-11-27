// Tier 0 Nodes - Core
// ====================

export const core = {
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
            description: 'Starting node - unlocked by default',
            narrate: {
                text: 'You step into the old shed. Dust particles dance in the sunlight filtering through the cracks. It smells of aged wood and memories.' + 
                'The shed is dark... but you can make out a few objects: a hand crank mounted on the wall covered in cobwebs. It looks like it hasn\'t been used in years.',
                duration: 8000
            }
        }
    }
};
