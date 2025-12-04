# Network Simulator

An incremental idle game built with Vue 3 + TypeScript + Vite. Players generate energy, unlock skill tree nodes, and discover the story of their grandfather's legacy.

## Tech Stack
- Vue 3 (Composition API + SFCs)
- TypeScript (strict mode)
- Vite (build tool + dev server)
- pnpm workspace monorepo
- Event bus architecture for decoupled composables

## Architecture

This project uses a **pnpm workspace monorepo** with three packages:

- **`packages/game/`** - Main game Vue app (runs on port 3000)
- **`packages/editor/`** - Story editor Vue app (runs on port 3001)
- **`packages/shared/`** - Shared types, data, and utilities

### Shared Package (`packages/shared/`)
Exports TypeScript types, game data, and utility functions used by both apps:
- `types/` - Node, GameState, Notification interfaces
- `data/` - Node definitions, notification configs, constants
- `utils/` - Pure functions (formatting, calculations)

Both game and editor import from `@network-sim/shared` with full type safety.

### Game Package (`packages/game/`)
Main gameplay app with composables and components:
- `composables/` - useGameState, useNodeManagement, useGameLoop, etc.
- `components/` - Vue SFCs for UI (SkillTree, ResourceBar, etc.)
- `layout/` - LayoutEngine for skill tree positioning
- `core/` - GameData singleton

### Editor Package (`packages/editor/`)
Minimal scaffold for future story/node editing tools.

## Development

### Install Dependencies
```bash
pnpm install
```

### Run Game (Development)
```bash
pnpm run dev:game
```
Opens at http://localhost:3000 with hot module replacement

### Run Editor (Development)
```bash
pnpm run dev:editor
```
Opens at http://localhost:3001 with hot module replacement

### Build Game for Production
```bash
pnpm run build:game
```
Outputs optimized bundle to `dist-game/` with code splitting and source maps

### Build Editor for Production
```bash
pnpm run build:editor
```
Outputs optimized bundle to `dist-editor/`

### Build Both Apps
```bash
pnpm run build:all
```

## Deployment

### Build for itch.io
```bash
./build-itch.sh
```
Runs production build, creates versioned zip of `dist-game/` folder. Upload manually to:
https://itch.io/game/edit/4067729

## Key Systems

### Composables (`packages/game/src/composables/`)
Vue composables communicate via event bus:
- `useGameState` - Resources, unlocked nodes, automations
- `useNodeManagement` - Node unlocking, affordability, effects
- `useGameLoop` - 100ms ticks, notifications, passive generation
- `useSaveLoad` - LocalStorage persistence, offline progress
- `useEventBus` - Pub/sub for decoupled communication
- `useNotificationEngine` - Event-driven narration/hints

### Node System (`packages/shared/src/data/nodes/`)
Skill tree progression. Each node:
- Costs resources (scaled by tier)
- Provides effects (automation, unlocks, narration)
- Requires prerequisites
- Auto-positions via `LayoutEngine`

### Layout Engine (`packages/game/src/layout/`)
Three classes position nodes radially:
- `TreeBuilder` - Builds dependency graph
- `PositionCalculator` - Calculates radial positions by tier
- `CollisionResolver` - Prevents node overlap

## Game Save Data
Persists to localStorage as `networkSimulatorSave`. Includes:
- Resources (energy, data, etc.)
- Unlocked nodes + levels
- Automations
- Prestige state
- Notification history
