# Feature: Narration Engine

## Overview
A centralized notification/narration engine that triggers messages based on game events. Decouples narration content from node definitions, supports multiple notification types, and persists "shown" state with configurable reset behavior.

---

## Goals
- Single source of truth for all triggered notifications (narration, hints, achievements, system)
- Event-driven via `useEventBus` — no direct composable coupling
- "Shown once" tracking with configurable persistence (survives ascension or not)
- Data files organized by storyline/type in `js/data/notifications/`
- Migrate existing inline `node.effects.narrate` to new system
- Stack simultaneous notifications with delays
- **Performance-first design** — O(1) lookups, indexed data, minimal per-tick work

---

## Architecture

### New Files
```
js/
├── composables/
│   └── useNotificationEngine.js    # Core engine, subscribes to events
├── data/
│   └── notifications/
│       ├── index.js                # Re-exports all notification data
│       ├── types.js                # Trigger type definitions
│       ├── narration/
│       │   ├── mainStory.js        # Main storyline narrations
│       │   ├── energySide.js       # Energy branch side stories
│       │   └── computerSide.js     # Computer branch side stories
│       └── hints/
│           └── gameplay.js         # Gameplay hints/tips
```

### Data Schema
```javascript
// js/data/notifications/narration/mainStory.js
export const mainStoryNarrations = [
    {
        id: 'first_launch_welcome',
        type: NotificationType.NARRATION,
        trigger: {
            type: 'onFirstLaunch'
        },
        message: 'You arrive at an old shed—an inheritance from your grandfather...',
        duration: 10000,
        persistAcrossAscension: true,  // true = never show again, false = reset on ascend
        priority: 10  // higher = shows first in stack
    },
    {
        id: 'hand_crank_unlock',
        type: NotificationType.NARRATION,
        trigger: {
            type: 'onNodeUnlocked',
            nodeId: 'hand_crank'
        },
        message: 'When you turn the crank, you hear a faint humming sound...',
        duration: 8000,
        persistAcrossAscension: false
    },
    {
        id: 'energy_milestone_1000',
        type: NotificationType.NARRATION,
        trigger: {
            type: 'onResourceAmountReached',
            resource: 'energy',
            threshold: 1000,
            comparison: '>='
        },
        message: 'The energy hums through the shed...',
        duration: 8000,
        persistAcrossAscension: false
    },
    {
        id: 'catch_rat_level5',
        type: NotificationType.NARRATION,
        trigger: {
            type: 'onNodeLevelReached',
            nodeId: 'catch_rat',
            level: 5
        },
        message: 'The rats have formed a hierarchy...',
        duration: 8000,
        persistAcrossAscension: false
    }
];
```

### Trigger Types
| Trigger | Payload | Description |
|---------|---------|-------------|
| `onFirstLaunch` | – | Fires once ever (first game load) |
| `onNodeUnlocked` | `{ nodeId }` | When node first unlocked |
| `onNodeLevelReached` | `{ nodeId, level }` | When node reaches specific level |
| `onResourceAmountReached` | `{ resource, threshold, comparison }` | Current resource crosses threshold |
| `onBranchUnlocked` | `{ branch }` | When branch becomes available |
| `onFeatureUnlocked` | `{ feature }` | When feature (e.g., dataProcessing) unlocks |
| `onAscension` | `{ count }` | On ascension (can filter by count) |
| `onOfflineReturn` | `{ offlineSeconds }` | When player returns after being away |
| `onIdleTime` | `{ idleSeconds }` | Player hasn't interacted for X seconds |
| `onTierReached` | `{ tier }` | First node of tier X unlocked |

---

## Performance Architecture

### Problem
With 100s-1000s of notifications, naive approaches fail:
- ❌ Iterating all notifications on every event = O(n) per event
- ❌ Checking all resource thresholds every tick = O(n) × 10/sec
- ❌ Large localStorage reads/writes on each trigger

### Solution: Indexed Lookups + Lazy Evaluation

#### 1. **Pre-indexed notification maps** (built once at init)
```javascript
// Built at startup, O(1) lookup per event
const notificationIndex = {
    // Event-based triggers → Map<key, notification[]>
    onNodeUnlocked: new Map([
        ['hand_crank', [notification1]],
        ['lightbulb', [notification2, notification3]]
    ]),
    onNodeLevelReached: new Map([
        ['catch_rat:5', [notification4]],
        ['crank_harder:10', [notification5]]
    ]),
    onBranchUnlocked: new Map([...]),
    onFeatureUnlocked: new Map([...]),
    onTierReached: new Map([...]),
    onAscension: [],  // Small array, rare event
    onFirstLaunch: [], // Single item
    onOfflineReturn: [], // Small array
    
    // Tick-based triggers (special handling)
    onResourceAmountReached: [], // Sorted by threshold, binary search
    onIdleTime: []  // Sorted by idleSeconds
};
```

#### 2. **Shown state as Set** (O(1) membership check)
```javascript
const shownNotifications = new Set(['id1', 'id2', ...]);
// Check: shownNotifications.has(notification.id) — O(1)
```

#### 3. **Resource thresholds: sorted + tracking**
```javascript
// Pre-sorted by threshold ascending
const resourceThresholds = {
    energy: [
        { threshold: 100, notificationId: 'energy_100', triggered: false },
        { threshold: 1000, notificationId: 'energy_1000', triggered: false },
        { threshold: 10000, notificationId: 'energy_10000', triggered: false }
    ]
};

// On tick: only check from lastTriggeredIndex forward
// Once triggered, skip in future ticks
// Reset `triggered` flags on ascension if not persistent
```

#### 4. **Tick-based checks: throttled + early exit**
```javascript
// Only check resource/idle triggers every 500ms (not every 100ms tick)
let lastThresholdCheck = 0;
function onTick(now) {
    if (now - lastThresholdCheck < 500) return;
    lastThresholdCheck = now;
    
    // Binary search to find first unchecked threshold
    // Early exit once current resource < next threshold
}
```

#### 5. **Batch localStorage writes**
```javascript
// Don't write on every trigger — debounce 1s
let saveTimeout = null;
function markShown(id) {
    shownNotifications.add(id);
    if (!saveTimeout) {
        saveTimeout = setTimeout(() => {
            localStorage.setItem(KEY, JSON.stringify([...shownNotifications]));
            saveTimeout = null;
        }, 1000);
    }
}
```

### Complexity Summary
| Operation | Naive | Optimized |
|-----------|-------|-----------|
| Event trigger (node unlock) | O(n) scan all | O(1) map lookup |
| Resource threshold check | O(n) per tick | O(log n) binary search, throttled |
| Shown check | O(n) array scan | O(1) Set lookup |
| localStorage save | O(1) per trigger | O(1) debounced |

### Memory Considerations
- Index built once, ~few KB for 1000 notifications
- Shown Set: ~10-50KB for 1000 IDs (strings)
- No runtime allocation in hot paths

---

## Phases

### Phase 1: Core Engine Foundation
**Goal:** Create the notification engine composable with event subscriptions and shown-state tracking.

#### Tasks
1. **Create `useNotificationEngine.js`**
   - Subscribe to eventBus events: `nodeUnlocked`, `gameLoaded`, `branchUnlocked`, `featureUnlocked`, `ascensionComplete`
   - Maintain `shownNotifications` Set (persisted to localStorage)
   - Implement `checkTrigger(notification, eventData)` matcher
   - Emit `showNotification` events (consumed by `useGameLoop`)
   - Handle stacking: queue notifications with 500ms delay between
   - **Build notification index on init** — O(1) lookups per event

2. **Create trigger type definitions**
   - `js/data/notifications/types.js` — export trigger type constants
   - Type-safe trigger matching logic

3. **Add new events to eventBus**
   - Emit `branchUnlocked` from `useNodeManagement` when `unlockBranch` effect fires
   - Emit `featureUnlocked` when `unlockFeature` effect fires
   - Emit `ascensionComplete` from `useGameLoop.ascend()`

4. **Persistence**
   - Save shown notification IDs to localStorage key `networkSimShownNotifications`
   - Load on init, save on each trigger
   - Add `resetShownNotifications(persistentOnly: boolean)` for ascension/debug
   - **Debounce localStorage writes** — batch saves every 1s

5. **Index builder**
   - `buildNotificationIndex(allNotifications)` — runs once at startup
   - Groups by trigger type, keys by nodeId/branch/feature
   - Returns Map-based index for O(1) event handling

#### Acceptance
- Engine subscribes to events and logs matches (no UI yet)
- Shown state persists across page refresh
- Unit tests for trigger matching logic
- **Index built in <10ms for 1000 notifications**
- **Event handling <0.1ms per event**

---

### Phase 2: Data Migration
**Goal:** Move all inline `node.effects.narrate` to notification data files.

#### Tasks
1. **Create folder structure**
   ```
   js/data/notifications/
   ├── index.js
   ├── types.js
   └── narration/
       ├── mainStory.js      # Main storyline (hand_crank, lightbulb, attic, etc.)
       ├── energySide.js     # Side stories (catch_rat, crank_harder levelEffects)
       └── computerSide.js   # Computer branch narrations
   ```

2. **Migrate existing narrations**
   - Extract from `energyBranch.js`: hand_crank, hamster_wheel, lightbulb, attic, crank_harder (base + levels 5, 10), catch_rat
   - Extract from `computerBranch.js`: all narrate effects
   - Map each to proper trigger type

3. **Remove `narrate` from node effects**
   - Delete `narrate` and `levelEffects[n].narrate` from node definitions
   - Keep other `levelEffects` properties (like `disableCrank`)

4. **Update `useGameLoop.onNodeUnlocked`**
   - Remove direct `showNarration()` calls for node effects
   - Engine now handles these via event subscription

#### Acceptance
- All narrations defined in data files
- No `narrate` properties in node definitions
- Game behavior unchanged (narrations still appear)

---

### Phase 3: Resource & Milestone Triggers
**Goal:** Implement resource threshold and gameplay milestone triggers.

#### Tasks
1. **Resource monitoring in engine**
   - Subscribe to game loop tick or add dedicated `resourcesUpdated` event
   - Check `onResourceAmountReached` triggers against current resources
   - Track "already triggered" for each threshold (avoid spam)
   - **Throttle checks to 500ms** — not every 100ms tick
   - **Pre-sort thresholds + binary search** — O(log n) per check
   - **Early exit** — stop checking once resource < next threshold

2. **Tier tracking**
   - On `nodeUnlocked`, check if it's first node of that tier
   - Fire `onTierReached` trigger
   - **Use tier index Map** — O(1) lookup

3. **Idle time tracking**
   - Track last interaction timestamp
   - Check idle triggers in game loop (throttled with resource checks)
   - Reset on any user action (crank, unlock, etc.)
   - **Pre-sort idle thresholds** — check only next uncrossed threshold

4. **Add milestone narrations**
   - Energy milestones: 100, 1000, 10000
   - Data milestones: 100, 1000
   - First tier 3 node
   - First tier 4 node

#### Acceptance
- Resource thresholds trigger correctly
- Milestones don't re-trigger after shown
- Idle hints work (e.g., "The crank awaits..." after 60s idle)
- **Tick overhead <0.5ms with 100+ thresholds**

---

### Phase 4: Hints & Other Notification Types
**Goal:** Extend engine to support hints, achievements, system messages.

#### Tasks
1. **Create hint data files**
   ```
   js/data/notifications/hints/
   └── gameplay.js
   ```

2. **Add hint triggers**
   - `onIdleTime` hints for new players
   - `onResourceAmountReached` tips (e.g., "You can unlock the attic now!")

3. **Extend NotificationType enum**
   - Add `HINT`, `ACHIEVEMENT` if not present
   - Update CSS styles for new types

4. **Achievement stubs** (optional)
   - Placeholder data structure for future achievement system
   - Triggers on node count, resource totals, etc.

#### Acceptance
- Hints display with distinct styling
- Multiple notification types coexist
- Types use `NotificationType` enum consistently

---

### Phase 5: Ascension & Persistence Configuration
**Goal:** Configurable persistence behavior per notification.

#### Tasks
1. **Per-notification persistence flag**
   - `persistAcrossAscension: true` → never reset
   - `persistAcrossAscension: false` → reset on ascend

2. **Hook into ascension flow**
   - On `ascensionComplete`, call `resetShownNotifications(false)`
   - Only clears notifications where `persistAcrossAscension: false`

3. **Debug tools**
   - Add `window.__resetNarrations()` for testing
   - Console command to clear all shown state

4. **First launch detection**
   - Check for absence of any save data
   - Fire `onFirstLaunch` trigger exactly once ever

#### Acceptance
- Ascension resets non-persistent narrations
- First launch message shows only on fresh game
- Debug reset works

---

### Phase 6: Polish & Testing
**Goal:** Unit tests, edge cases, documentation.

#### Tasks
1. **Unit tests**
   - `tests/notificationEngine.test.js`
   - Trigger matching for all trigger types
   - Shown state persistence
   - Stack ordering by priority
   - **Index builder correctness**
   - **Binary search edge cases**

2. **Edge cases**
   - Rapid-fire triggers (debounce if needed)
   - Missing notification data (graceful fallback)
   - Corrupted localStorage (recovery)

3. **Performance validation**
   - Test with 1000+ notifications
   - Measure tick overhead (<1ms target)
   - Profile memory usage

4. **Update documentation**
   - `docs/narration.md` — update with new system
   - `.github/copilot-instructions.md` — add notification engine section

5. **Code cleanup**
   - Remove dead `showNarration` code paths
   - Ensure no duplicate notifications

#### Acceptance
- All tests pass
- No console errors in normal gameplay
- Documentation current

---

## Event Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Game Events                              │
├─────────────────────────────────────────────────────────────────┤
│  nodeUnlocked  │  gameLoaded  │  ascensionComplete  │  tick     │
└───────┬────────┴──────┬───────┴─────────┬───────────┴─────┬─────┘
        │               │                 │                 │
        ▼               ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    useNotificationEngine                         │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────┐ │
│  │ Event       │  │ Trigger      │  │ Shown State             │ │
│  │ Subscribers │─▶│ Matcher      │─▶│ (localStorage)          │ │
│  └─────────────┘  └──────────────┘  └─────────────────────────┘ │
│         │                                      │                 │
│         ▼                                      ▼                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Notification Queue (sorted by priority, 500ms delay)        ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
        │
        ▼ emit('showNotification', { message, type, duration })
┌─────────────────────────────────────────────────────────────────┐
│                       useGameLoop                                │
│              showNotification() → UI Toast                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Migration Checklist

### Nodes to migrate (narrate → data file)

**energyBranch.js:**
- [x] `hand_crank` — base narrate
- [x] `hamster_wheel` — base narrate
- [x] `lightbulb` — base narrate
- [x] `attic` — base narrate
- [x] `crank_harder` — base narrate + levelEffects 5, 10
- [x] `catch_rat` — base narrate

**computerBranch.js:**
- [x] All nodes with `narrate` effects (scan file)

**core.js:**
- [x] `old_shed` if has narrate (N/A - no narrate)

---

## localStorage Keys

| Key | Purpose |
|-----|---------|
| `networkSimShownNotifications` | Set of shown notification IDs |
| `networkSimNotificationHistory` | Existing history (keep) |

---

## Open Questions (Resolved)

| Question | Decision |
|----------|----------|
| First launch scope | Once ever (persistent) |
| Resource trigger type | Current resources, supports `>=`, `<=`, `==` |
| Node narrate coexistence | Migrate to single source |
| Persistence default | Configurable per notification |
| Stacking behavior | Queue with delay |
| Tests | Nice to have, Phase 6 |

---

## Implementation Status

All phases complete:
- ✅ Phase 1: Core Engine Foundation
- ✅ Phase 2: Data Migration
- ✅ Phase 3: Resource & Milestone Triggers
- ✅ Phase 4: Hints & Other Notification Types
- ✅ Phase 5: Ascension & Persistence Configuration
- ✅ Phase 6: Polish & Testing (41 unit tests)
