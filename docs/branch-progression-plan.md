# Branch-Based Progression System

## Problem Statement
Redesign node progression from tier-based unlocking to branch-based progression where each branch (Power, Processing, Network, Research, Security, Cloud) unlocks sequentially via special "Tier Gate" nodes.

## Current State
- 77+ nodes organized by tier (tier0.js through tier8.js)
- Nodes have `tier` property for cost scaling and gating
- `TIER_GATES` in constants.js controls tier access
- Visibility: nodes show when unlocked OR when all parents are unlocked
- Branches exist thematically but aren't enforced by game logic

## Proposed Changes

### 1. Data Model Changes

**Add `branch` property to all nodes:**
- `null` - Core (Tier 0)
- `'energy'` - Energy generation (⚡)
- `'data'` - Data production (📊)
- `'network'` - Bandwidth/connectivity (📡)
- `'research'` - Efficiency/multipliers (🔬)
- `'security'` - Cost reduction (🛡️)
- `'cloud'` - Core generation multipliers (☁️)
- `'endgame'` - Final node (Tier 7)

**Add `isTierGate` property:**
- Boolean flag on nodes that unlock the next branch

**Update `constants.js`:**
- Add `BRANCH_UNLOCK_ORDER: ['energy', 'data', 'network', 'research', 'security', 'cloud', 'endgame']`

### 2. New Branch Unlocking Logic

**File: `js/utils/branchUtils.js` (new)**
- `getUnlockedBranches(unlockedNodes)` - returns Set of branch names based on unlocked tier gates
- `isBranchUnlocked(branch, unlockedNodes)` - checks if specific branch is accessible
- `getNextBranchToUnlock(unlockedNodes)` - returns the next branch that can be unlocked

### 3. Visibility Changes

**File: `js/components/SkillTree.js`**
- Update `isNodeVisible(node)` to check:
  1. Node's branch is unlocked, AND
  2. Node is unlocked OR node is available (parents unlocked) AND node.tier <= current max tier for that branch

### 4. Node Progression Rules

- **Tier 0**: Core only (unlocked by default)
- **Tier 1**: Power branch appears (1 node + Power Tier Gate)
- **Tier 2**: Unlocking Power Gate → Processing branch appears; Power gets +2 nodes
- **Tier 3**: Unlocking Processing Gate → Network branch appears; Power/Processing get +3 nodes each
- **Tier 4**: Unlocking Network Gate → Research branch appears
- **Tier 5**: Unlocking Research Gate → Security branch appears
- **Tier 6**: Unlocking Security Gate → Cloud branch appears
- **Tier 7**: Unlocking Cloud Gate → Endgame node appears

### 5. Node Count Distribution

Nodes per branch per tier (excluding tier gates):

| Tier | Power | Processing | Network | Research | Security | Cloud | Total |
|------|-------|------------|---------|----------|----------|-------|-------|
| 1    | 1+gate | -         | -       | -        | -        | -     | 2     |
| 2    | 2     | 2+gate     | -       | -        | -        | -     | 5     |
| 3    | 3     | 3          | 3+gate  | -        | -        | -     | 10    |
| 4    | 4     | 4          | 4       | 4+gate   | -        | -     | 17    |
| 5    | 5     | 5          | 5       | 5        | 5+gate   | -     | 26    |
| 6    | 6     | 6          | 6       | 6        | 6        | 6+gate| 37    |
| 7    | -     | -          | -       | -        | -        | -     | 1 (endgame) |

**Total: 99 nodes** (including core + endgame)

### 6. File Changes Summary

**Modify:**
- `js/data/constants.js` - Add branch constants
- `js/data/nodes/*.js` - Add `branch` and `isTierGate` properties to all nodes
- `js/components/SkillTree.js` - Update visibility logic
- `js/composables/useGameState.js` - Track unlocked branches
- `js/utils/nodeUtils.js` - Add branch-aware tier gating

**Create:**
- `js/utils/branchUtils.js` - Branch unlocking utilities

### 7. Implementation Order

1. Add branch constants to `constants.js`
2. Create `branchUtils.js` with branch logic
3. Add `branch` property to existing nodes (mark current nodes for their branches)
4. Update `useGameState.js` to compute unlocked branches
5. Update `SkillTree.js` visibility logic
6. Create new tier gate nodes for each branch
7. Rebalance/reorganize existing nodes to fit new structure
8. Remove nodes that don't fit the new structure
9. Create missing nodes to meet the distribution target
10. Update LayoutEngine positioning for branch-based layout

### 8. Tier Gate Node Design

Each branch's tier gate node:
- Has `isTierGate: true`
- Is positioned as the "final" node of that branch's tier
- Has higher cost than regular nodes at that tier
- Requires multiple nodes from its branch as prerequisites
- Unlocks: next branch + next tier nodes for all previous branches

Example:
```javascript
power_gate_t1: {
    id: 'power_gate_t1',
    name: 'Power Matrix',
    icon: '🔓',
    tier: 1,
    branch: 'power',
    isTierGate: true,
    requires: ['energy_boost'], // requires the tier 1 power node
    cost: { energy: 50 },
    effects: { description: 'Unlocks Processing branch and Tier 2' }
}
```

### 9. Questions Resolved

- ✅ Parallel progression: Yes, once branches unlock they all progress together
- ✅ Keep `tier` for cost scaling, add `branch` for visibility
- ✅ Node count: increases per tier (1, 2, 3, 4, 5, 6)
- ✅ Cloud is 6th branch, Endgame is tier 7 with 1 node
