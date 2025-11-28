# Story Editor - Feature Specification

**Status: 📋 PLANNED**

## Purpose
Full CRUD editor for narration files. Works offline, saves via GitHub PR. No server required.

## Architecture
```
┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│ Story Editor │───▶│ GitHub API  │───▶│ Your Repo    │
│ (Browser)    │◀───│             │◀───│              │
└──────────────┘    └─────────────┘    └──────────────┘
     │                                        │
     │ Edit offline                           │
     └────────────────────────────────────────┘
                  On save: PR
```

---

## Decisions

| # | Question | Decision |
|---|----------|----------|
| 1 | Token storage | localStorage |
| 2 | PR strategy | All changes in 1 PR |
| 3 | Base branch | User selects |
| 4 | Offline editing | Yes - auth only required on save |
| 5 | Conflict handling | Warn if file changed since fetch |

---

## UI Design

### Settings Panel (collapsible)
```
┌─ GitHub Settings ─────────────────────────────┐
│ Repo: [owner/repo____________]                │
│ Token: [ghp_xxxx...________] [Save]           │
│ Base branch: [▼ main]                         │
│ Status: ● Connected                           │
└───────────────────────────────────────────────┘
```

### Entry Editor (replaces metadata panel)
```
┌─ EDIT ENTRY ────────────────────────────────┐
│ id: [old_shed_intro_________]               │
│ type: [▼ narration]                         │
│ message:                                    │
│ ┌─────────────────────────────────────────┐ │
│ │ You step into the old shed...           │ │
│ └─────────────────────────────────────────┘ │
│ duration: [10000] ms                        │
│ delay: [0] ms                               │
│ priority: [10]                              │
│ persistAcrossAscension: [☐]                 │
│                                             │
│ ─ Trigger ─────────────────────────────     │
│ type: [▼ ON_NODE_UNLOCKED]                  │
│ nodeId: [hand_crank_______]                 │
│                                             │
│ [Delete] [Duplicate]                        │
└─────────────────────────────────────────────┘
```

### Entry List (with actions)
```
┌─────────────────────────────────────────────┐
│ [+ New Entry]                    Filter: [ ]│
├─────────────────────────────────────────────┤
│ ⋮⋮ 1. old_shed_intro    ● 📖  [↑][↓][×]    │
│ ⋮⋮ 2. hand_crank_unlock   📖  [↑][↓][×]    │
│ ...                                         │
└─────────────────────────────────────────────┘
  │                       │
  drag handle             ● = modified
```

### Toolbar
```
[📤 Create PR]  [↩ Revert All]   3 files modified, 5 entries changed
```

### PR Modal
```
┌─ Create Pull Request ────────────────────────┐
│ Branch name: [narration-updates-1128]        │
│ Title: [Update narrations]                   │
│ Description:                                 │
│ ┌──────────────────────────────────────────┐ │
│ │ - Added new attic narrations             │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ Changes:                                     │
│  ✓ mainStory.js (+2, -1, ~1)                 │
│  ✓ energySide.js (~1)                        │
│                                              │
│ ⚠ computerSide.js changed on remote!        │
│   [View Diff] [Overwrite Anyway]             │
│                                              │
│ [Cancel]                    [Create PR]      │
└──────────────────────────────────────────────┘
```

---

## File Structure

```
js/story-simulator/
  StorySimulatorApp.js      # Main app (updated)
  useStoryPlayback.js       # Playback logic (existing)
  useGitHub.js              # NEW: GitHub API composable
  useEditor.js              # NEW: CRUD + dirty tracking
  components/
    FileSelector.js         # Updated: fetch from GitHub
    EntryList.js            # Updated: reorder + actions
    EntryEditor.js          # NEW: form fields
    GitHubSettings.js       # NEW: auth + repo config
    PRModal.js              # NEW: create PR dialog
    NotificationPreview.js  # Existing
    PlaybackControls.js     # Existing
    MetadataPanel.js        # Deprecated (replaced by EntryEditor)
```

---

## Implementation Plan

### Phase 1: GitHub Integration

| ID | Task | Files | Description |
|----|------|-------|-------------|
| 1.1 | GitHub composable | `useGitHub.js` | Auth state, token storage, API helpers |
| 1.2 | List files | `useGitHub.js` | `GET /repos/:owner/:repo/contents/path` |
| 1.3 | Read file | `useGitHub.js` | Fetch + base64 decode + parse JS to JSON |
| 1.4 | Settings UI | `GitHubSettings.js` | Repo, token, branch inputs |
| 1.5 | Connect FileSelector | `FileSelector.js` | Use GitHub API instead of static imports |

### Phase 2: Editor Composable

| ID | Task | Files | Description |
|----|------|-------|-------------|
| 2.1 | Editor state | `useEditor.js` | entries, originalEntries, dirtyFiles tracking |
| 2.2 | Modify entry | `useEditor.js` | Update entry, mark file dirty |
| 2.3 | Add entry | `useEditor.js` | Create blank entry with defaults |
| 2.4 | Delete entry | `useEditor.js` | Remove entry, mark file dirty |
| 2.5 | Duplicate entry | `useEditor.js` | Clone entry with new ID |
| 2.6 | Reorder entries | `useEditor.js` | Move up/down, mark file dirty |
| 2.7 | Revert | `useEditor.js` | Reset to originalEntries |

### Phase 3: Editor UI

| ID | Task | Files | Description |
|----|------|-------|-------------|
| 3.1 | Entry editor form | `EntryEditor.js` | All fields: id, type, message, duration, delay, priority, persist, trigger |
| 3.2 | Trigger sub-form | `EntryEditor.js` | Dynamic fields based on trigger type |
| 3.3 | Entry list actions | `EntryList.js` | Add [↑][↓][×] buttons, modified indicator |
| 3.4 | New entry button | `EntryList.js` | [+ New Entry] at top |
| 3.5 | Toolbar | `StorySimulatorApp.js` | File status, revert button |
| 3.6 | Wire editor | `StorySimulatorApp.js` | Replace MetadataPanel with EntryEditor |

### Phase 4: GitHub Save (PR Creation)

| ID | Task | Files | Description |
|----|------|-------|-------------|
| 4.1 | Serialize entries | `useEditor.js` | Convert entries back to JS source string |
| 4.2 | Check conflicts | `useGitHub.js` | Compare SHA, warn if changed |
| 4.3 | Create branch | `useGitHub.js` | `POST /repos/:owner/:repo/git/refs` |
| 4.4 | Commit files | `useGitHub.js` | `PUT /repos/:owner/:repo/contents/:path` for each file |
| 4.5 | Create PR | `useGitHub.js` | `POST /repos/:owner/:repo/pulls` |
| 4.6 | PR modal | `PRModal.js` | Branch name, title, description, file list, conflict warnings |
| 4.7 | Success feedback | `PRModal.js` | Link to created PR |

### Phase 5: Polish

| ID | Task | Files | Description |
|----|------|-------|-------------|
| 5.1 | Validation | `EntryEditor.js` | Required fields, unique IDs |
| 5.2 | Drag-and-drop | `EntryList.js` | Reorder via drag |
| 5.3 | Unsaved warning | `StorySimulatorApp.js` | Warn on page leave if dirty |
| 5.4 | Offline indicator | `GitHubSettings.js` | Show when not connected |
| 5.5 | Error handling | `useGitHub.js` | Rate limits, auth errors, network failures |

---

## GitHub API Reference

### List directory
```
GET /repos/{owner}/{repo}/contents/{path}
→ [{ name, path, sha, type }, ...]
```

### Read file
```
GET /repos/{owner}/{repo}/contents/{path}
→ { content (base64), sha, ... }
```

### Create/update file
```
PUT /repos/{owner}/{repo}/contents/{path}
Body: { message, content (base64), sha, branch }
```

### Create branch
```
POST /repos/{owner}/{repo}/git/refs
Body: { ref: "refs/heads/branch-name", sha: base_commit_sha }
```

### Create PR
```
POST /repos/{owner}/{repo}/pulls
Body: { title, body, head: branch, base: "main" }
```

---

## Dependencies

```
Phase 1 ──▶ Phase 2 ──▶ Phase 3
                │
                ▼
            Phase 4 ──▶ Phase 5
```

---

## Open Items

- [x] Support creating new narration files? **Yes**
- [x] Auto-generate IDs or manual entry? **Manual entry**
- [x] Validation rules for trigger fields? **Based on TriggerType definitions in code**
