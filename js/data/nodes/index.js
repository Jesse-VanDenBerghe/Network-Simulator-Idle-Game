// Node Index - Combines all tier node files
// ==========================================

import { tier0Nodes } from './tier0.js';
import { tier1Nodes } from './tier1.js';
import { tier2Nodes } from './tier2.js';
import { tier3Nodes } from './tier3.js';
import { tier4Nodes } from './tier4.js';
import { tier5Nodes } from './tier5.js';
import { tier6Nodes } from './tier6.js';
import { tier7Nodes } from './tier7.js';

// Combine all node tiers into a single nodes object
export const allNodes = {
    ...tier0Nodes,
    ...tier1Nodes,
    ...tier2Nodes,
    ...tier3Nodes,
    ...tier4Nodes,
    ...tier5Nodes,
    ...tier6Nodes,
    ...tier7Nodes
};
