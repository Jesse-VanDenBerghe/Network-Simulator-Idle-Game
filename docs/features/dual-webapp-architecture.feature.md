# Feature: Dual Webapp Architecture

**Branch**: feature/dual-webapp-architecture  
**Created**: December 4, 2025

## Overview
Split monolithic game into two independent Vue 3 + TypeScript apps with shared code.

## Important Context
Current single-app architecture limits editor development. Game codebase lives in `src/`, uses Vite + Vue 3 + TypeScript strict mode. All nodes/notifications defined as TypeScript data files. Must preserve existing game functionality while restructuring into pnpm workspace monorepo. Shared package enables type safety across both apps without runtime coupling.

## Multi-Phase Implementation Plan

### Phase 1: Workspace Foundation - IMPLEMENTED
**Goal**: Establish pnpm monorepo structure without breaking existing game

**1.1** Install pnpm globally if not present: `npm install -g pnpm` -V

**1.2** Create [`pnpm-workspace.yaml`](../../pnpm-workspace.yaml) in root with packages array - V

**1.3** Create [`packages/`](../../packages/) directory structure: `game/`, `editor/`, `shared/` -V

**1.4** Update root [`package.json`](../../package.json): remove dependencies, add workspace scripts

**1.5** Create [`.gitignore`](../../.gitignore) entries for `packages/*/node_modules/`, `packages/*/dist/` -V

### Phase 2: Shared Package Setup - IMPLEMENTED
**Goal**: Extract reusable types, data, utils into standalone package

**2.1** Create [`packages/shared/package.json`](../../packages/shared/package.json) with TypeScript dependencies -V

**2.2** Create [`packages/shared/tsconfig.json`](../../packages/shared/tsconfig.json) with composite project config -V

**2.3** Copy [`src/types/`](../../src/types/) to [`packages/shared/src/types/`](../../packages/shared/src/types/) -V

**2.4** Copy [`src/data/`](../../src/data/) to [`packages/shared/src/data/`](../../packages/shared/src/data/) -V

**2.5** Copy [`src/utils/`](../../src/utils/) to [`packages/shared/src/utils/`](../../packages/shared/src/utils/) -V

**2.6** Create [`packages/shared/src/index.ts`](../../packages/shared/src/index.ts) barrel export file -V

**2.7** Update imports in copied files to use relative paths within shared package -V

### Phase 3: Game Package Migration - IMPLEMENTED
**Goal**: Move existing game into `packages/game/` with shared package imports

**3.1** Create [`packages/game/package.json`](../../packages/game/package.json) with Vue + Vite dependencies and `@network-sim/shared` workspace reference -V

**3.2** Copy [`vite.config.ts`](../../vite.config.ts) to [`packages/game/vite.config.ts`](../../packages/game/vite.config.ts), update paths -V

**3.3** Copy [`tsconfig.json`](../../tsconfig.json) to [`packages/game/tsconfig.json`](../../packages/game/tsconfig.json), add shared package reference -V

**3.4** Copy [`index.html`](../../index.html) to [`packages/game/index.html`](../../packages/game/index.html) -V

**3.5** Move remaining [`src/`](../../src/) contents to [`packages/game/src/`](../../packages/game/src/) -V

**3.6** Update all game imports from `@/types`, `@/data`, `@/utils` to `@network-sim/shared` -V

**3.7** Update Vite alias in [`packages/game/vite.config.ts`](../../packages/game/vite.config.ts) to resolve `@/` to game src only -V

### Phase 4: Editor Package Scaffold
**Goal**: Create minimal editor app structure for future development

**4.1** Create [`packages/editor/package.json`](../../packages/editor/package.json) with Vue + Vite + shared dependency

**4.2** Create [`packages/editor/tsconfig.json`](../../packages/editor/tsconfig.json) with shared package reference

**4.3** Create [`packages/editor/vite.config.ts`](../../packages/editor/vite.config.ts) with port 3001

**4.4** Create [`packages/editor/index.html`](../../packages/editor/index.html) entry point

**4.5** Create [`packages/editor/src/main.ts`](../../packages/editor/src/main.ts) Vue app initialization

**4.6** Create [`packages/editor/src/App.vue`](../../packages/editor/src/App.vue) placeholder component

### Phase 5: Build System Integration
**Goal**: Wire up workspace commands and verify all apps build successfully

**5.1** Add root scripts to [`package.json`](../../package.json): `dev:game`, `dev:editor`, `build:game`, `build:editor`, `build:all`

**5.2** Update game [`vite.config.ts`](../../packages/game/vite.config.ts) outDir to `../../dist-game`

**5.3** Update editor [`vite.config.ts`](../../packages/editor/vite.config.ts) outDir to `../../dist-editor`

**5.4** Run `pnpm install` to link workspace dependencies

**5.5** Test `pnpm run dev:game` launches game on port 3000

**5.6** Test `pnpm run dev:editor` launches editor on port 3001

**5.7** Test `pnpm run build:all` produces both dist folders

### Phase 6: Cleanup and Documentation
**Goal**: Remove old structure, update docs, verify tests pass

**6.1** Delete root [`src/`](../../src/) directory after verifying game works

**6.2** Delete root [`index.html`](../../index.html), [`vite.config.ts`](../../vite.config.ts), [`tsconfig.json`](../../tsconfig.json)

**6.3** Update [`README.md`](../../README.md) with new workspace commands and architecture

**6.4** Update [`.github/copilot-instructions.md`](../../.github/copilot-instructions.md) with monorepo structure

**6.5** Move [`vitest.config.js`](../../vitest.config.js) to [`packages/shared/vitest.config.js`](../../packages/shared/vitest.config.js)

**6.6** Update test imports in [`tests/`](../../tests/) to use `@network-sim/shared`

**6.7** Run `pnpm test` from shared package to verify tests pass

**6.8** Update [`build-itch.sh`](../../build-itch.sh) to use `dist-game/` output

## Acceptance Criteria

- pnpm workspace successfully resolves all dependencies
- Game runs identically at `localhost:3000` with all features intact
- Editor launches at `localhost:3001` with placeholder UI
- Shared package exports all types, data, utils with correct TypeScript paths
- Both apps build independently without errors
- Both apps can import from `@network-sim/shared` with full type safety
- All existing tests pass
- No duplicate code between game and editor (types/data/utils)
- Root commands (`dev:game`, `build:all`) work as expected
- Git history preserved, old files cleanly removed

## Side Notes

**Package naming**: Use `@network-sim/` scope for internal workspace packages to avoid conflicts

**Vite resolution**: Shared package uses TypeScript path mapping, not Vite builds—both apps compile shared source directly

**Testing strategy**: Tests live in shared package since they test shared code; game/editor have separate test suites if needed

**Future editor work**: Phase 4 creates minimal scaffold—actual editor features planned separately

**Build outputs**: Keep dist folders at root for easier deployment (itch.io expects single zip)

**Dev workflow**: Run both apps simultaneously with `pnpm run dev:game` and `pnpm run dev:editor` in separate terminals
