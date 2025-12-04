# Network Simulator

An incremental idle game built with Vue 3 + TypeScript + Vite. Players generate energy, unlock skill tree nodes, and discover the story of their grandfather's legacy.

## Tech Stack
- Vue 3 (Composition API + SFCs)
- TypeScript (strict mode)
- Vite (build tool + dev server)
- Event bus architecture for decoupled composables

## Development

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```
Opens at http://localhost:3000 with hot module replacement

### Build for Production
```bash
npm run build
```
Outputs optimized bundle to `dist/` with:
- Terser minification
- Code splitting (Vue vendor chunk)
- Source maps for debugging

### Preview Production Build
```bash
npm run preview
```
Serves production build locally at http://localhost:4173

## Deployment

### Build for itch.io
```bash
./build-itch.sh
```
Runs production build, creates versioned zip of `dist/` folder. Upload manually to:
https://itch.io/game/edit/4067729

## Architecture

### Composables (`src/composables/`)
Vue composables communicate via event bus:
- `useGameState` - Resources, unlocked nodes, automations
- `useNodeManagement` - Node unlocking, affordability, effects
- `useGameLoop` - 100ms ticks, notifications, passive generation
- `useSaveLoad` - LocalStorage persistence, offline progress
- `useEventBus` - Pub/sub for decoupled communication
- `useNotificationEngine` - Event-driven narration/hints

### Node System (`src/data/nodes/`)
Skill tree progression. Each node:
- Costs resources (scaled by tier)
- Provides effects (automation, unlocks, narration)
- Requires prerequisites
- Auto-positions via `LayoutEngine`

### Layout Engine (`src/layout/`)
Three classes position nodes radially:
- `TreeBuilder` - Builds dependency graph
- `PositionCalculator` - Calculates radial positions by tier
- `CollisionResolver` - Prevents node overlap

## Project Structure
```
src/
├── App.vue              # Root component
├── main.ts              # Entry point
├── composables/         # Vue composables (TS)
├── components/          # Vue SFCs
├── data/                # Nodes, notifications, constants
├── layout/              # Skill tree positioning
├── types/               # TypeScript interfaces
└── utils/               # Pure functions
```

## Game Save Data
Persists to localStorage as `networkSimulatorSave`. Includes:
- Resources (energy, data, etc.)
- Unlocked nodes + levels
- Automations
- Prestige state
- Notification history
