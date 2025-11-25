import { describe, it, expect, beforeEach } from 'vitest';

// Integration tests for game progression flow
describe('Game Integration Tests', () => {
    let game;

    beforeEach(() => {
        // Initialize full game state
        game = {
            resources: { energy: 0, data: 0, bandwidth: 0 },
            totalResources: { energy: 0, data: 0, bandwidth: 0 },
            automations: { energy: 0, data: 0, bandwidth: 0 },
            unlockedNodes: new Set(['core']),
            computedValues: {
                energyPerClick: 1,
                dataPerClick: 1,
                dataMultiplier: 1,
                allRatesMultiplier: 1
            }
        };

        // Mock node definitions
        game.nodes = {
            core: {
                id: 'core',
                tier: 0,
                requires: [],
                cost: {},
                effects: {}
            },
            energy_boost: {
                id: 'energy_boost',
                tier: 1,
                requires: ['core'],
                cost: { energy: 10 },
                effects: { energyPerClick: 1 }
            },
            data_processing: {
                id: 'data_processing',
                tier: 1,
                requires: ['core'],
                cost: { energy: 25 },
                effects: { unlockDataProcessing: true }
            },
            generator_mk1: {
                id: 'generator_mk1',
                tier: 2,
                requires: ['energy_boost'],
                cost: { energy: 50, data: 5 },
                effects: { automation: { resource: 'energy', rate: 1 } }
            },
            bandwidth_unlock: {
                id: 'bandwidth_unlock',
                tier: 3,
                requires: ['generator_mk1'],
                cost: { energy: 500, data: 100 },
                effects: {
                    unlockBandwidth: true,
                    automation: { resource: 'bandwidth', rate: 0.5 }
                }
            }
        };

        // Helper methods
        game.generateEnergy = function() {
            const amount = this.computedValues.energyPerClick;
            this.resources.energy += amount;
            this.totalResources.energy += amount;
        };

        game.processData = function() {
            if (!this.unlockedNodes.has('data_processing')) return false;
            if (this.resources.energy < 5) return false;
            
            this.resources.energy -= 5;
            const dataGain = Math.floor(
                this.computedValues.dataPerClick * this.computedValues.dataMultiplier
            );
            this.resources.data += dataGain;
            this.totalResources.data += dataGain;
            return true;
        };

        game.unlockNode = function(nodeId) {
            const node = this.nodes[nodeId];
            if (!node) return false;

            // Check requirements
            const requirementsMet = node.requires.every(reqId => 
                this.unlockedNodes.has(reqId)
            );
            if (!requirementsMet) return false;

            // Check cost
            for (const [resource, amount] of Object.entries(node.cost)) {
                if (this.resources[resource] < amount) return false;
            }

            // Deduct costs
            for (const [resource, amount] of Object.entries(node.cost)) {
                this.resources[resource] -= amount;
            }

            // Unlock
            this.unlockedNodes.add(nodeId);

            // Apply effects
            if (node.effects.energyPerClick) {
                this.computedValues.energyPerClick += node.effects.energyPerClick;
            }
            if (node.effects.dataPerClick) {
                this.computedValues.dataPerClick += node.effects.dataPerClick;
            }
            if (node.effects.automation) {
                this.automations[node.effects.automation.resource] += 
                    node.effects.automation.rate;
            }

            return true;
        };

        game.tick = function(deltaSeconds) {
            // Apply passive generation
            this.resources.energy += this.automations.energy * 
                this.computedValues.allRatesMultiplier * deltaSeconds;
            this.resources.data += this.automations.data * 
                this.computedValues.allRatesMultiplier * 
                this.computedValues.dataMultiplier * deltaSeconds;
            this.resources.bandwidth += this.automations.bandwidth * 
                this.computedValues.allRatesMultiplier * deltaSeconds;

            this.totalResources.energy += this.automations.energy * 
                this.computedValues.allRatesMultiplier * deltaSeconds;
            this.totalResources.data += this.automations.data * 
                this.computedValues.allRatesMultiplier * 
                this.computedValues.dataMultiplier * deltaSeconds;
            this.totalResources.bandwidth += this.automations.bandwidth * 
                this.computedValues.allRatesMultiplier * deltaSeconds;
        };
    });

    describe('Early Game Progression', () => {
        it('starts with core unlocked and zero resources', () => {
            expect(game.unlockedNodes.has('core')).toBe(true);
            expect(game.resources.energy).toBe(0);
            expect(game.resources.data).toBe(0);
        });

        it('can generate energy manually', () => {
            game.generateEnergy();
            expect(game.resources.energy).toBe(1);
        });

        it('accumulates energy with multiple clicks', () => {
            for (let i = 0; i < 15; i++) {
                game.generateEnergy();
            }
            expect(game.resources.energy).toBe(15);
        });

        it('can unlock energy_boost with 10 energy', () => {
            // Generate 10 energy
            for (let i = 0; i < 10; i++) {
                game.generateEnergy();
            }

            const unlocked = game.unlockNode('energy_boost');
            expect(unlocked).toBe(true);
            expect(game.unlockedNodes.has('energy_boost')).toBe(true);
            expect(game.resources.energy).toBe(0);
        });

        it('energy_boost increases energyPerClick', () => {
            for (let i = 0; i < 10; i++) {
                game.generateEnergy();
            }
            game.unlockNode('energy_boost');

            expect(game.computedValues.energyPerClick).toBe(2);

            game.generateEnergy();
            expect(game.resources.energy).toBe(2);
        });

        it('cannot process data before unlocking data_processing', () => {
            game.resources.energy = 10;
            const result = game.processData();
            expect(result).toBe(false);
        });

        it('can unlock data_processing with 25 energy', () => {
            for (let i = 0; i < 25; i++) {
                game.generateEnergy();
            }

            const unlocked = game.unlockNode('data_processing');
            expect(unlocked).toBe(true);
            expect(game.unlockedNodes.has('data_processing')).toBe(true);
        });

        it('can process data after unlocking data_processing', () => {
            // Unlock data processing
            for (let i = 0; i < 25; i++) {
                game.generateEnergy();
            }
            game.unlockNode('data_processing');

            // Generate more energy and process data
            for (let i = 0; i < 10; i++) {
                game.generateEnergy();
            }
            const result = game.processData();

            expect(result).toBe(true);
            expect(game.resources.data).toBe(1);
            expect(game.resources.energy).toBe(5);
        });
    });

    describe('Mid Game Progression', () => {
        beforeEach(() => {
            // Fast forward to mid-game state
            game.resources.energy = 60;
            game.resources.data = 10;
            game.unlockedNodes.add('energy_boost');
            game.unlockedNodes.add('data_processing');
            game.computedValues.energyPerClick = 2;
        });

        it('can unlock generator_mk1 with resources', () => {
            const unlocked = game.unlockNode('generator_mk1');
            expect(unlocked).toBe(true);
            expect(game.unlockedNodes.has('generator_mk1')).toBe(true);
        });

        it('generator_mk1 adds automation', () => {
            game.unlockNode('generator_mk1');
            expect(game.automations.energy).toBe(1);
        });

        it('automation generates passive resources', () => {
            game.unlockNode('generator_mk1');
            game.tick(1); // 1 second

            expect(game.resources.energy).toBeGreaterThan(10);
        });

        it('automation scales with time', () => {
            game.unlockNode('generator_mk1');
            game.tick(10); // 10 seconds

            expect(game.resources.energy).toBe(20); // 10 left + 10 generated
        });

        it('cannot unlock bandwidth_unlock without enough resources', () => {
            const unlocked = game.unlockNode('bandwidth_unlock');
            expect(unlocked).toBe(false);
        });

        it('cannot unlock bandwidth_unlock without generator_mk1', () => {
            game.resources.energy = 500;
            game.resources.data = 100;
            const unlocked = game.unlockNode('bandwidth_unlock');
            expect(unlocked).toBe(false);
        });
    });

    describe('Resource Management', () => {
        it('tracks total resources separately from current', () => {
            game.generateEnergy();
            game.generateEnergy();

            expect(game.resources.energy).toBe(2);
            expect(game.totalResources.energy).toBe(2);

            game.resources.energy -= 1; // Spend

            expect(game.resources.energy).toBe(1);
            expect(game.totalResources.energy).toBe(2);
        });

        it('total resources increase but never decrease', () => {
            game.resources.energy = 100;
            game.totalResources.energy = 100;

            // Spend all energy
            game.resources.energy = 0;

            expect(game.totalResources.energy).toBe(100);
        });

        it('multiple resource types are tracked independently', () => {
            game.resources.energy = 50;
            game.resources.data = 20;
            game.totalResources.energy = 100;
            game.totalResources.data = 40;

            expect(game.resources.energy).toBe(50);
            expect(game.resources.data).toBe(20);
            expect(game.totalResources.energy).toBe(100);
            expect(game.totalResources.data).toBe(40);
        });
    });

    describe('Node Dependencies', () => {
        it('enforces tier 1 requires core', () => {
            game.unlockedNodes.clear();
            const unlocked = game.unlockNode('energy_boost');
            expect(unlocked).toBe(false);
        });

        it('enforces tier 2 requires tier 1', () => {
            game.resources.energy = 100;
            game.resources.data = 10;
            const unlocked = game.unlockNode('generator_mk1');
            expect(unlocked).toBe(false);

            game.unlockedNodes.add('energy_boost');
            const nowUnlocked = game.unlockNode('generator_mk1');
            expect(nowUnlocked).toBe(true);
        });

        it('multiple nodes can be unlocked in order', () => {
            // Setup resources
            game.resources.energy = 1000;
            game.resources.data = 100;

            // Unlock chain
            game.unlockNode('energy_boost');
            expect(game.unlockedNodes.size).toBe(2);

            game.unlockNode('data_processing');
            expect(game.unlockedNodes.size).toBe(3);

            game.unlockNode('generator_mk1');
            expect(game.unlockedNodes.size).toBe(4);
        });
    });

    describe('Complete Progression Path', () => {
        it('simulates full early to mid game progression', () => {
            // Phase 1: Manual energy generation
            for (let i = 0; i < 10; i++) {
                game.generateEnergy();
            }
            expect(game.resources.energy).toBe(10);

            // Phase 2: Unlock energy boost
            game.unlockNode('energy_boost');
            expect(game.computedValues.energyPerClick).toBe(2);

            // Phase 3: Generate more efficiently (1+25 = 26)
            for (let i = 0; i < 13; i++) {
                game.generateEnergy(); // +2 each = 26
            }
            expect(game.resources.energy).toBe(26);

            // Phase 4: Unlock data processing (costs 25, leaves 1)
            game.unlockNode('data_processing');
            expect(game.unlockedNodes.has('data_processing')).toBe(true);
            expect(game.resources.energy).toBe(1);

            // Phase 5: Generate data
            for (let i = 0; i < 13; i++) {
                game.generateEnergy(); // +2 each = 26 total, 27 energy now
            }
            game.processData(); // 27-5=22, 1 data
            game.processData(); // 22-5=17, 2 data
            game.processData(); // 17-5=12, 3 data
            game.processData(); // 12-5=7, 4 data
            game.processData(); // 7-5=2, 5 data
            expect(game.resources.data).toBe(5);
            expect(game.resources.energy).toBe(2);

            // Phase 6: Build up for generator (need 50 energy, 5 data - have 2, 5)
            for (let i = 0; i < 24; i++) {
                game.generateEnergy(); // +2 each = 48, total = 50
            }
            expect(game.resources.energy).toBe(50);
            expect(game.resources.data).toBe(5);

            // Phase 7: Unlock automation (costs 50 energy, 5 data, leaves 0 energy, 0 data)
            const unlocked = game.unlockNode('generator_mk1');
            expect(unlocked).toBe(true);
            expect(game.automations.energy).toBe(1);
            expect(game.resources.energy).toBe(0);

            // Phase 8: Passive generation
            game.tick(30); // 30 seconds
            expect(game.resources.energy).toBe(30); // 0 left + 30 generated
        });
    });
});
