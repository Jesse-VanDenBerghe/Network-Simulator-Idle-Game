# Story Simulator - Feature Specification

## Purpose
Dev tool for previewing/writing narrations. Standalone from main game. Plays notifications sequentially, ignoring triggers.

## Access
- Separate HTML file: `story-simulator.html`
- No bundler, same Vue 3 CDN pattern
- No game state, save/load, or game loop dependencies

---

## Decisions
| # | Question | Decision |
|---|----------|----------|
| 1 | Honor `delay` in auto-mode? | **Ignore** — play sequentially by duration only |
| 2 | Speed controls? | **Yes** — 1x/2x/4x buttons |
| 3 | Theme? | **Match game** — reuse `styles.css` |
| 4 | Editing? | **Read-only** — preview only |
| 5 | Filter by type? | **No** — show all |
| 6 | Show trigger metadata? | **Yes** — in metadata panel on click |
| 7 | Keyboard shortcuts? | **No** — not needed |

---

## UI Design

### Two-Panel Layout
```
┌─────────────────────────────────────┬──────────────────────────────────────┐
│  📖 Story Simulator                 │  PREVIEW PANEL                       │
├─────────────────────────────────────┤                                      │
│  Select File:                       │  ┌─────────────────────────────────┐ │
│  [▼ mainStory.js (42)]              │  │  .notification.narration        │ │
│                                     │  │                                 │ │
├─────────────────────────────────────┤  │  When you turn the crank, you   │ │
│  [▶ Play] [⏸] [⏭] [↻]  Speed: [2x] │  │  hear a faint humming sound...  │ │
│  Progress: [======>----] 12/42      │  │                                 │ │
├─────────────────────────────────────┤  └─────────────────────────────────┘ │
│  📜 Entry List (scrollable)         │                                      │
│  ┌─────────────────────────────────┐│  ┌─ METADATA ─────────────────────┐ │
│  │ 1. old_shed_intro      ✓ 📖    ││  │ id: hand_crank_unlock          │ │
│  │ 2. hand_crank_unlock   ▶ 📖    ││  │ type: narration                │ │
│  │ 3. lightbulb_unlock      📖    ││  │ duration: 10000ms              │ │
│  │ 4. gpa_old_pc_terminal   💻    ││  │ delay: 0                       │ │
│  │ 5. ...                         ││  │ priority: 10                   │ │
│  └─────────────────────────────────┘│  │ trigger:                       │ │
│                                     │  │   type: ON_NODE_UNLOCKED       │ │
│  Legend: 📖=narration 💻=terminal   │  │   nodeId: hand_crank           │ │
│          ℹ️=info 💡=hint            │  └─────────────────────────────────┘ │
└─────────────────────────────────────┴──────────────────────────────────────┘
```

### Key UI Elements

1. **Left Panel**
   - File dropdown (with entry count)
   - Playback controls + speed selector (1x/2x/4x)
   - Progress bar
   - Chronological entry list (clickable)

2. **Right Panel**
   - **Notification Preview**: Uses exact same CSS classes as game (`.notification.narration`, `.notification.terminal`, etc.)
   - **Metadata Panel**: Shows all entry properties (id, type, duration, delay, priority, trigger details)

---

## File Structure

```
story-simulator.html          # Standalone entry point (imports styles.css)
js/
  story-simulator/
    StorySimulatorApp.js      # Vue app, orchestrates everything
    useStoryPlayback.js       # Composable: playback state/controls/speed
    components/
      FileSelector.js         # Dropdown of narration files
      PlaybackControls.js     # Play/Pause/Skip/Reset + speed buttons
      EntryList.js            # Clickable chronological list
      NotificationPreview.js  # Renders using game's .notification CSS
      MetadataPanel.js        # Shows all entry properties + trigger
```

No separate CSS file — reuses `styles.css` from main game.

---

## Core Logic

### 1. File Selector
- Dropdown listing narration files
- Shows entry count per file
- On change: loads array, resets playback to index 0

### 2. Playback Engine (`useStoryPlayback.js`)
```javascript
const state = reactive({
    entries: [],           // loaded narration array
    currentIndex: 0,       // current entry index
    isPlaying: false,      // auto-advance toggle
    speed: 1               // 1, 2, or 4
});

// Controls
play()          // Start auto-advance
pause()         // Pause auto-advance  
skip()          // Jump to next entry
reset()         // Go back to index 0
goTo(i)         // Jump to specific index (for click)
setSpeed(n)     // Set playback speed multiplier

// Timing (auto-mode)
// Wait = entry.duration / speed
// entry.delay is IGNORED
```

### 3. Notification Preview
**Critical**: Must use exact same CSS as game for visual fidelity.

```html
<div class="notification" :class="entry.type">
    {{ entry.message }}
</div>
```

Relies on existing classes in `styles.css`:
- `.notification.narration`
- `.notification.terminal`
- `.notification.info`
- `.notification.hint`

### 4. Entry List
- Scrollable list of all entries in order
- Each row shows: index, id (truncated), type icon, played/current status
- Click → `goTo(i)` + display in preview + show metadata

### 5. Metadata Panel
Displays all properties of selected entry:
- `id`, `type`, `message` (truncated)
- `duration`, `delay`, `priority`
- `persistAcrossAscension`
- `trigger` object (expanded: type, nodeId, resource, threshold, etc.)

---

## Data Loading (Dynamic Imports)

Dynamic imports for extensibility + future editing support.

```javascript
// Registry of available narration files (easy to extend)
const NARRATION_FILES = [
    { filename: 'mainStory.js', label: 'Main Story', exportName: 'mainStoryNarrations' },
    { filename: 'energySide.js', label: 'Energy Side', exportName: 'energySideNarrations' },
    { filename: 'computerSide.js', label: 'Computer Side', exportName: 'computerSideNarrations' }
];

// Dynamic loader
async function loadNarrationFile(filename) {
    const file = NARRATION_FILES.find(f => f.filename === filename);
    const module = await import(`../data/notifications/narration/${filename}`);
    return {
        filename,
        label: file.label,
        entries: module[file.exportName],
        // Future: raw source for editing
        // source: await fetch(`js/data/notifications/narration/${filename}`).then(r => r.text())
    };
}

// Get file list with counts (async)
async function getFileList() {
    const results = [];
    for (const file of NARRATION_FILES) {
        const data = await loadNarrationFile(file.filename);
        results.push({
            filename: file.filename,
            label: file.label,
            count: data.entries.length
        });
    }
    return results;
}
```

### Future Editor Support
When editing is added later:
- `loadNarrationFile()` can also fetch raw source text
- Editor saves via local download or clipboard (no server)
- Structure allows adding new files to registry easily

---

## Implementation Plan

### Phase 1: Foundation
| ID | Task | Files | Description |
|----|------|-------|-------------|
| P1.1 | HTML entry point | `story-simulator.html` | Load Vue CDN, `styles.css`, set up `<div id="app">` |
| P1.2 | Directory structure | `js/story-simulator/` | Create folder + `components/` subfolder |
| P1.3 | Playback composable | `js/story-simulator/useStoryPlayback.js` | State: entries, currentIndex, isPlaying, speed. Methods: play/pause/skip/reset/goTo/setSpeed |

### Phase 2: Components (Core)
| ID | Task | Files | Description |
|----|------|-------|-------------|
| P2.1 | File selector | `components/FileSelector.js` | Dropdown w/ file list + entry counts |
| P2.2 | Entry list | `components/EntryList.js` | Scrollable list, click to select, shows type icons + status |
| P2.3 | Notification preview | `components/NotificationPreview.js` | Renders `.notification` with correct type class |

### Phase 3: Components (Supporting)
| ID | Task | Files | Description |
|----|------|-------|-------------|
| P3.1 | Metadata panel | `components/MetadataPanel.js` | Shows all entry props + expanded trigger object |
| P3.2 | Playback controls | `components/PlaybackControls.js` | Play/Pause/Skip/Reset buttons + speed selector (1x/2x/4x) |
| P3.3 | Progress bar | (inline in App) | Visual progress indicator |

### Phase 4: Integration
| ID | Task | Files | Description |
|----|------|-------|-------------|
| P4.1 | Main app | `js/story-simulator/StorySimulatorApp.js` | Wire all components, two-panel layout |
| P4.2 | Auto-advance timer | `useStoryPlayback.js` | setInterval based on duration/speed, pause/resume |
| P4.3 | Styling tweaks | `story-simulator.html` | Minor layout CSS (grid/flex for panels) |

### Phase 5: Polish
| ID | Task | Files | Description |
|----|------|-------|-------------|
| P5.1 | Scroll-to-current | `EntryList.js` | Auto-scroll list when playing |
| P5.2 | Empty state | `NotificationPreview.js` | Show placeholder when no entry selected |
| P5.3 | Test all files | — | Verify all 3 narration files load + play correctly |

---

## Dependencies

```
P1.1 ──┬── P1.2 ── P2.1 ── P4.1
       │          P2.2 ──┘
       └── P1.3 ── P2.3 ── P3.1
                   P3.2 ── P4.2
                          P4.3 ── P5.*
```
