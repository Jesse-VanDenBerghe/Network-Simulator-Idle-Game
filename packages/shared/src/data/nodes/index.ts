// Node Index - Combines all tier node files
// ==========================================

import { core } from './core';
import { energyBranch } from './energyBranch';
import { computerBranch } from './computerBranch';
import type { NodeCollection } from '../../types/node';

// Combine all node tiers into a single nodes object
export const allNodes: NodeCollection = {
    ...core,
    ...energyBranch,
    ...computerBranch
};
