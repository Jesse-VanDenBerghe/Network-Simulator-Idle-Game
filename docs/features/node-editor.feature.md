## Feature: Node Editor

**Branch**: feature/node-editor  
**Created**: December 4, 2025

## Overview
Visual node graph editor with drag-and-drop, connection editing, and property management.

## Important Context
- Project uses Vue 3 + TypeScript monorepo with pnpm workspaces
- Nodes defined in `@network-simulator/shared` package with strict `Node` interface
- Game uses `LayoutEngine` for radial skill tree positioning (can reuse for editor)
- Current node data in `packages/shared/src/data/nodes/` split by branch (energyBranch.ts, computerBranch.ts)
- Editor package minimal—only has placeholder App.vue, runs on port 3001
- No external UI libraries currently, using native Vue/SVG to keep bundle small

## Multi-Phase Implementation Plan

### Phase 1: Core Canvas & Visualization
**Goal**: Render existing nodes visually with pan/zoom

1.1. Create [`NodeCanvas.vue`](packages/editor/src/components/NodeCanvas.vue) using SVG for node/connection rendering with pan/zoom controls

1.2. Create [`useNodeGraphManager`](packages/editor/src/composables/useNodeGraphManager.ts) composable loading `allNodes` from `@network-simulator/shared`, managing editor state

1.3. Implement [`canvasRenderer.ts`](packages/editor/src/utils/canvasRenderer.ts) utility converting `Node` positions to SVG coordinates, drawing connection paths

1.4. Add [`NodeVisual.vue`](packages/editor/src/components/NodeVisual.vue) displaying individual node with icon, name, tier badge, branch color

1.5. Integrate existing [`LayoutEngine`](packages/game/src/layout/LayoutEngine.ts) calculating initial node positions

1.6. Wire up `NodeCanvas` in [`App.vue`](packages/editor/src/App.vue) with sidebar showing node count, branch filters

### Phase 2: Node Selection & Property Editor
**Goal**: Select nodes and edit their properties

2.1. Add click handling to `NodeVisual` emitting `node-selected` event, highlighting selected node

2.2. Create [`PropertyPanel.vue`](packages/editor/src/components/PropertyPanel.vue) with form inputs for `Node` properties (id, name, icon, tier, branch, description, cost, effects)

2.3. Implement [`useNodeEditor`](packages/editor/src/composables/useNodeEditor.ts) composable managing node selection, property updates, validation

2.4. Add [`EffectsEditor.vue`](packages/editor/src/components/EffectsEditor.vue) sub-component editing `NodeEffects` object with dynamic fields per effect type

2.5. Implement real-time validation using `checkNodeAvailable` logic from `@network-simulator/shared`

2.6. Add split-pane layout in `App.vue` with canvas left, `PropertyPanel` right

### Phase 3: Connection Management
**Goal**: Edit node requirements/dependencies visually

3.1. Add connection mode toggle enabling drag-to-connect interaction node-to-node

3.2. Implement connection dragging in `NodeCanvas` with rubber-band line following cursor

3.3. Update `Node.requires` array when connection dropped, validating circular dependencies

3.4. Add connection visualization showing requirement type (string vs leveled `{id, level}`)

3.5. Create context menu on connections with delete/edit level requirement options

3.6. Implement connection validation preventing cycles using graph traversal

### Phase 4: Node Creation & Deletion
**Goal**: Add/remove nodes from graph

4.1. Add toolbar with "Add Node" button opening [`NodeCreationDialog.vue`](packages/editor/src/components/NodeCreationDialog.vue) modal

4.2. Implement node creation form with minimal fields (id, name, tier, branch), auto-generated defaults

4.3. Add node to appropriate branch file in memory, recalculate layout via `LayoutEngine`

4.4. Implement delete node with confirmation dialog, cascade connection cleanup

4.5. Add duplicate node feature copying properties with new unique id

4.6. Implement undo/redo stack in `useNodeEditor` for create/delete/modify operations

### Phase 5: Export & Persistence
**Goal**: Save edited node graph to TypeScript files

5.1. Create [`useFileExporter`](packages/editor/src/composables/useFileExporter.ts) composable generating TypeScript code for modified branch files

5.2. Implement export dialog showing diff preview comparing original vs edited definitions

5.3. Add download buttons exporting individual branch files (`energyBranch.ts`, `computerBranch.ts`) or full export

5.4. Create autosave to localStorage with restore prompt on editor load

5.5. Add validation summary panel showing errors/warnings before export (missing connections, invalid costs, circular deps)

5.6. Implement "Test in Game" button opening game package with edited nodes (dev server integration)

### Phase 6: Advanced Features
**Goal**: Quality-of-life improvements

6.1. Add search/filter bar highlighting nodes matching search term (id, name, description)

6.2. Implement minimap component showing full graph overview with viewport indicator

6.3. Add branch isolation view toggling visibility of nodes outside selected branch

6.4. Create tier overview panel showing node distribution across tiers 0-8

6.5. Implement keyboard shortcuts (Delete, Ctrl+Z/Y, Ctrl+S, Arrow keys for selection)

6.6. Add visual warnings on nodes with missing requirements or cost scaling issues

## Acceptance Criteria

- [ ] Load and display all existing nodes from `@network-simulator/shared` with correct positions
- [ ] Pan/zoom canvas smoothly without performance issues
- [ ] Click node to open property editor showing all `Node` interface fields
- [ ] Edit node properties with real-time validation feedback
- [ ] Create connections by dragging between nodes, updating `requires` array
- [ ] Delete connections with confirmation
- [ ] Add new nodes via dialog, automatically positioned by layout engine
- [ ] Delete nodes with cascade connection cleanup
- [ ] Export modified nodes as valid TypeScript matching original file format
- [ ] Detect circular dependencies and prevent invalid connections
- [ ] Undo/redo for all edit operations
- [ ] Autosave/restore from localStorage

## Side Notes

- Using native SVG instead of canvas library (Konva, etc.) to keep bundle small and leverage Vue reactivity
- Leverage existing `LayoutEngine` from game package to maintain positioning consistency
- Editor doesn't need full game logic—focus on data authoring workflow
- Export format must preserve TypeScript typing and comments from original files
- Future integration: wire with story editor for narration effects
- May need to copy/share `LayoutEngine` classes to editor package or move to shared package
