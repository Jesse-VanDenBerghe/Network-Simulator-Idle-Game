# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

```bash
# Run the game (no build required)
python -m http.server 8000  # or: npx serve .

# Tests
npm test                    # Run all tests once
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report
npm run test:ui             # Vitest UI

# Run a single test file
npx vitest run tests/app.test.js

# Run tests matching a pattern
npx vitest run -t "energy"
```

## Architecture

Vue.js 3 incremental game loaded via CDN (no build step). Entry point is `index.html`.

### Core Files

- `js/App.js` - Root Vue component: game state, game loop (10 ticks/sec), save/load system
- `js/gameData.js` - All 70 skill tree nodes, resources, helper functions (`formatNumber`, `canAfford`)
- `js/LayoutEngine.js` - Radial layout algorithm for auto-positioning nodes by tier

### State Model (App.js)

```javascript
resources: { energy, data, bandwidth }       // Current amounts
automations: { energy, data, bandwidth }     // Base passive rates/sec
unlockedNodes: Set<string>                   // Purchased node IDs
computedValues: { energyPerClick, dataPerClick, dataMultiplier, allRatesMultiplier }
```

### Node Effect Types (gameData.js)

Nodes can grant: `energyPerClick`, `dataPerClick`, `dataMultiplier`, `allRatesMultiplier`, `automation: { resource, rate }`, `unlockDataProcessing`, `unlockBandwidth`.

### Component Hierarchy

```
App.js
├── ResourceBar (display resource amounts/rates)
├── Sidebar
│   ├── ActionButton (click actions)
│   └── AutomationItem (passive generation display)
├── SkillTree → SkillNode (radial skill tree)
├── InfoPanel (selected node details, unlock button)
└── NotificationToast
```

### Layout Engine

Nodes auto-position radially based on tier. Configuration in `LayoutEngine.config`: `centerX/Y: 1400`, `tierSpacing: 180`, `nodeSpacing: 100`. Collision detection pushes overlapping nodes apart.

## Key Patterns

- **Node visibility**: Only unlocked + available nodes render; locked nodes are hidden
- **Connections**: Only drawn when both connected nodes are visible
- **Save system**: LocalStorage key `networkSimulatorSave`, auto-saves every 30s, offline progress up to 24h
- **Tests use mocks**: Test files recreate game logic patterns rather than importing actual source (source uses global `window` objects)

## Adding Content

### New Node
Add to `GameData.nodes` in `gameData.js`:
```javascript
new_node: {
    id: 'new_node', name: 'Name', icon: '🆕', tier: 2,
    description: 'What it does',
    requires: ['parent_node_id'],
    cost: { energy: 100, data: 50 },
    effects: { automation: { resource: 'energy', rate: 2 } }
}
```
Handle new effect types in `App.js` → `computedValues` and `applyNodeEffects()`.

### New Resource
1. Add to `GameData.resources` in `gameData.js`
2. Add to `resources`, `totalResources`, `automations` state in `App.js`
3. Add computed rate in `resourceRates`
4. Add `ResourceBar` in template with unlock condition

## Known Issues

- `game.js` is legacy (can be deleted)
- No save data validation on load
- No keyboard/accessibility support
- No mobile touch support for skill tree
