# Network Simulator - Test Documentation

## Test Suite Overview

Full test coverage for the Network Simulator game with **95 passing tests** across 5 test files.

## Test Structure

### 1. **gameData.test.js** (10 tests)
Tests game constants and utility functions:
- `formatNumber()` - Number formatting (1K, 1M, 1B)
- Resource definitions validation
- Node structure integrity
- Node dependency graph validation
- Tier-based progression checks

### 2. **layoutEngine.test.js** (14 tests)
Tests dynamic skill tree layout algorithm:
- Tree structure building from node dependencies
- Angle calculations for radial layout
- Node positioning (tier-based spacing)
- Collision detection and resolution
- Parent-child relationship management
- Angle wraparound handling

### 3. **components.test.js** (21 tests)
Tests all Vue components:

**ResourceBar Component:**
- Renders with icon, name, amount, rate
- Formats large numbers correctly
- Visibility toggling
- Default values

**ActionButton Component:**
- Renders button elements (icon, text, value)
- Emits click events
- Disabled state handling
- Locked state styling
- Prevents clicks when disabled

**AutomationItem Component:**
- Displays automation status
- Capitalizes resource names
- Formats large rates
- Active state styling

**SkillNode Component:**
- Renders node icon and name
- Position styling (x, y coordinates)
- State classes (unlocked, available, locked, selected)
- Tier-based styling
- Click event emission with node ID

### 4. **app.test.js** (29 tests)
Tests core game logic and state management:

**Computed Values:**
- energyPerClick calculation
- Effect stacking from multiple nodes
- Resource rate calculations with multipliers

**Action Methods:**
- generateEnergy - adds energy per click
- processData - costs energy, requires unlock, produces data

**Node Unlocking:**
- Requirement validation
- Cost affordability checks
- Resource deduction
- Unlocked set management
- Automation effect application

**Node Availability:**
- Available when requirements met
- Not available when locked
- Not available when already unlocked

**Game Loop:**
- Passive resource generation
- Delta time scaling
- Total resources tracking

**Save/Load System:**
- State serialization
- Unlocked nodes Set conversion
- Offline progress calculation
- Offline gains with automation
- 24-hour offline cap

**Statistics:**
- Node count tracking
- Total energy/data tracking

### 5. **integration.test.js** (21 tests)
Tests complete game progression flows:

**Early Game Progression:**
- Starting state validation
- Manual energy generation
- First node unlock (energy_boost)
- Effect application (energyPerClick increase)
- Data processing unlock
- Data generation mechanics

**Mid Game Progression:**
- Generator unlock with multiple resources
- Automation activation
- Passive resource generation
- Time-based scaling

**Resource Management:**
- Current vs total resource tracking
- Resource spending doesn't affect totals
- Independent resource type tracking

**Node Dependencies:**
- Tier requirements enforcement
- Multi-node unlock chains
- Dependency graph validation

**Complete Progression Path:**
- Full early-to-mid game simulation
- 8-phase progression:
  1. Manual energy clicks
  2. Energy boost unlock
  3. Efficient generation
  4. Data processing unlock
  5. Data generation
  6. Resource accumulation
  7. Automation unlock
  8. Passive generation verification

## Running Tests

```bash
# Run all tests once
npm test

# Watch mode (re-run on file changes)
npm run test:watch

# Coverage report
npm run test:coverage

# UI mode
npm run test:ui
```

## Test Framework

- **Vitest** - Fast unit test framework
- **@vue/test-utils** - Vue component testing utilities
- **happy-dom** - Lightweight DOM environment

## Coverage Areas

✅ Game data structures and validation  
✅ Layout algorithm and positioning  
✅ All Vue components (props, events, computed, rendering)  
✅ Game state management (resources, automations, unlocked nodes)  
✅ Core mechanics (energy generation, data processing, node unlocking)  
✅ Computed values and multipliers  
✅ Save/load system and offline progress  
✅ Complete progression flows  
✅ Node dependency chains  
✅ Resource management  

## Test Quality Metrics

- **95 tests** covering all major features
- Tests isolated with `beforeEach` setup
- Mock implementations for unit tests
- Integration tests for full game flows
- Edge cases tested (empty states, boundary conditions)
- State validation at each progression step

## CI/CD Integration

Tests ready for:
- GitHub Actions
- GitLab CI
- Bitrise (see bitrise.instructions.md)
- Any CI/CD platform supporting Node.js

Example workflow:
```yaml
- name: Install dependencies
  run: npm ci
- name: Run tests
  run: npm test
- name: Generate coverage
  run: npm run test:coverage
```
