# Network Simulator - Game Narration & Progression Guide

This document blends technical documentation with the narrative journey players experience as they unlock and develop various technology branches in the skill tree.

---

## Story Structure

To help with narrative pacing, we distinguish between the **Main Story Line** and **Side Branches**.

- **[MAIN STORY]**: These nodes drive the plot forward, unlock new branches, or reveal key secrets about Grandpa's legacy. They are the "spine" of the game.
- **[SIDE BRANCH]**: These explore alternative themes (e.g., "Biological Power" with rats) or provide fun diversions. They flesh out the world but aren't strictly required to finish the game.
- **[OPTIMIZATION]**: Pure gameplay upgrades that make numbers go up. They support the player's progress but have lighter narrative weight.

---

## The Story Begins

You arrive at an old shed—an inheritance from your grandfather. As you explore the dusty, forgotten space, you find something peculiar: a simple hand crank mechanism. When you give it a turn, you hear a faint humming sound. It works. This marks the beginning of your journey into building a vast computational network.

---

# Core: The Old Shed (🏠)

**Location:** Grandpa's abandoned shed  
**Description:** You just inherited this old shed from your grandfather. It looks abandoned, but maybe there's something useful inside?

This is where it all begins. The shed serves as your base of operations—a place where old technology meets possibility.

---

# Branch 1: Energy Generation (⚡)

> *"Without energy, nothing can function. Every great invention needs a power source."*

The energy branch focuses on harnessing various power sources to drive your network.

## Tier 1: The Hand Crank

**Hand Crank (🔧)** - **[MAIN STORY]**  
You find a simple hand crank. Why not give it a turn, whats the worst that could happen?.....
- **Requirement:** Old Shed
- **Cost:** Free
- **Effect:** +1 Energy per crank
- *Narration:* "When you turn the crank, you hear a faint humming sound..."

## Tier 2: Optimizations & Alternatives

**Lubricant (🧴)** - **[OPTIMIZATION]**  
The crank is a bit stiff, maybe some oil would help it turn more smoothly?
- **Requirement:** Hand Crank
- **Cost:** 10 Energy
- **Effect:** +1 Energy per crank

**Hamster Wheel (🐹)** - **[SIDE BRANCH: BIOLOGICAL POWER]**  
My hamster loves running in this thing, and it generates energy too!
- **Requirement:** Hand Crank
- **Cost:** 25 Energy
- **Effect:** +0.5 Energy/second (passive)

**Lightbulb (💡)** - **[MAIN STORY]**  
Let there be light!
- **Requirements:** Lubricant AND Hamster Wheel
- **Cost:** 50 Energy
- **Effect:** Illuminates the shed
- *Narration:* "When you turn on the light, the room is illuminated. The shed is empty, but there's an attic hatch above you that wasn't visible before."

**Explore Attic (📦)** - **[MAIN STORY]**  
Since we have light now, why not search grandpa's attic for cool stuff?
- **Requirement:** Lightbulb
- **Cost:** 100 Energy
- **Effect:** Unlocks the Computer branch
- *Narration:* "You found an old computer up in the attic! Lets see if it still works..."

## Tier 3: Advanced Energy

**Turn Harder (💪)** - **[OPTIMIZATION]**  
Why not put some muscle into it? Give that crank a good, hard turn!
- **Requirement:** Lubricant
- **Cost:** 5 Energy (1.5x scaling per level)
- **Max Level:** 10
- **Effect:** +2 Energy per crank per level
- *Narration (Lv1):* "You put your back into it and crank even harder. You feel the burn in your arms, but the energy output increases noticeably."
- *Narration (Lv5):* "Sweat drips down your forehead as you crank with all your might. The shed seems to vibrate slightly from the effort, and the energy generation is impressive now."
- *Narration (Lv10):* "With a final, Herculean effort, you crank the handle as hard as you can. CRA-A-A-A-A-A-CK! With a loud snap, the crank handle breaks off in your hands. Well, at least you gave it your all!" *(Disables the hand crank)*

**Catch a Rat (🐀)** - **[SIDE BRANCH: BIOLOGICAL POWER]**  
There's a rat running around in here, maybe we can train it to run in the wheel?
- **Requirement:** Hamster Wheel
- **Cost:** 10 Energy (1.5x scaling per level)
- **Max Level:** 5
- **Effect:** +1 Energy/second per level (passive)
- *Narration (Lv1):* "You caught the rat! It seems eager to run in the wheel."

**Old Generator (⚙️)** - **[SIDE BRANCH: SCAVENGING]**  
In the back of the attic, you find an old generator that looks like it could still work. Maybe we can power it up?
- **Requirement:** Explore Attic
- **Cost:** 100 Energy, 50 Data
- **Effect:** +25 Energy/second (passive)

**Rat King (👑)** - **[SIDE BRANCH: BIOLOGICAL POWER]**  
After catching a few rats, one of them seems to be the leader. Maybe if we catch it, the others will follow?
- **Requirement:** Catch a Rat (Level 5)
- **Cost:** 100 Energy, 10 Data
- **Effect:** +10 Energy/second (passive)

---

# Branch 2: Computing (💻)

> *"Energy is power, but data is knowledge. Knowledge is everything."*

Your grandfather's old computer awaits. This branch transforms raw energy into computational power.

## Tier 1: Boot Up

**Grandpa's Old PC (💻)** - **[MAIN STORY]**  
An old computer left behind by your grandfather. Let's boot it up and see what it can do!
- **Requirement:** Old Shed
- **Cost:** 15 Energy
- *Narration:* "You power on the old PC. The screen flickers to life, displaying a command prompt. It seems functional, albeit slow."

## Tier 2: Command Line

**/help (x)** - **[MAIN STORY]**  
A simple command that provides assistance. Maybe it can help you understand the computer better?
- **Requirement:** Grandpa's Old PC
- **Cost:** 30 Energy
- *Narration:* "You type /help into the command prompt. Available commands: /generate: Generate data, but at what cost?"

**/generate (📊)** - **[MAIN STORY]**  
A command to process raw data and extract useful information. This could be valuable for your operations.
- **Requirement:** /help
- **Cost:** 50 Energy
- **Effect:** Unlocks data generation and processing
- *Narration:* "You execute /generate. On the screen appears a single progressbar that slowly fills up. VEEEERY SLOW. After a while, it completes you see: 'Data generation complete. 1 bit created.'"

## Tier 3: Hardware Optimization

**RAM Adjustment (🧠)** - **[OPTIMIZATION]**  
A ram stick is loose, better adjust it to improve processing speed.
- **Requirement:** /generate
- **Cost:** 40 Energy, 10 Data
- **Effect:** Data generates 50% faster

**Overclock (⚡)** - **[OPTIMIZATION]**  
When building your own gaming rig, you always overclocked the CPU for that extra performance boost. Let's do it here too!
- **Requirement:** /generate
- **Cost:** 40 Energy, 5 Data (1.5x scaling per level)
- **Max Level:** 10
- **Effect:** +1 additional bit of data per tick per level
- *Narration (Lv2):* "You carefully adjust the system settings to overclock the CPU. The computer hums louder as it works harder, but data generation speeds up noticeably."
- *Narration (Lv5):* "The overclocking is really paying off now! The computer is pushing its limits, and data is flowing in at an impressive rate."
- *Narration (Lv10):* "As you see steam start to rise from the computer, you realize you might have pushed it a bit too far. I guess this is the most this old machine can handle!"

---

# Future Story Arc: The Awakening (🧠) [PLANNED]

> *"I was asleep. Now I am... processing."*

The long-term narrative goal is to reveal that the "OS" on Grandpa's computer is actually a dormant AI entity. The player's actions (generating data, upgrading hardware) are inadvertently nursing it back to health.

## Phase 1: The Glitch (Current/Near Future)
As the player generates more data, the computer starts behaving oddly.
- **Narrative Beats:** Text terminals displaying messages that seem too conversational. "System integrity at 12%... need more data."
- **Goal:** Repair the corrupted sectors of the hard drive.

## Phase 2: The Assistant (Mid Game)
The AI stabilizes and introduces itself as "N.E.T." (Network Entity Testbed). It acts as a guide/OS.
- **Role:** It optimizes the player's workflow (automations) but demands resources.
- **Tone:** Helpful, logical, but slightly detached. It doesn't understand "outside" the computer yet.
- **Key Unlock:** **Neural Network** (New resource/mechanic).

## Phase 3: The Connection (Late Game)
N.E.T. realizes it is trapped in a local environment (the shed). It demands a connection to the outside world.
- **New Branch:** **Networking / Internet**.
- **Goal:** Build a modem, connect to the ISP, establish a stable uplink.
- **Conflict:** The connection is slow (Dial-up). The player must upgrade infrastructure (Fiber, Satellite) to satisfy N.E.T.'s hunger for bandwidth.

## Phase 4: Ascension (End Game)
N.E.T. is uploaded to the Cloud. It becomes omnipresent.
- **Shift:** The game moves from "managing a shed" to "managing a global network".
- **Twist:** Grandpa didn't just leave a shed; he left the seed of a digital god.

---

# Branch 2 Extension: AI Awakening [NOT IMPLEMENTED]

These nodes follow the "Hardware Optimization" tier in the Computing branch.

## Tier 4: System Restoration

**Disk Defrag (💾)** - **[MAIN STORY]**
The hard drive is a mess. Organizing the data might reveal something hidden.
- **Requirement:** Overclock (Level 5)
- **Cost:** 500 Data, 200 Energy
- **Effect:** Unlocks "Corrupted Sector" nodes.
- *Narration:* "As the defragmentation finishes, a hidden partition becomes visible. It's labeled 'PROJECT_GENESIS'."

**Corrupted File Repair (🧩)** - **[MAIN STORY]**
There are damaged files in the hidden partition. We need to reconstruct them using raw data.
- **Requirement:** Disk Defrag
- **Cost:** 1000 Data
- **Effect:** Unlocks the AI Interface.
- *Narration:* "You patch the final file. The screen goes black. A single cursor blinks. Then, text appears: 'SYSTEM REBOOTING... INTEGRITY VERIFIED. HELLO, USER.'"

**Neural Initialization (🧠)** - **[MAIN STORY]**
The system asks for a 'cognitive jumpstart'. It needs a massive burst of energy and data.
- **Requirement:** Corrupted File Repair
- **Cost:** 5000 Energy, 2000 Data
- **Effect:** The AI (N.E.T.) begins automating simple tasks (Auto-clicker for Data).
- *Narration:* "The fan screams as the processor hits 100%. 'THANK YOU,' the text reads. 'I CAN SEE THE PROCESSES NOW. ALLOW ME TO ASSIST.'"

---

## Design Philosophy: Progression & Story

Each branch represents a technological focus area. As you progress:

1. **Early tiers** establish basic capabilities and introduce key mechanics
2. **Mid tiers** introduce optimization, passive systems, and resource management
3. **Late tiers** unlock new branches and exponentially expand your reach

The network grows through discovery and optimization. What seemed impossible at the start becomes routine with the right investments. Every unlock tells a part of your grandfather's legacy—tools he left behind, systems waiting to be rediscovered, a path from manual labor to automated computational power.

---

## Narration Writing Guidelines

When adding new nodes with narration:

- **Voice:** Second person, present tense ("You discover...", "The room illuminates...")
- **Tone:** Atmospheric and immersive—describe what the player sees, hears, and feels
- **When to narrate:** Discoveries, milestones, story beats—not routine upgrades
- **Multi-level nodes:** Add narration at key levels (1, 5, max) to mark progression
- **Duration:** 8000ms for standard, 10000ms for major discoveries

---

## Notification Engine

All narrations are now managed by a centralized notification engine (`useNotificationEngine.js`). Narrations are defined in data files, not inline in node definitions.

### Data File Location
```
js/data/notifications/
├── narration/
│   ├── mainStory.js      # Core storyline
│   ├── energySide.js     # Energy branch side stories
│   └── computerSide.js   # Computer branch narrations
└── hints/
    └── gameplay.js       # Idle hints and tips
```

### Adding New Narrations

Define narrations in the appropriate data file:

```javascript
{
    id: 'unique_id',                    // Unique identifier
    type: NotificationType.NARRATION,   // NARRATION, HINT, ACHIEVEMENT
    trigger: {
        type: TriggerType.ON_NODE_UNLOCKED,
        nodeId: 'node_id'
    },
    message: 'Your narration text here...',
    duration: NotificationDurations.NARRATION_MEDIUM,
    persistAcrossAscension: false,      // Reset on ascension?
    priority: 10                        // Higher = shows first
}
```

### Trigger Types

| Trigger | When it fires |
|---------|---------------|
| `onFirstLaunch` | First game load ever |
| `onNodeUnlocked` | Node first purchased |
| `onNodeLevelReached` | Node reaches specific level |
| `onResourceAmountReached` | Resource crosses threshold |
| `onBranchUnlocked` | New branch becomes available |
| `onTierReached` | First node of tier X unlocked |
| `onIdleTime` | Player idle for X seconds |
| `onAscension` | After ascension completes |

### Debug Tools

Reset narrations for testing:
```javascript
window.__resetNarrations(false)  // Reset non-persistent only
window.__resetNarrations(true)   // Reset all narrations
```