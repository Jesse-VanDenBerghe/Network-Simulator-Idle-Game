# Network Simulator - Copilot Instructions

## The Story
You inherit an old shed from your grandfather. Inside, you discover a hand crank that hums when turned. This sparks a journey from manual power generation to building a vast computational network. The game tells this story through node unlocks—each revealing more of what grandpa left behind.

## Project Overview
An incremental idle game built with Vue 3 + TypeScript + Vite + pnpm workspace monorepo. Players crank for energy, unlock skill tree nodes, and discover new branches (energy → computer → future expansions).

## Tech Stack
- **Vue 3** - Composition API with Single File Components (SFCs)
- **TypeScript** - Strict mode, no `any` allowed
- **Vite** - Dev server with HMR, production bundler
- **pnpm** - Workspace monorepo with three packages
- **Event Bus** - Decoupled composable communication pattern

## Monorepo Architecture

This project uses **pnpm workspaces** with three packages:

### `packages/shared/`
Shared TypeScript code used by both game and editor:
- `types/` - Node, GameState, Notification interfaces
- `data/` - Node definitions, notification configs, constants
- `utils/` - Pure functions (formatting, calculations)

Imported as `@network-sim/shared` by both apps with full type safety. No runtime build—source compiled directly by consuming apps.

### `packages/game/`
Main game Vue app:
- `composables/` - useGameState, useNodeManagement, useGameLoop, etc.
- `components/` - Vue SFCs (SkillTree, ResourceBar, NotificationToast, etc.)
- `layout/` - LayoutEngine for radial skill tree positioning
- `core/` - GameData singleton for cost scaling and validation

Builds to `dist-game/`, runs on port 3000.

### `packages/editor/`
Story editor Vue app (minimal scaffold):
- Future: Node editor, narration authoring, skill tree visualizer

Builds to `dist-editor/`, runs on port 3001.

## Architecture

### Composables (`packages/game/src/composables/`)
TypeScript composables communicate via **event bus**, not direct imports:
- `useGameState` - Resources, unlocked nodes, automations
- `useNodeManagement` - Node unlocking, affordability, effects
- `useGameLoop` - 100ms ticks, notifications, passive generation
- `useSaveLoad` - LocalStorage persistence, offline progress
- `useEventBus` - Pub/sub for decoupled communication
- `useNotificationEngine` - Event-driven narration/hints (see below)

When adding interactions between composables, emit/subscribe to events rather than importing one into another.

### Notification Engine (`packages/game/src/composables/useNotificationEngine.ts`)
Centralized system for triggering narrations, hints, and achievements based on game events.

**Key features:**
- Event-driven via `useEventBus` — subscribes to `nodeUnlocked`, `branchUnlocked`, etc.
- O(1) indexed lookups for performance
- Persists "shown" state to localStorage with debounced saves
- Configurable `persistAcrossAscension` per notification

**Data files:** `packages/shared/src/data/notifications/`
```typescript
{
    id: 'unique_id',
    type: NotificationType.NARRATION,  // or HINT, ACHIEVEMENT
    trigger: {
        type: TriggerType.ON_NODE_UNLOCKED,
        nodeId: 'hand_crank'
    },
    message: 'Your narration text...',
    duration: 8000,
    persistAcrossAscension: false,
    priority: 10
}
```

**Trigger types:** `onFirstLaunch`, `onNodeUnlocked`, `onNodeLevelReached`, `onResourceAmountReached`, `onBranchUnlocked`, `onTierReached`, `onIdleTime`, `onAscension`

**Adding narrations:** Add to appropriate file in `packages/shared/src/data/notifications/narration/` — do NOT add inline `narrate` effects to nodes.

### Node System (`packages/shared/src/data/nodes/`)
Nodes are the progression mechanic. Each unlock reveals story and gameplay:
```typescript
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
Narration drives the story. Narrations are defined in `packages/shared/src/data/notifications/narration/`:
- Write in second person, present tense ("You discover...", "The room illuminates...")
- Keep it atmospheric—describe what the player sees/hears/feels
- Use narration for discoveries and milestones, not routine upgrades
- Multi-level nodes can have narration at key levels (1, 5, max)
- See `docs/narration.md` for the full narrative design

### Branch Progression
Players start with energy (hand crank → hamster wheel → generators). Unlocking `attic` reveals grandpa's old computer, opening the computer branch. Future branches extend this pattern.

### Components (`packages/game/src/components/`)
Vue 3 Single File Components with TypeScript:
```vue
<script setup lang="ts">
import type { Node } from '@network-sim/shared'

interface Props {
    node: Node
    isUnlocked: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
    unlock: [nodeId: string]
}>()
</script>

<template>
    <div class="component">
        {{ node.name }}
    </div>
</template>
```

### Layout Engine (`packages/game/src/layout/`)
Auto-positions nodes radially by tier. Three TypeScript classes:
- `TreeBuilder` - Builds dependency graph
- `PositionCalculator` - Calculates radial positions by tier
- `CollisionResolver` - Prevents node overlap

Exported via `packages/game/src/layout/LayoutEngine.ts` as unified interface.

## TypeScript Coding Guidelines

### Strict Typing Rules
- **Never use `any`** - Use `unknown` if type truly unknown, narrow with type guards
- **Explicit return types** - Always declare return types for functions/composables
- **Interface over type** - Use `interface` for object shapes, `type` for unions/intersections
- **Readonly by default** - Mark properties `readonly` unless mutation required

### Naming Conventions
- **Interfaces**: PascalCase without 'I' prefix (`Node`, `GameState`, `Notification`)
- **Type aliases**: PascalCase (`NodeEffect`, `TriggerType`)
- **Enums**: PascalCase for enum, UPPER_SNAKE_CASE for values
- **Files**: camelCase for .ts files, PascalCase for .vue components

### Import Aliases
Game package uses `@/` alias for local imports:
```typescript
import type { Node, GameState } from '@network-sim/shared'
import { useEventBus } from '@/composables/useEventBus'
import GameData from '@/core/gameData'
```

Shared package uses relative imports internally, but exports everything through `@network-sim/shared` barrel.

## Key Patterns

### Cost Scaling
Use `GameData.getScaledNodeCost(node, options)` for proper tier/ascension scaling—never raw `node.cost`.

### Adding New Nodes
1. Add to `packages/shared/src/data/nodes/{branch}Branch.ts` with proper `Node` type
2. Export from `packages/shared/src/data/nodes/index.ts`
3. Set `requires` to connect to tree
4. Positions auto-calculate

### State Persistence
When adding state: add to composable, include in `toSaveState()`, handle in `loadFromState()` with backward-compatible defaults.

## Commands
```bash
pnpm run dev:game     # Start game dev server (http://localhost:3000)
pnpm run dev:editor   # Start editor dev server (http://localhost:3001)
pnpm run build:game   # Production build game to dist-game/
pnpm run build:editor # Production build editor to dist-editor/
pnpm run build:all    # Build both apps
./build-itch.sh       # Package game zip for itch.io (manual upload)
```

## File Organization
```
packages/
├── game/
│   ├── src/
│   │   ├── App.vue              # Root component
│   │   ├── main.ts              # Entry point
│   │   ├── composables/         # TypeScript composables
│   │   ├── components/          # Vue SFCs
│   │   ├── core/                # GameData class
│   │   └── layout/              # Skill tree positioning
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── editor/
│   ├── src/
│   │   ├── App.vue
│   │   └── main.ts
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
└── shared/
    ├── src/
    │   ├── types/               # TypeScript interfaces
    │   ├── data/                # Nodes, notifications, constants
    │   └── utils/               # Pure TypeScript functions
    └── package.json
```

**Build output:** Game builds to `dist-game/`, editor builds to `dist-editor/` with code splitting, minification, source maps.
