## Feature: TypeScript Migration

**Branch**: feature/typescript-migration  
**Created**: 2025-12-02  
**Jira**: N/A

## Overview
Migrate JavaScript codebase to TypeScript with Vite build system and Vue 3 SFCs.

## Important Context
- Current: Vue 3 CDN, no bundler, 30+ script tags in [index.html](../../index.html)
- Composables use event bus for decoupling, not direct imports
- [LayoutEngine.js](../../js/LayoutEngine.js) has 3 classes: `TreeBuilder`, `PositionCalculator`, `CollisionResolver`
- Tests removed (don't test implementation code)
- Itch.io deployment via [build-itch.sh](../../build-itch.sh) - zips compiled output
- Must preserve: event bus pattern, game save/load, node system, notification engine

## Multi-Phase Implementation Plan

### Phase 1: Build System Foundation
**Goal**: Vite + TypeScript tooling without breaking current JS code

1.1 Install Vite, TypeScript, Vue plugin as devDependencies  
1.2 Create [tsconfig.json](../../tsconfig.json) with strict mode, path aliases, Vue types  
1.3 Create [vite.config.ts](../../vite.config.ts) with Vue plugin, path aliases (@/), build output config  
1.4 Update [package.json](../../package.json) scripts: `dev`, `build`, `preview`  
1.5 Create [src/main.ts](../../src/main.ts) entry point mounting Vue app  
1.6 Verify dev server runs with existing JS files (no compilation errors)

### Phase 2: Core Type Definitions
**Goal**: Define interfaces/types for game data structures

2.1 Create [src/types/game.ts](../../src/types/game.ts) with `Resource`, `GameState`, `PrestigeState` interfaces  
2.2 Create [src/types/node.ts](../../src/types/node.ts) with `Node`, `NodeEffect`, `NodeCost`, `Branch` types  
2.3 Create [src/types/notification.ts](../../src/types/notification.ts) with `Notification`, `TriggerType`, `NotificationType` enums  
2.4 Create [src/types/event.ts](../../src/types/event.ts) with `EventMap` interface for event bus typing  
2.5 Create [src/types/index.ts](../../src/types/index.ts) barrel export for all types

### Phase 3: Data Migration
**Goal**: Convert data files to TypeScript with proper typing

3.1 Migrate [js/data/constants.js](../../js/data/constants.js) → [src/data/constants.ts](../../src/data/constants.ts) with typed exports  
3.2 Migrate [js/data/resources.js](../../js/data/resources.js) → [src/data/resources.ts](../../src/data/resources.ts) using `Resource` type  
3.3 Migrate [js/data/nodes/](../../js/data/nodes/) → [src/data/nodes/](../../src/data/nodes/) with `Node` type annotations  
3.4 Migrate [js/data/notifications/](../../js/data/notifications/) → [src/data/notifications/](../../src/data/notifications/) with `Notification` type  
3.5 Migrate [js/data/changelogData.js](../../js/data/changelogData.js) → [src/data/changelogData.ts](../../src/data/changelogData.ts)  
3.6 Migrate [js/prestigeData.js](../../js/prestigeData.js) → [src/data/prestigeData.ts](../../src/data/prestigeData.ts)

### Phase 4: Composables Migration
**Goal**: Convert composables to TypeScript with strict typing

4.1 Migrate [js/composables/useEventBus.js](../../js/composables/useEventBus.js) → [src/composables/useEventBus.ts](../../src/composables/useEventBus.ts) with `EventMap` typing  
4.2 Migrate [js/composables/useGameState.js](../../js/composables/useGameState.js) → [src/composables/useGameState.ts](../../src/composables/useGameState.ts) with `GameState` return type  
4.3 Migrate [js/composables/usePrestigeState.js](../../js/composables/usePrestigeState.js) → [src/composables/usePrestigeState.ts](../../src/composables/usePrestigeState.ts) with `PrestigeState` return type  
4.4 Migrate [js/composables/useNodeManagement.js](../../js/composables/useNodeManagement.js) → [src/composables/useNodeManagement.ts](../../src/composables/useNodeManagement.ts) with typed parameters  
4.5 Migrate [js/composables/useNotificationEngine.js](../../js/composables/useNotificationEngine.js) → [src/composables/useNotificationEngine.ts](../../src/composables/useNotificationEngine.ts)  
4.6 Migrate [js/composables/useSaveLoad.js](../../js/composables/useSaveLoad.js) → [src/composables/useSaveLoad.ts](../../src/composables/useSaveLoad.ts)  
4.7 Migrate [js/composables/useGameLoop.js](../../js/composables/useGameLoop.js) → [src/composables/useGameLoop.ts](../../src/composables/useGameLoop.ts)  
4.8 Migrate [js/composables/useNodeValidation.js](../../js/composables/useNodeValidation.js) → [src/composables/useNodeValidation.ts](../../src/composables/useNodeValidation.ts)

### Phase 5: Components to SFCs
**Goal**: Convert global script components to TypeScript Single File Components

5.1 Migrate [js/components/ResourceBar.js](../../js/components/ResourceBar.js) → [src/components/ResourceBar.vue](../../src/components/ResourceBar.vue) with typed props  
5.2 Migrate [js/components/SkillNode.js](../../js/components/SkillNode.js) → [src/components/SkillNode.vue](../../src/components/SkillNode.vue) using `Node` type  
5.3 Migrate [js/components/SkillTree.js](../../js/components/SkillTree.js) → [src/components/SkillTree.vue](../../src/components/SkillTree.vue)  
5.4 Migrate [js/components/CrankButton.js](../../js/components/CrankButton.js) → [src/components/CrankButton.vue](../../src/components/CrankButton.vue)  
5.5 Migrate [js/components/NotificationToast.js](../../js/components/NotificationToast.js) → [src/components/NotificationToast.vue](../../src/components/NotificationToast.vue)  
5.6 Migrate remaining 10 components in [js/components/](../../js/components/) to [src/components/](../../src/components/)

### Phase 6: Utilities & Layout Engine
**Goal**: Migrate utilities and layout system to TypeScript

6.1 Migrate [js/utils/branchUtils.js](../../js/utils/branchUtils.js) → [src/utils/branchUtils.ts](../../src/utils/branchUtils.ts) with typed functions  
6.2 Migrate [js/utils/formatUtils.js](../../js/utils/formatUtils.js) → [src/utils/formatUtils.ts](../../src/utils/formatUtils.ts)  
6.3 Migrate [js/utils/nodeUtils.js](../../js/utils/nodeUtils.js) → [src/utils/nodeUtils.ts](../../src/utils/nodeUtils.ts)  
6.4 Migrate [js/LayoutEngine.js](../../js/LayoutEngine.js) → [src/layout/LayoutEngine.ts](../../src/layout/LayoutEngine.ts) with class types  
6.5 Split into [src/layout/TreeBuilder.ts](../../src/layout/TreeBuilder.ts), [src/layout/PositionCalculator.ts](../../src/layout/PositionCalculator.ts), [src/layout/CollisionResolver.ts](../../src/layout/CollisionResolver.ts)

### Phase 7: Main App & GameData
**Goal**: Complete migration with app entry point

7.1 Migrate [js/gameData.js](../../js/gameData.js) → [src/core/gameData.ts](../../src/core/gameData.ts) as typed class/module  
7.2 Migrate [js/App.js](../../js/App.js) → [src/App.vue](../../src/App.vue) as root SFC  
7.3 Update [src/main.ts](../../src/main.ts) to import `App.vue` and mount properly  
7.4 Remove test files: delete [tests/](../../tests/) directory entirely  
7.5 Update [.gitignore](../../.gitignore) with `node_modules/`, `dist/`, `.env.local`

### Phase 8: Build & Deployment
**Goal**: Production builds working for itch.io

8.1 Configure [vite.config.ts](../../vite.config.ts) build options: output to `dist/`, minify, sourcemaps  
8.2 Update [build-itch.sh](../../build-itch.sh) to run `npm run build` then zip `dist/` folder  
8.3 Test production build locally with `npm run preview`  
8.4 Verify game functionality: save/load, node unlocks, notifications, ascension  
8.5 Create itch.io test build and upload to verify deployment works  
8.6 Update [README.md](../../README.md) with new dev/build commands

### Phase 9: Documentation & Cleanup
**Goal**: Update docs, remove old JS files

9.1 Update [.github/copilot-instructions.md](../../.github/copilot-instructions.md) with TypeScript patterns, SFC structure, Vite commands  
9.2 Add TypeScript coding guidelines: strict types, no `any`, interface naming conventions  
9.3 Delete entire [js/](../../js/) directory after verifying all files migrated  
9.4 Delete [index.html](../../index.html) (replaced by Vite's generated HTML)  
9.5 Create [index.html](../../index.html) template in root for Vite with proper meta tags

## Acceptance Criteria
- All TypeScript files compile without errors in strict mode
- `npm run dev` starts local dev server with HMR working
- `npm run build` produces optimized bundle in `dist/` folder
- Production build loads in browser with full game functionality
- Save/load system preserves all game state correctly
- Event bus pattern maintained for composable communication
- Itch.io deployment works via updated `build-itch.sh` script
- No JS files remain in codebase (except config files)
- All types strictly defined, no usage of `any`
- Copilot instructions reflect new TypeScript/Vite architecture

## Side Notes
- Consider Pinia instead of event bus in future refactor (out of scope)
- May want ESLint + Prettier for TypeScript later (out of scope)
- Story simulator tool ([story-simulator.html](../../story-simulator.html)) migration deferred
- CSS splitting (separate feature) should happen after TS migration
- Preserve all existing game mechanics - zero gameplay changes
