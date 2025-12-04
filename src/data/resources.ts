// Resource Definitions
// ====================

import type { Resource, ResourceId } from '../types/game';

/**
 * Available resources in the game
 */
export const RESOURCES: Record<ResourceId, Resource> = {
    energy: {
        id: 'energy',
        name: 'Energy',
        icon: '⚡',
        color: '#00ffaa'
    },
    data: {
        id: 'data',
        name: 'Data',
        icon: '📊',
        color: '#00aaff'
    }
} as const;
