# Network Simulator - Game Narration & Progression Guide

This document blends technical documentation with the narrative journey players experience as they unlock and develop various technology branches in the skill tree.

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

**Hand Crank (🔧)** - You find a simple hand crank. Why not give it a turn, whats the worst that could happen?.....
- **Requirement:** Old Shed
- **Cost:** Free
- **Effect:** +1 Energy per crank
- *Narration:* "When you turn the crank, you hear a faint humming sound..."

## Tier 2: Optimizations & Alternatives

**Lubricant (🧴)** - The crank is a bit stiff, maybe some oil would help it turn more smoothly?
- **Requirement:** Hand Crank
- **Cost:** 10 Energy
- **Effect:** +1 Energy per crank

**Hamster Wheel (🐹)** - My hamster loves running in this thing, and it generates energy too!
- **Requirement:** Hand Crank
- **Cost:** 25 Energy
- **Effect:** +0.5 Energy/second (passive)

**Lightbulb (💡)** - Let there be light!
- **Requirements:** Lubricant AND Hamster Wheel
- **Cost:** 50 Energy
- **Effect:** Illuminates the shed
- *Narration:* "When you turn on the light, the room is illuminated. The shed is empty, but there's an attic hatch above you that wasn't visible before."

**Explore Attic (📦)** - Since we have light now, why not search grandpa's attic for cool stuff?
- **Requirement:** Lightbulb
- **Cost:** 100 Energy
- **Effect:** Unlocks the Computer branch
- *Narration:* "You found an old computer up in the attic! Lets see if it still works..."

## Tier 3: Advanced Energy

**Turn Harder (💪)** - Why not put some muscle into it? Give that crank a good, hard turn!
- **Requirement:** Lubricant
- **Cost:** 5 Energy (1.5x scaling per level)
- **Max Level:** 10
- **Effect:** +2 Energy per crank per level
- *Narration (Lv1):* "You put your back into it and crank even harder. You feel the burn in your arms, but the energy output increases noticeably."
- *Narration (Lv5):* "Sweat drips down your forehead as you crank with all your might. The shed seems to vibrate slightly from the effort, and the energy generation is impressive now."
- *Narration (Lv10):* "With a final, Herculean effort, you crank the handle as hard as you can. CRA-A-A-A-A-A-CK! With a loud snap, the crank handle breaks off in your hands. Well, at least you gave it your all!" *(Disables the hand crank)*

**Catch a Rat (🐀)** - There's a rat running around in here, maybe we can train it to run in the wheel?
- **Requirement:** Hamster Wheel
- **Cost:** 10 Energy (1.5x scaling per level)
- **Max Level:** 5
- **Effect:** +1 Energy/second per level (passive)
- *Narration (Lv1):* "You caught the rat! It seems eager to run in the wheel."

**Old Generator (⚙️)** - In the back of the attic, you find an old generator that looks like it could still work. Maybe we can power it up?
- **Requirement:** Explore Attic
- **Cost:** 100 Energy, 50 Data
- **Effect:** +25 Energy/second (passive)

**Rat King (👑)** - After catching a few rats, one of them seems to be the leader. Maybe if we catch it, the others will follow?
- **Requirement:** Catch a Rat (Level 5)
- **Cost:** 100 Energy, 10 Data
- **Effect:** +10 Energy/second (passive)

---

# Branch 2: Computing (💻)

> *"Energy is power, but data is knowledge. Knowledge is everything."*

Your grandfather's old computer awaits. This branch transforms raw energy into computational power.

## Tier 1: Boot Up

**Grandpa's Old PC (💻)** - An old computer left behind by your grandfather. Let's boot it up and see what it can do!
- **Requirement:** Old Shed
- **Cost:** 15 Energy
- *Narration:* "You power on the old PC. The screen flickers to life, displaying a command prompt. It seems functional, albeit slow."

## Tier 2: Command Line

**/help (x)** - A simple command that provides assistance. Maybe it can help you understand the computer better?
- **Requirement:** Grandpa's Old PC
- **Cost:** 30 Energy
- *Narration:* "You type /help into the command prompt. Available commands: /generate: Generate data, but at what cost?"

**/generate (📊)** - A command to process raw data and extract useful information. This could be valuable for your operations.
- **Requirement:** /help
- **Cost:** 50 Energy
- **Effect:** Unlocks data generation and processing
- *Narration:* "You execute /generate. On the screen appears a single progressbar that slowly fills up. VEEEERY SLOW. After a while, it completes you see: 'Data generation complete. 1 bit created.'"

## Tier 3: Hardware Optimization

**RAM Adjustment (🧠)** - A ram stick is loose, better adjust it to improve processing speed.
- **Requirement:** /generate
- **Cost:** 40 Energy, 10 Data
- **Effect:** Data generates 50% faster

**Overclock (⚡)** - When building your own gaming rig, you always overclocked the CPU for that extra performance boost. Let's do it here too!
- **Requirement:** /generate
- **Cost:** 40 Energy, 5 Data (1.5x scaling per level)
- **Max Level:** 10
- **Effect:** +1 additional bit of data per tick per level
- *Narration (Lv2):* "You carefully adjust the system settings to overclock the CPU. The computer hums louder as it works harder, but data generation speeds up noticeably."
- *Narration (Lv5):* "The overclocking is really paying off now! The computer is pushing its limits, and data is flowing in at an impressive rate."
- *Narration (Lv10):* "As you see steam start to rise from the computer, you realize you might have pushed it a bit too far. I guess this is the most this old machine can handle!"

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