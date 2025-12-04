# Feature: CSS Refactoring - Split Monolithic Stylesheet

**Branch**: feature/split-css-by-feature  
**Created**: 2025-12-04

## Overview
Refactor 2200-line `styles.css` into modular, feature-area CSS files for maintainability

## Important Context
- Vue 3 + Vite project with automatic CSS import support
- Current single [styles.css](../../styles.css) (~2200 lines) contains all styling
- No existing CSS preprocessor (plain CSS with CSS variables)
- Vite handles bundling/optimization automatically
- Main entry is [src/main.ts](../../src/main.ts) which can import CSS modules

## Multi-Phase Implementation Plan

### Phase 1: Setup & Core Styles (Foundation) - ok
**Goal**: Extract shared foundations and configure build

1.1 Create [src/styles/](../../src/styles/) directory structure - ok 
1.2 Extract CSS variables and resets from [styles.css](../../styles.css) → [src/styles/variables.css](../../src/styles/variables.css)  - ok
1.3 Extract body, scrollbar, utility classes → [src/styles/base.css](../../src/styles/base.css) - ok 
1.4 Create [src/styles/index.css](../../src/styles/index.css) master import file - ok 
1.5 Update [src/main.ts](../../src/main.ts) to import `@/styles/index.css` instead of `styles.css`  - ok
1.6 Verify dev server works with new structure - ok

### Phase 2: Layout & Navigation (Structure) - OK
**Goal**: Extract layout and top-level navigation styles

2.1 Extract `#game-container`, `#main-content` → [src/styles/layout.css](../../src/styles/layout.css) - ok 
2.2 Extract `#header`, `.header-left`, `.icon-button` → [src/styles/header.css](../../src/styles/header.css) - ok 
2.3 Extract `#resources`, `.resource-*` classes → [src/styles/resources.css](../../src/styles/resources.css) - ok
2.4 Add imports to [src/styles/index.css](../../src/styles/index.css) - ok

### Phase 3: Sidebar Components (Actions) - OK
**Goal**: Modularize sidebar action elements

3.1 Extract `#sidebar`, sidebar h2 → [src/styles/sidebar.css](../../src/styles/sidebar.css) - ok
3.2 Extract `.action-btn`, `.btn-*` classes → [src/styles/action-buttons.css](../../src/styles/action-buttons.css) - ok
3.3 Extract `.crank-*` classes (all crank animations) → [src/styles/crank.css](../../src/styles/crank.css) - ok
3.4 Extract `.terminal-*` classes → [src/styles/terminal.css](../../src/styles/terminal.css) - ok
3.5 Extract `.automation-*` classes → [src/styles/automations.css](../../src/styles/automations.css) - ok
3.6 Add imports to [src/styles/index.css](../../src/styles/index.css) - ok 

### Phase 4: Skill Tree System (Core Gameplay)
**Goal**: Isolate skill tree visualization styles

4.1 Extract `#skill-tree-container`, `#skill-tree-wrapper`, `.zoom-controls` → [src/styles/skill-tree.css](../../src/styles/skill-tree.css)  
4.2 Extract parallax star animations (`::before`, `::after`) → [src/styles/skill-tree.css](../../src/styles/skill-tree.css)  
4.3 Extract `.node`, `.node-*`, `.shockwave`, tier colors → [src/styles/nodes.css](../../src/styles/nodes.css)  
4.4 Extract `#connections`, `.connection-*`, `.traveling-dot` → [src/styles/connections.css](../../src/styles/connections.css)  
4.5 Extract `.progress-ring` → [src/styles/nodes.css](../../src/styles/nodes.css)  
4.6 Add imports to [src/styles/index.css](../../src/styles/index.css)

### Phase 5: Info & Notifications (Feedback)
**Goal**: Separate information display and user feedback

5.1 Extract `#info-panel`, `.node-info-*`, `.cost-list` → [src/styles/info-panel.css](../../src/styles/info-panel.css)  
5.2 Extract `#notifications`, `.notification`, notification types → [src/styles/notifications.css](../../src/styles/notifications.css)  
5.3 Extract `#notification-history-panel`, `.history-*` → [src/styles/notification-history.css](../../src/styles/notification-history.css)  
5.4 Extract `#notification-history-button` → [src/styles/notification-history.css](../../src/styles/notification-history.css)  
5.5 Add imports to [src/styles/index.css](../../src/styles/index.css)

### Phase 6: Prestige & Modals (Endgame)
**Goal**: Extract prestige/ascension and modal overlays

6.1 Extract `.prestige-*`, `#ascension-section`, `#ascension-button` → [src/styles/prestige.css](../../src/styles/prestige.css)  
6.2 Extract `#ascension-panel`, `.tier-tabs`, `.upgrades-grid`, `.upgrade-card` → [src/styles/ascension-panel.css](../../src/styles/ascension-panel.css)  
6.3 Extract `#changelog-panel`, `.changelog-*`, `.release-*` → [src/styles/changelog.css](../../src/styles/changelog.css)  
6.4 Add imports to [src/styles/index.css](../../src/styles/index.css)  
6.5 Delete original [styles.css](../../styles.css) after verifying all imports work  
6.6 Remove `<link>` from [index.html](../../index.html) if it references `styles.css`

## Acceptance Criteria
- No visual regressions in dev or production builds
- All 15+ CSS files under 200 lines each
- Import order in `index.css` prevents cascade issues
- CSS variables remain in single `variables.css` source
- Vite builds successfully without errors
- File structure matches feature areas (not component files)

## Side Notes
- Vite automatically handles CSS bundling/minification in production
- Keep import order: variables → base → layout → components → modals
- CSS variables (`:root`) must load first to avoid undefined references
- Consider using `@import` in `index.css` or individual imports in `main.ts`
- Original `styles.css` lives at project root—new structure in `src/styles/`
