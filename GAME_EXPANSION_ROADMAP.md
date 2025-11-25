# Network Simulator: Game Expansion Roadmap

Transform the 10-minute game into weeks of engaging gameplay through systematic expansion across 8 phases.

---

## Current State → Target State

| Metric | Current | Target |
|--------|---------|--------|
| Nodes | 70 | 1,000 |
| Tiers | 8 (0-7) | 11 (0-10) |
| Single run time | ~10 min | 2-3 weeks |
| Total content | Hours | Months |
| Replayability | None | Infinite (prestige) |

---

## Phase Overview

| Phase | Focus | Deliverable | Est. Effort |
|-------|-------|-------------|-------------|
| 1 | Cost Rebalancing | Longer single runs | 1 day |
| 2 | Number Formatting | Support for large numbers | 0.5 day |
| 3 | Core Prestige | Basic ascension loop | 2 days |
| 4 | Prestige Upgrades | Permanent bonuses | 2 days |
| 5 | Node Upgrades | Level system (1-10) | 2 days |
| 6 | Content Expansion I | 70 → 200 nodes | 3 days |
| 7 | Research System | Time gates for high tiers | 2 days |
| 8 | Mass Expansion | 200 → 1000 nodes | 5 days |

**Total estimated effort: ~18 days**

---

# Phase 1: Cost Rebalancing

**Goal:** Extend single run from 10 min to 30-45 min through exponential cost scaling and tier gates.

## 1.1 Exponential Cost Multipliers

```javascript
// Add to gameData.js
const TIER_COST_MULTIPLIERS = {
    0: 1,      // Core
    1: 1,      // 10-25 energy
    2: 10,     // 100-300 energy  
    3: 50,     // 500-2,000 energy
    4: 500,    // 5K-20K energy
    5: 5000,   // 50K-200K energy
    6: 50000,  // 500K-2M energy
    7: 500000  // 10M-50M energy
};

function getScaledNodeCost(node) {
    const multiplier = TIER_COST_MULTIPLIERS[node.tier] || 1;
    const scaled = {};
    for (const [resource, amount] of Object.entries(node.cost)) {
        scaled[resource] = Math.floor(amount * multiplier);
    }
    return scaled;
}
```

## 1.2 Tier Gates

```javascript
// Add to gameData.js
const TIER_GATES = {
    3: { requiredTier: 2, requiredCount: 3 },
    4: { requiredTier: 3, requiredCount: 6 },
    5: { requiredTier: 4, requiredCount: 10 },
    6: { requiredTier: 5, requiredCount: 15 },
    7: { requiredTier: 6, requiredCount: 20 }
};

function isTierUnlocked(tier, unlockedNodes) {
    const gate = TIER_GATES[tier];
    if (!gate) return true;
    const count = countUnlockedInTier(gate.requiredTier, unlockedNodes);
    return count >= gate.requiredCount;
}
```

## 1.3 Files to Modify

| File | Changes |
|------|---------|
| `js/gameData.js` | Add TIER_COST_MULTIPLIERS, TIER_GATES, helper functions |
| `js/App.js` | Use getScaledNodeCost() in cost checks, filter nodes by tier gates |
| `js/components/SkillNode.js` | Show tier-locked state |

## 1.4 Deliverable Checklist
- [x] Costs scale exponentially by tier
- [x] Tier 3+ nodes hidden until gate requirements met
- [x] UI shows "Unlock X more Tier N nodes" for locked tiers
- [x] Single run takes 30-45 minutes

---

# Phase 2: Number Formatting

**Goal:** Display large numbers cleanly (K, M, B, T, Qa, etc.)

## 2.1 Extended Format Function

```javascript
// Replace formatNumber in gameData.js
formatNumber(num) {
    if (num < 1000) return Math.floor(num).toString();
    
    const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
    const tier = Math.floor(Math.log10(Math.abs(num)) / 3);
    
    if (tier >= suffixes.length) {
        return num.toExponential(2);
    }
    
    const scaled = num / Math.pow(1000, tier);
    const decimals = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2;
    return scaled.toFixed(decimals) + suffixes[tier];
}
```

## 2.2 Deliverable Checklist
- [x] Numbers display with appropriate suffixes
- [x] Scientific notation fallback for extreme values
- [x] All resource displays use formatNumber()

---

# Phase 3: Core Prestige System

**Goal:** Implement basic ascension loop - reset for Quantum Cores.

## 3.1 Prestige State

```javascript
// Add to App.js
const prestigeState = reactive({
    ascensionCount: 0,
    quantumCores: 0,
    totalCoresEarned: 0,
    upgrades: new Set(),
    statistics: {
        fastestClear: null,
        totalNodesEverUnlocked: 0,
        totalEnergyEverEarned: 0
    }
});
```

## 3.2 Quantum Core Calculation

```javascript
function calculateQuantumCores() {
    const energyLog = Math.max(0, Math.log10(totalResources.energy + 1));
    const nodeBonus = unlockedNodes.value.size / 10;
    
    // Tier bonuses
    let tierBonus = 0;
    for (const nodeId of unlockedNodes.value) {
        const node = GameData.nodes[nodeId];
        if (node.tier >= 6) tierBonus += (node.tier - 5) * 5;
    }
    
    // Core multiplier from upgrades
    const multiplier = getCoreMultiplier();
    
    return Math.floor((energyLog + nodeBonus + tierBonus) * multiplier);
}
```

## 3.3 Ascend Function

```javascript
function ascend() {
    const cores = calculateQuantumCores();
    if (cores < 1) return;
    
    // Award cores
    prestigeState.quantumCores += cores;
    prestigeState.totalCoresEarned += cores;
    prestigeState.ascensionCount++;
    
    // Update statistics
    prestigeState.statistics.totalNodesEverUnlocked += unlockedNodes.value.size;
    prestigeState.statistics.totalEnergyEverEarned += totalResources.energy;
    
    // Reset game state
    resetGameState();
    
    // Save prestige (separate from game save)
    savePrestige();
    
    showNotification(`Ascended! +${cores} Quantum Cores`, 'prestige');
}

function resetGameState() {
    // Reset resources
    Object.keys(resources).forEach(k => resources[k] = 0);
    Object.keys(totalResources).forEach(k => totalResources[k] = 0);
    Object.keys(automations).forEach(k => automations[k] = 0);
    
    // Reset nodes (keep core)
    unlockedNodes.value = new Set(['core']);
    
    // Apply starting bonuses from upgrades
    applyStartingBonuses();
}
```

## 3.4 Separate Save Systems

```javascript
// Game state save (resets on ascend)
function saveGame() {
    const saveData = {
        resources, totalResources, automations,
        unlockedNodes: [...unlockedNodes.value],
        lastUpdate: Date.now()
    };
    localStorage.setItem('networkSimulatorSave', JSON.stringify(saveData));
}

// Prestige save (persists forever)
function savePrestige() {
    const prestigeData = {
        ...prestigeState,
        upgrades: [...prestigeState.upgrades]
    };
    localStorage.setItem('networkSimulatorPrestige', JSON.stringify(prestigeData));
}
```

## 3.5 Files to Create/Modify

| File | Changes |
|------|---------|
| `js/App.js` | Add prestigeState, calculateQuantumCores(), ascend(), separate saves |
| `js/components/AscensionButton.js` | NEW: Shows cores to earn, triggers ascend |
| `js/components/Sidebar.js` | Include AscensionButton |
| `styles.css` | Ascension button styling |
| `index.html` | Include new component |

## 3.6 Deliverable Checklist
- [X] Prestige state persists across game resets
- [X] Quantum Cores calculated based on progress
- [X] Ascend button appears after reaching Tier 3
- [X] Game resets but cores are retained
- [X] Ascension count displayed in UI

---

# Phase 4: Prestige Upgrades

**Goal:** Spend Quantum Cores on permanent bonuses.

## 4.1 Upgrade Definitions

```javascript
// js/prestigeData.js
const PrestigeData = {
    upgrades: {
        // Tier 1 (1-5 cores)
        quick_start: {
            id: 'quick_start', name: 'Quick Start', tier: 1,
            cost: 2, description: 'Start with +5 Energy',
            effect: { startingEnergy: 5 }
        },
        click_power_1: {
            id: 'click_power_1', name: 'Click Power I', tier: 1,
            cost: 3, description: '+1 base Energy per click',
            effect: { bonusEnergyPerClick: 1 }
        },
        headstart_1: {
            id: 'headstart_1', name: 'Headstart I', tier: 1,
            cost: 5, description: 'Start with Energy Boost unlocked',
            effect: { startingNodes: ['energy_boost'] }
        },
        efficient_learning: {
            id: 'efficient_learning', name: 'Efficient Learning', tier: 1,
            cost: 4, description: '-10% all node costs',
            effect: { costMultiplier: 0.9 }
        },
        
        // Tier 2 (10-25 cores)
        auto_clicker_1: {
            id: 'auto_clicker_1', name: 'Auto-Clicker I', tier: 2,
            cost: 15, description: '+0.5 Energy/s from start',
            requires: ['click_power_1'],
            effect: { startingAutomation: { energy: 0.5 } }
        },
        data_affinity: {
            id: 'data_affinity', name: 'Data Affinity', tier: 2,
            cost: 10, description: 'Start with Data Processing unlocked',
            requires: ['headstart_1'],
            effect: { startingNodes: ['data_processing'] }
        },
        cost_reduction_1: {
            id: 'cost_reduction_1', name: 'Cost Reduction I', tier: 2,
            cost: 20, description: '-25% all node costs',
            requires: ['efficient_learning'],
            effect: { costMultiplier: 0.75 }
        },
        
        // Tier 3 (50-100 cores)
        genesis_protocol: {
            id: 'genesis_protocol', name: 'Genesis Protocol', tier: 3,
            cost: 50, description: 'Start with 3 random Tier 1 nodes',
            requires: ['data_affinity'],
            effect: { randomStartingNodes: { tier: 1, count: 3 } }
        },
        quantum_efficiency: {
            id: 'quantum_efficiency', name: 'Quantum Efficiency', tier: 3,
            cost: 75, description: '+50% all automation rates',
            requires: ['auto_clicker_1'],
            effect: { automationMultiplier: 1.5 }
        },
        cost_reduction_2: {
            id: 'cost_reduction_2', name: 'Cost Reduction II', tier: 3,
            cost: 100, description: '-50% all node costs',
            requires: ['cost_reduction_1'],
            effect: { costMultiplier: 0.5 }
        },
        core_multiplier: {
            id: 'core_multiplier', name: 'Core Multiplier', tier: 3,
            cost: 80, description: '+25% Quantum Cores earned',
            effect: { coreMultiplier: 1.25 }
        },
        
        // Tier 4 (200-500 cores)
        instant_tier_1: {
            id: 'instant_tier_1', name: 'Instant Tier 1', tier: 4,
            cost: 200, description: 'Start with ALL Tier 1 nodes',
            requires: ['genesis_protocol'],
            effect: { startAllTier: 1 }
        },
        eternal_generator: {
            id: 'eternal_generator', name: 'Eternal Generator', tier: 4,
            cost: 300, description: '+5 Energy/s permanent',
            requires: ['quantum_efficiency'],
            effect: { startingAutomation: { energy: 5 } }
        },
        prestige_mastery: {
            id: 'prestige_mastery', name: 'Prestige Mastery', tier: 4,
            cost: 500, description: '2x Quantum Cores earned',
            requires: ['core_multiplier'],
            effect: { coreMultiplier: 2 }
        }
    }
};
```

## 4.2 Apply Bonuses on Reset

```javascript
function applyStartingBonuses() {
    const bonuses = getAccumulatedBonuses();
    
    // Starting resources
    resources.energy = bonuses.startingEnergy || 0;
    
    // Starting automation
    if (bonuses.startingAutomation) {
        Object.assign(automations, bonuses.startingAutomation);
    }
    
    // Starting nodes
    if (bonuses.startingNodes) {
        bonuses.startingNodes.forEach(nodeId => {
            unlockedNodes.value.add(nodeId);
            applyNodeEffects(GameData.nodes[nodeId]);
        });
    }
}

function getAccumulatedBonuses() {
    const bonuses = {
        startingEnergy: 0,
        startingAutomation: { energy: 0, data: 0, bandwidth: 0 },
        startingNodes: new Set(['core']),
        costMultiplier: 1,
        automationMultiplier: 1,
        bonusEnergyPerClick: 0,
        coreMultiplier: 1
    };
    
    for (const upgradeId of prestigeState.upgrades) {
        const upgrade = PrestigeData.upgrades[upgradeId];
        if (!upgrade) continue;
        
        const e = upgrade.effect;
        if (e.startingEnergy) bonuses.startingEnergy += e.startingEnergy;
        if (e.costMultiplier) bonuses.costMultiplier *= e.costMultiplier;
        if (e.automationMultiplier) bonuses.automationMultiplier *= e.automationMultiplier;
        if (e.bonusEnergyPerClick) bonuses.bonusEnergyPerClick += e.bonusEnergyPerClick;
        if (e.coreMultiplier) bonuses.coreMultiplier *= e.coreMultiplier;
        if (e.startingNodes) e.startingNodes.forEach(n => bonuses.startingNodes.add(n));
        if (e.startingAutomation) {
            Object.entries(e.startingAutomation).forEach(([r, v]) => {
                bonuses.startingAutomation[r] += v;
            });
        }
    }
    
    return bonuses;
}
```

## 4.3 Files to Create/Modify

| File | Changes |
|------|---------|
| `js/prestigeData.js` | NEW: All upgrade definitions |
| `js/App.js` | getAccumulatedBonuses(), applyStartingBonuses(), apply to computedValues |
| `js/components/AscensionPanel.js` | NEW: Upgrade tree UI |
| `styles.css` | Upgrade panel styling |
| `index.html` | Include new scripts |

## 4.4 Deliverable Checklist
- [X] 16 prestige upgrades across 4 tiers
- [X] Upgrades purchasable with Quantum Cores
- [X] Bonuses apply on game start/ascend
- [X] Upgrade tree UI shows requirements and costs
- [X] Visual indication of purchased upgrades

---

# Phase 5: Node Upgrade Levels

**Goal:** Each node can be upgraded 1-10 times for increased effects.

## 5.1 Node Level State

```javascript
// Add to App.js state
const nodeLevels = reactive({});  // { nodeId: level }

// Get node level (1 = unlocked, 0 = not unlocked)
function getNodeLevel(nodeId) {
    return nodeLevels[nodeId] || 0;
}
```

## 5.2 Upgrade Cost Calculation

```javascript
// Cost for level N = baseCost * (2.5 ^ (N-1))
function getUpgradeCost(node, currentLevel) {
    const baseCost = getScaledNodeCost(node);
    const multiplier = Math.pow(2.5, currentLevel);
    
    const cost = {};
    for (const [resource, amount] of Object.entries(baseCost)) {
        cost[resource] = Math.floor(amount * multiplier);
    }
    return cost;
}
```

## 5.3 Scaled Effects

```javascript
// Effects scale linearly with level
function getNodeEffects(node, level) {
    const effects = { ...node.effects };
    
    if (effects.energyPerClick) {
        effects.energyPerClick *= level;
    }
    if (effects.dataPerClick) {
        effects.dataPerClick *= level;
    }
    if (effects.automation) {
        effects.automation = {
            ...effects.automation,
            rate: effects.automation.rate * level
        };
    }
    // Multipliers don't scale linearly (would be too powerful)
    // They get a smaller bonus per level
    if (effects.dataMultiplier) {
        effects.dataMultiplier = 1 + (effects.dataMultiplier - 1) * (1 + (level - 1) * 0.2);
    }
    
    return effects;
}
```

## 5.4 Files to Modify

| File | Changes |
|------|---------|
| `js/App.js` | nodeLevels state, upgradeNode(), recalculate effects on upgrade |
| `js/gameData.js` | getUpgradeCost(), getNodeEffects() |
| `js/components/SkillNode.js` | Show level badge |
| `js/components/InfoPanel.js` | Show upgrade button and cost |
| `styles.css` | Level badge styling |

## 5.5 Deliverable Checklist
- [ ] Unlocked nodes show level (1-10)
- [ ] InfoPanel shows "Upgrade" button with cost
- [ ] Effects scale with level
- [ ] Upgrade costs increase exponentially
- [ ] Node levels persist in save

---

# Phase 6: Content Expansion I (70 → 200 nodes)

**Goal:** Add Tier 8 and expand existing tiers.

## 6.1 New Tier Distribution

| Tier | Current | Target | New Nodes |
|------|---------|--------|-----------|
| 0-2 | 21 | 25 | +4 |
| 3 | 12 | 25 | +13 |
| 4 | 16 | 35 | +19 |
| 5 | 12 | 35 | +23 |
| 6 | 4 | 30 | +26 |
| 7 | 1 | 20 | +19 |
| 8 | 0 | 30 | +30 |

## 6.2 New Tier 8 Theme: "Cosmic"

```javascript
// Example Tier 8 nodes
cosmic_forge: {
    id: 'cosmic_forge', name: 'Cosmic Forge', icon: '🌟', tier: 8,
    requires: ['stellar_forge', 'universal_energy'],
    cost: { energy: 100000000, data: 25000000, bandwidth: 5000000 },
    effects: { automation: { resource: 'energy', rate: 1000 } }
},
void_processor: {
    id: 'void_processor', name: 'Void Processor', icon: '🕳️', tier: 8,
    requires: ['akashic_records'],
    cost: { energy: 80000000, data: 50000000, bandwidth: 4000000 },
    effects: { automation: { resource: 'data', rate: 500 }, dataMultiplier: 20 }
}
```

## 6.3 Branch Categories for Organization

| Branch | Icon | Focus |
|--------|------|-------|
| Power | ⚡ | Energy generation |
| Processing | 📊 | Data production |
| Network | 📡 | Bandwidth, connectivity |
| Research | 🔬 | Cost reduction, multipliers |
| Security | 🛡️ | Efficiency |
| Automation | 🤖 | Rate multipliers |
| Cosmic | 🌌 | Late-game mega bonuses |

## 6.4 Files to Create/Modify

| File | Changes |
|------|---------|
| `js/gameData.js` | Add ~130 new node definitions |
| `js/LayoutEngine.js` | Handle larger node counts |
| `styles.css` | Tier 8 color: #00ffff (cyan) |

## 6.5 Deliverable Checklist
- [ ] 200 total nodes
- [ ] Tier 8 with 30 nodes
- [ ] Existing tiers expanded
- [ ] All new nodes balanced and playtested
- [ ] Layout engine handles larger tree

---

# Phase 7: Research System

**Goal:** High-tier nodes require research time after paying cost.

## 7.1 Research Times

| Tier | Research Time |
|------|---------------|
| 1-4 | Instant |
| 5 | 30 seconds |
| 6 | 2 minutes |
| 7 | 5 minutes |
| 8 | 15 minutes |
| 9 | 30 minutes |
| 10 | 1 hour |

## 7.2 Research State

```javascript
// Add to App.js
const researchState = reactive({
    currentResearch: null,  // { nodeId, startTime, duration }
    queue: [],              // future: multiple research slots
    completedResearch: new Set()
});

function startResearch(nodeId) {
    const node = GameData.nodes[nodeId];
    const duration = getResearchTime(node.tier);
    
    if (duration === 0) {
        // Instant unlock
        completeResearch(nodeId);
        return;
    }
    
    researchState.currentResearch = {
        nodeId,
        startTime: Date.now(),
        duration: duration * 1000
    };
}

function checkResearchComplete() {
    if (!researchState.currentResearch) return;
    
    const { nodeId, startTime, duration } = researchState.currentResearch;
    if (Date.now() >= startTime + duration) {
        completeResearch(nodeId);
        researchState.currentResearch = null;
    }
}
```

## 7.3 Files to Create/Modify

| File | Changes |
|------|---------|
| `js/App.js` | researchState, startResearch(), checkResearchComplete() |
| `js/components/ResearchPanel.js` | NEW: Shows current research, progress bar |
| `js/components/InfoPanel.js` | "Research" button instead of "Unlock" for high tiers |
| `styles.css` | Research progress bar styling |

## 7.4 Deliverable Checklist
- [ ] Tier 5+ nodes require research time
- [ ] Progress bar shows time remaining
- [ ] Research continues while offline
- [ ] Only one research at a time (upgradeable later)
- [ ] Research state persists in save

---

# Phase 8: Mass Expansion (200 → 1000 nodes)

**Goal:** Procedurally generate nodes for Tiers 9-10, scale UI for 1000 nodes.

## 8.1 Final Node Distribution

| Tier | Nodes | Cumulative |
|------|-------|------------|
| 0-4 | 101 | 101 |
| 5 | 80 | 181 |
| 6 | 120 | 301 |
| 7 | 150 | 451 |
| 8 | 200 | 651 |
| 9 | 200 | 851 |
| 10 | 149 | 1000 |

## 8.2 Node Template System

```javascript
// js/nodeTemplates.js
const NODE_TEMPLATES = {
    power: {
        prefixes: ['Quantum', 'Stellar', 'Cosmic', 'Void', 'Dimensional'],
        suffixes: ['Generator', 'Reactor', 'Core', 'Matrix', 'Engine'],
        icons: ['⚡', '🔋', '☀️', '⭐', '💫'],
        effectType: 'energy'
    },
    processing: {
        prefixes: ['Neural', 'Quantum', 'Parallel', 'Distributed', 'Infinite'],
        suffixes: ['Processor', 'Computer', 'Matrix', 'Network', 'Core'],
        icons: ['📊', '💠', '🧮', '💻', '🔢'],
        effectType: 'data'
    },
    // ... more templates
};

function generateTierNodes(tier, count, startIndex) {
    const nodes = {};
    const branches = Object.keys(NODE_TEMPLATES);
    
    for (let i = 0; i < count; i++) {
        const branch = branches[i % branches.length];
        const template = NODE_TEMPLATES[branch];
        const variant = Math.floor(i / branches.length);
        
        const id = `${branch}${tier}_${String(i + 1).padStart(3, '0')}`;
        const prefix = template.prefixes[variant % template.prefixes.length];
        const suffix = template.suffixes[Math.floor(variant / template.prefixes.length) % template.suffixes.length];
        
        nodes[id] = {
            id,
            name: `${prefix} ${suffix}`,
            icon: template.icons[i % template.icons.length],
            tier,
            description: `Tier ${tier} ${branch} upgrade`,
            requires: calculateRequirements(tier, i, startIndex),
            cost: calculateTierCost(tier, i),
            effects: calculateEffects(template.effectType, tier, variant)
        };
    }
    
    return nodes;
}
```

## 8.3 Galaxy Map View

```javascript
// js/components/GalaxyView.js
// Replace radial layout with zoomable galaxy map for 1000 nodes

const GalaxyView = {
    setup() {
        const viewport = reactive({ x: 0, y: 0, zoom: 1 });
        const visibleNodes = computed(() => {
            return filterVisibleNodes(allNodes, viewport);
        });
        
        // Use canvas for connections (performance)
        // SVG for nodes (interactivity)
    }
};
```

## 8.4 Performance Optimizations

```javascript
// Only render nodes in viewport
function filterVisibleNodes(nodes, viewport) {
    const buffer = 200;
    const viewBounds = getViewBounds(viewport, buffer);
    
    return Object.values(nodes).filter(node => 
        isInBounds(node.x, node.y, viewBounds)
    );
}

// Virtualized node list for sidebar
// Lazy-load tier data files
```

## 8.5 Split Data Files

```
js/nodes/
├── index.js          # Combines all tiers
├── tier0-4.js        # Hand-crafted (101 nodes)
├── tier5.js          # Hand-crafted (80 nodes)
├── tier6.js          # Hand-crafted (120 nodes)
├── tier7.js          # Semi-generated (150 nodes)
├── tier8.js          # Generated (200 nodes)
├── tier9.js          # Generated (200 nodes)
└── tier10.js         # Generated (149 nodes)
```

## 8.6 Deliverable Checklist
- [ ] 1000 total nodes
- [ ] Template-based generation for Tiers 8-10
- [ ] Galaxy map view with zoom/pan
- [ ] Viewport culling for performance
- [ ] Split data files for maintainability
- [ ] Final balance pass

---

# Timeline Summary

| Week | Phases | Milestone |
|------|--------|-----------|
| 1 | 1, 2, 3 | Playable prestige loop |
| 2 | 4, 5 | Full upgrade system |
| 3 | 6 | 200 nodes |
| 4 | 7, 8 | 1000 nodes, research system |

---

# Success Metrics

| Metric | Target |
|--------|--------|
| First ascension | 30-45 minutes |
| Tier 7 completion | 3-5 hours |
| All prestige upgrades | 20+ hours |
| Full completion (1000 nodes) | 2-3 weeks |
| Player retention | Return daily for 1+ week |
