# Network Simulator - Copilot Instructions

## The Story
You inherit an old shed from your grandfather. Inside, you discover a hand crank that hums when turned. This sparks a journey from manual power generation to building a vast computational network. The game tells this story through node unlocks—each revealing more of what grandpa left behind.

## Project Overview
An incremental idle game built with Vue 3 + TypeScript + Vite. Players crank for energy, unlock skill tree nodes, and discover new branches (energy → computer → future expansions).

## Tech Stack
- **Vue 3** - Composition API with Single File Components (SFCs)
- **TypeScript** - Strict mode, no `any` allowed
- **Vite** - Dev server with HMR, production bundler
- **Event Bus** - Decoupled composable communication pattern

## Architecture

### Composables (`src/composables/`)
TypeScript composables communicate via **event bus**, not direct imports:
- `useGameState` - Resources, unlocked nodes, automations
- `useNodeManagement` - Node unlocking, affordability, effects
- `useGameLoop` - 100ms ticks, notifications, passive generation
- `useSaveLoad` - LocalStorage persistence, offline progress
- `useEventBus` - Pub/sub for decoupled communication
- `useNotificationEngine` - Event-driven narration/hints (see below)

When adding interactions between composables, emit/subscribe to events rather than importing one into another.

### Notification Engine (`src/composables/useNotificationEngine.ts`)
Centralized system for triggering narrations, hints, and achievements based on game events.

**Key features:**
- Event-driven via `useEventBus` — subscribes to `nodeUnlocked`, `branchUnlocked`, etc.
- O(1) indexed lookups for performance
- Persists "shown" state to localStorage with debounced saves
- Configurable `persistAcrossAscension` per notification

**Data files:** `src/data/notifications/`
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

**Adding narrations:** Add to appropriate file in `src/data/notifications/narration/` — do NOT add inline `narrate` effects to nodes.

### Node System (`src/data/nodes/`)
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
Narration drives the story. Narrations are defined in `src/data/notifications/narration/`:
- Write in second person, present tense ("You discover...", "The room illuminates...")
- Keep it atmospheric—describe what the player sees/hears/feels
- Use narration for discoveries and milestones, not routine upgrades
- Multi-level nodes can have narration at key levels (1, 5, max)
- See `docs/narration.md` for the full narrative design

### Branch Progression
Players start with energy (hand crank → hamster wheel → generators). Unlocking `attic` reveals grandpa's old computer, opening the computer branch. Future branches extend this pattern.

### Components (`src/components/`)
Vue 3 Single File Components with TypeScript:
```vue
<script setup lang="ts">
import type { Node } from '@/types'

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

### Layout Engine (`src/layout/`)
Auto-positions nodes radially by tier. Three TypeScript classes:
- `TreeBuilder` - Builds dependency graph
- `PositionCalculator` - Calculates radial positions by tier
- `CollisionResolver` - Prevents node overlap

Exported via `src/layout/LayoutEngine.ts` as unified interface.

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
Use `@/` alias for src/ imports:
```typescript
import type { Node, GameState } from '@/types'
import { useEventBus } from '@/composables/useEventBus'
import GameData from '@/core/gameData'
```

## Key Patterns

### Cost Scaling
Use `GameData.getScaledNodeCost(node, options)` for proper tier/ascension scaling—never raw `node.cost`.

### Adding New Nodes
1. Add to `src/data/nodes/{branch}Branch.ts` with proper `Node` type
2. Export from `src/data/nodes/index.ts`
3. Set `requires` to connect to tree
4. Positions auto-calculate

### State Persistence
When adding state: add to composable, include in `toSaveState()`, handle in `loadFromState()` with backward-compatible defaults.

## Commands
```bash
npm run dev           # Start Vite dev server (http://localhost:3000)
npm run build         # Production build to dist/
npm run preview       # Preview production build locally
./build-itch.sh       # Package zip for itch.io (manual upload)
```

## File Organization
```
src/
├── App.vue              # Root SFC component
├── main.ts              # Vite entry point
├── composables/         # TypeScript composables
├── components/          # Vue SFCs
├── core/                # GameData class
├── data/                # Nodes, notifications, constants
├── layout/              # Skill tree positioning
├── types/               # TypeScript interfaces/types
└── utils/               # Pure TypeScript functions
```

**Build output:** Vite bundles to `dist/` with code splitting, minification, source maps.
