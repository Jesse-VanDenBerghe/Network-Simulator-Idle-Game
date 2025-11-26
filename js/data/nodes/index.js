// Node Index - Combines all tier node files
// ==========================================

import { core } from './core.js';
import { energyBranch } from './energyBranch.js';
import { computerBranch } from './computerBranch.js';

// Combine all node tiers into a single nodes object
export const allNodes = {
    ...core,
    ...energyBranch,
    ...computerBranch,
};
