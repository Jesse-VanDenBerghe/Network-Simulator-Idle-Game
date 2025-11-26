# Network Simulator - Copilot Instructions

## The Story
You inherit an old shed from your grandfather. Inside, you discover a hand crank that hums when turned. This sparks a journey from manual power generation to building a vast computational network. The game tells this story through node unlocks—each revealing more of what grandpa left behind.

## Project Overview
An incremental idle game built with Vue 3 (CDN, no build step). No bundler—scripts load directly in `index.html`. Players crank for energy, unlock skill tree nodes, and discover new branches (energy → computer → future expansions).

## Architecture

### Composables (`js/composables/`)
Vue 3 composables communicate via **event bus**, not direct imports:
- `useGameState` - Resources, unlocked nodes, automations
- `useNodeManagement` - Node unlocking, affordability, effects
- `useGameLoop` - 100ms ticks, notifications, passive generation
- `useSaveLoad` - LocalStorage persistence, offline progress
- `useEventBus` - Pub/sub for decoupled communication

When adding interactions between composables, emit/subscribe to events rather than importing one into another.

### Node System (`js/data/nodes/`)
Nodes are the progression mechanic. Each unlock reveals story and gameplay:
```javascript
{
    id: 'node_id',           // snake_case identifier
    name: 'Display Name',
    icon: '🔧',              // Emoji
    tier: 2,                 // 0-8, affects cost scaling
    branch: 'energy',        // Grouping: energy, computer
    requires: ['parent_id'], // Prerequisites (string or {id, level})
    cost: { energy: 100 },   // Scaled by tier multipliers
    effects: {
        automation: { resource: 'energy', rate: 0.5 },
        energyPerClick: 1,
        narrate: { text: '...', duration: 8000 },
        unlockBranch: 'computer',
        unlockFeature: 'dataProcessing'
    }
}
```

### Narration Guidelines
Narration drives the story. When adding nodes with `narrate` effects:
- Write in second person, present tense ("You discover...", "The room illuminates...")
- Keep it atmospheric—describe what the player sees/hears/feels
- Use narration for discoveries and milestones, not routine upgrades
- Multi-level nodes can have narration at key levels (1, 5, max)
- See `docs/narration.md` for the full narrative design

### Branch Progression
Players start with energy (hand crank → hamster wheel → generators). Unlocking `attic` reveals grandpa's old computer, opening the computer branch. Future branches extend this pattern.

### Components (`js/components/`)
Plain Vue 3 components as global scripts (not SFCs):
```javascript
const ComponentName = {
    name: 'ComponentName',
    props: { ... },
    emits: ['eventName'],
    template: `<div>...</div>`
};
```

### Layout Engine (`js/LayoutEngine.js`)
Auto-positions nodes radially by tier. Three classes: `TreeBuilder` (dependency graph), `PositionCalculator` (radial layout), `CollisionResolver` (overlap prevention).

## Key Patterns

### Cost Scaling
Use `GameData.getScaledNodeCost(node, options)` for proper tier/ascension scaling—never raw `node.cost`.

### Adding New Nodes
1. Add to `js/data/nodes/{branch}Branch.js`
2. Export from `js/data/nodes/index.js`
3. Set `requires` to connect to tree
4. Positions auto-calculate

### State Persistence
When adding state: add to composable, include in `toSaveState()`, handle in `loadFromState()` with backward-compatible defaults.

## Commands
```bash
npm test              # Run vitest
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
./build-itch.sh       # Package zip for itch.io (manual upload)
```

## File Organization
```
js/
├── App.js              # Main app, wires composables
├── gameData.js         # Re-exports (backward compat)
├── LayoutEngine.js     # Skill tree positioning (global script)
├── composables/        # ES modules
├── components/         # Global scripts
├── data/               # Nodes, constants, resources
└── utils/              # Pure functions
```

**Module types:** Composables and `js/data/` are ES modules. Components and LayoutEngine are global scripts loaded via `<script>` tags.
