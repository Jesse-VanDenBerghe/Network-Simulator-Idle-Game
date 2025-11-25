# Network Simulator - Project Context

> Last updated: November 25, 2025

## Overview

**Network Simulator** is a web-based incremental/idle game built with Vue.js 3. The core concept is a giant skill tree that progressively unlocks itself, evolving from manual clicking to resource generation to full automation.

## Tech Stack

- **Framework**: Vue.js 3 (CDN, Options + Composition API)
- **Styling**: Vanilla CSS with CSS custom properties
- **State Management**: Vue reactive state (no Vuex/Pinia)
- **Build**: None required - runs directly in browser
- **Storage**: LocalStorage for save/load
- **Testing**: Vitest + @vue/test-utils + happy-dom (95 passing tests)

## Project Structure

```
Network Simulator/
├── index.html                 # Entry point, loads Vue CDN and all scripts
├── styles.css                 # Global styles, theming, component styles
├── game.js                    # LEGACY - original vanilla JS (can be deleted)
├── package.json               # NPM config with test scripts
├── vitest.config.js           # Vitest test configuration
├── .gitignore                 # Git exclusions (node_modules, coverage, etc.)
├── js/
│   ├── gameData.js            # Game constants, node definitions, helper functions
│   ├── LayoutEngine.js        # Dynamic radial layout algorithm for skill tree
│   ├── App.js                 # Root Vue component, game state, game loop
│   └── components/
│       ├── ResourceBar.js     # Single resource display (icon, amount, rate)
│       ├── ActionButton.js    # Manual action button (generate energy, process data)
│       ├── AutomationItem.js  # Automation status display
│       ├── Sidebar.js         # Left panel: actions, automations, stats
│       ├── SkillNode.js       # Individual skill tree node
│       ├── SkillTree.js       # Full skill tree with SVG connections
│       ├── InfoPanel.js       # Right panel: selected node details, unlock button
│       └── NotificationToast.js # Toast notification system
└── tests/
    ├── README.md              # Test documentation
    ├── setup.js               # Test environment setup
    ├── gameData.test.js       # Game data & utils tests (10 tests)
    ├── layoutEngine.test.js   # Layout algorithm tests (14 tests)
    ├── components.test.js     # Vue component tests (21 tests)
    ├── app.test.js            # Game logic tests (29 tests)
    └── integration.test.js    # Full progression tests (21 tests)
```

## Game Mechanics

### Resources

| Resource  | Icon | Acquisition | Unlock Condition |
|-----------|------|-------------|------------------|
| Energy    | ⚡   | Click / Passive | Always available |
| Data      | 📊   | Click (costs 5 energy) / Passive | Unlock `data_processing` node |
| Bandwidth | 📡   | Passive only | Unlock `bandwidth_unlock` node |

### Progression Phases

1. **Manual Phase** - Player clicks to generate energy
2. **Data Phase** - Unlock data processing, convert energy to data
3. **Automation Phase** - Unlock generators/miners for passive income
4. **Bandwidth Phase** - Third resource unlocks late-game content
5. **Optimization Phase** - Multipliers and efficiency upgrades

### Skill Tree Tiers

| Tier | Color   | Theme | Example Nodes |
|------|---------|-------|---------------|
| 0    | #00ffaa | Core  | Core System (starting node) |
| 1    | #00aaff | Basic | Energy Boost, Data Processing, Network Basics, Research Lab, Power Management |
| 2    | #aa00ff | Intermediate | Generator Mk1, Data Miner, Router, Firewall, Algorithms, Simulation |
| 3    | #ff00aa | Advanced | Generator Mk2, Overclocking, Bandwidth Unlock, Machine Learning, Encryption |
| 4    | #ffaa00 | Expert | Fusion Core, Quantum CPU, Neural Network, Zero Day, AI Core |
| 5    | #ff6600 | Master | Stellar Forge, Quantum Memory, Galactic Network, Superintelligence |
| 6    | #ff0066 | Transcendence | Universal Energy, Akashic Records, Hivemind, Omega Point |
| 7    | #ffffff | Godhood | Universe Simulation (final node) |

### Skill Tree Layout

The skill tree uses a **dynamic radial layout** powered by `LayoutEngine.js`:

- **Core node** positioned at center (1400, 1400)
- **Tier 1 nodes** spread evenly around the circle (360° / node count)
- **Higher tier nodes** inherit and average parent angles, spreading outward
- **Collision resolution** automatically pushes overlapping nodes apart

#### Layout Configuration (in `LayoutEngine.config`)

| Setting | Default | Description |
|---------|---------|-------------|
| `centerX` | 1400 | Center X coordinate |
| `centerY` | 1400 | Center Y coordinate |
| `tierSpacing` | 180 | Radial distance between tiers |
| `nodeSpacing` | 100 | Minimum distance between nodes |
| `nodeSize` | 80 | Node size for positioning calculations |

#### Node Visibility

Only **visible nodes** are rendered in the skill tree:
- **Unlocked nodes**: Already purchased
- **Available nodes**: Can be unlocked (all requirements met)
- **Locked nodes**: Hidden until available

Connections only display when **both** connected nodes are visible.

**Total Nodes**: 70 nodes across 8 tiers
**Canvas Size**: 3500x3000 pixels (scrollable)

### Node Effects System

Nodes can have the following effects (defined in `gameData.js`):

```javascript
effects: {
    energyPerClick: Number,      // Adds to energy per click
    dataPerClick: Number,        // Adds to data per click
    dataMultiplier: Number,      // Multiplies all data gains
    allRatesMultiplier: Number,  // Multiplies all passive rates
    automation: {                // Adds passive generation
        resource: 'energy'|'data'|'bandwidth',
        rate: Number             // Per second
    },
    unlockDataProcessing: Boolean,  // Enables data button
    unlockBandwidth: Boolean,       // Shows bandwidth resource
    instantUnlock: Boolean          // Zero Day special effect
}
```

## State Structure (in App.js)

```javascript
// Reactive state
resources: { energy, data, bandwidth }      // Current amounts
totalResources: { energy, data, bandwidth } // Lifetime totals (for stats)
automations: { energy, data, bandwidth }    // Base passive rates
unlockedNodes: Set<string>                  // Node IDs that are unlocked
selectedNodeId: string | null               // Currently selected node
notifications: Array<{id, message, type}>   // Active toast notifications

// Computed
computedValues: { energyPerClick, dataPerClick, dataMultiplier, allRatesMultiplier }
resourceRates: { energy, data, bandwidth }  // Effective rates (base × multipliers)
```

## Component Communication

```
App.js (root)
├── ResourceBar (props: icon, name, amount, rate, visible)
├── Sidebar
│   ├── ActionButton (props: icon, text, value, disabled, locked)
│   │   └── emits: click
│   └── AutomationItem (props: resource, rate)
│   └── emits: generate-energy, process-data
├── SkillTree
│   └── SkillNode (props: node, isUnlocked, isAvailable, isSelected)
│       └── emits: select
│   └── emits: select-node
├── InfoPanel (props: node, isUnlocked, isAvailable, canAfford, resources, unlockedNodes)
│   └── emits: unlock
└── NotificationToast (props: notifications)
```

## Save System

- **Auto-save**: Every 30 seconds
- **Storage key**: `networkSimulatorSave`
- **Offline progress**: Up to 24 hours of passive generation calculated on load

### Save Data Format

```javascript
{
    resources: { energy, data, bandwidth },
    totalResources: { energy, data, bandwidth },
    automations: { energy, data, bandwidth },
    unlockedNodes: string[],  // Array for JSON serialization
    lastUpdate: timestamp
}
```

## CSS Theming

Color variables defined in `:root`:

```css
--bg-dark: #0a0a1a;
--bg-medium: #12122a;
--bg-light: #1a1a3a;
--accent-primary: #00ffaa;    /* Green - primary actions, energy */
--accent-secondary: #00aaff;  /* Blue - secondary, data */
--accent-tertiary: #ff00aa;   /* Pink - warnings, expensive */
--text-primary: #ffffff;
--text-secondary: #aaaacc;
--text-muted: #666688;
```

## Future Expansion Ideas

### Near-term
- [x] ~~More nodes in existing tiers~~ (Expanded from 19 to 70 nodes)
- [ ] Prestige/reset system with permanent bonuses
- [ ] Achievements
- [ ] Sound effects

### Medium-term
- [ ] Multiple skill tree branches/pages
- [ ] Node upgrade levels (not just unlock)
- [ ] Research queue system
- [ ] Import/export save codes

### Long-term
- [ ] Backend for cloud saves
- [ ] Multiplayer/leaderboards
- [ ] Modding support
- [ ] Mobile responsive redesign

## Development Notes

### Adding a New Node

1. Add node definition to `GameData.nodes` in `gameData.js`:
```javascript
new_node: {
    id: 'new_node',
    name: 'Display Name',
    icon: '🆕',
    tier: 2,
    x: 500, y: 300,  // Position on skill tree
    description: 'What it does',
    requires: ['parent_node_id'],
    cost: { energy: 100, data: 50 },
    effects: {
        automation: { resource: 'energy', rate: 2 },
        description: '+2 Energy/second'
    }
}
```

2. If adding new effect types, handle them in `App.js`:
   - Add to `computedValues` computed property
   - Handle in `applyNodeEffects()` method

### Adding a New Resource

1. Add to `GameData.resources` in `gameData.js`
2. Add to all state objects in `App.js`: `resources`, `totalResources`, `automations`
3. Add computed rate in `resourceRates`
4. Add `ResourceBar` component in template
5. Create unlock condition (similar to `bandwidthUnlocked`)

### Running the Game

Simply open `index.html` in a browser. No build step required.

For development with live reload, use any static server:
```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

### Running Tests

```bash
# Install dependencies (first time only)
npm install

# Run all tests
npm test

# Watch mode (re-run on changes)
npm run test:watch

# Coverage report
npm run test:coverage

# UI mode
npm run test:ui
```

**Test Coverage**: 95 passing tests across 5 test suites covering game data, layout, components, app logic, and full progression flows. See `tests/README.md` for details.

## Known Issues / Technical Debt

1. `game.js` is legacy code and can be deleted
2. No input validation on save data load (could crash on corrupted save)
3. ~~Skill tree positions are hardcoded - could use automatic layout algorithm~~ (Now uses dynamic LayoutEngine)
4. No accessibility features (keyboard navigation, screen reader support)
5. No mobile touch support for skill tree panning/zooming
6. **Tests use mock implementations** - not testing actual source files. Refactor to ES modules for real source coverage.

## Changelog

### November 25, 2025
- **Dynamic layout engine**: Added `LayoutEngine.js` for automatic radial node positioning
  - Tier 1 nodes spread evenly around the circle
  - Higher tiers inherit parent angles with collision resolution
- **Node visibility**: Only unlocked and available nodes are shown (locked nodes hidden)
- **Connection filtering**: Connections only display when both nodes are visible
- **Major skill tree expansion**: Added 51 new nodes (19 → 70 total)
- **New tiers**: Added Tier 5 (Master), Tier 6 (Transcendence), Tier 7 (Godhood)
- **New branches**: Added Research branch (top) and Optimization branch (top-left)
- **Canvas expansion**: Increased skill tree canvas from 2000x1500 to 3500x3000 pixels
- **Test suite**: Added comprehensive test coverage with 95 passing tests
  - Vitest + @vue/test-utils + happy-dom
  - 5 test files: gameData, layoutEngine, components, app, integration
  - Tests validate logic patterns but use mocks (not real source imports)
