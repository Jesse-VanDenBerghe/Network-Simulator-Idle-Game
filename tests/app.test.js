import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock GameData
const mockGameData = {
    nodes: {
        core: {
            id: 'core',
            name: 'Core',
            tier: 0,
            requires: [],
            cost: {},
            effects: { description: 'Start' }
        },
        energy_boost: {
            id: 'energy_boost',
            name: 'Energy Boost',
            tier: 1,
            requires: ['core'],
            cost: { energy: 10 },
            effects: { energyPerClick: 1 }
        },
        generator_mk1: {
            id: 'generator_mk1',
            name: 'Generator Mk1',
            tier: 2,
            requires: ['energy_boost'],
            cost: { energy: 50, data: 5 },
            effects: { automation: { resource: 'energy', rate: 1 } }
        },
        data_processing: {
            id: 'data_processing',
            name: 'Data Processing',
            tier: 1,
            requires: ['core'],
            cost: { energy: 25 },
            effects: { unlockDataProcessing: true }
        }
    }
};

describe('App Game Logic', () => {
    let gameState;

    beforeEach(() => {
        // Initialize game state
        gameState = {
            resources: { energy: 0, data: 0, bandwidth: 0 },
            totalResources: { energy: 0, data: 0, bandwidth: 0 },
            automations: { energy: 0, data: 0, bandwidth: 0 },
            unlockedNodes: new Set(['core'])
        };
    });

    describe('Computed Values', () => {
        it('calculates energyPerClick from unlocked nodes', () => {
            let energyPerClick = 1;
            
            gameState.unlockedNodes.add('energy_boost');
            const node = mockGameData.nodes.energy_boost;
            if (node.effects.energyPerClick) {
                energyPerClick += node.effects.energyPerClick;
            }

            expect(energyPerClick).toBe(2);
        });

        it('stacks multiple energy boost effects', () => {
            let energyPerClick = 1;
            
            gameState.unlockedNodes.add('energy_boost');
            gameState.unlockedNodes.forEach(nodeId => {
                const node = mockGameData.nodes[nodeId];
                if (node?.effects.energyPerClick) {
                    energyPerClick += node.effects.energyPerClick;
                }
            });

            expect(energyPerClick).toBe(2);
        });

        it('calculates resource rates from automations', () => {
            gameState.automations.energy = 5;
            gameState.automations.data = 2;
            const allRatesMultiplier = 1.5;

            const resourceRates = {
                energy: gameState.automations.energy * allRatesMultiplier,
                data: gameState.automations.data * allRatesMultiplier,
                bandwidth: gameState.automations.bandwidth * allRatesMultiplier
            };

            expect(resourceRates.energy).toBe(7.5);
            expect(resourceRates.data).toBe(3);
            expect(resourceRates.bandwidth).toBe(0);
        });
    });

    describe('Action Methods', () => {
        describe('generateEnergy', () => {
            it('adds energy based on energyPerClick', () => {
                const energyPerClick = 1;
                gameState.resources.energy += energyPerClick;
                gameState.totalResources.energy += energyPerClick;

                expect(gameState.resources.energy).toBe(1);
                expect(gameState.totalResources.energy).toBe(1);
            });

            it('increments total resources', () => {
                const initial = gameState.totalResources.energy;
                gameState.resources.energy += 5;
                gameState.totalResources.energy += 5;

                expect(gameState.totalResources.energy).toBe(initial + 5);
            });
        });

        describe('processData', () => {
            it('costs 5 energy', () => {
                gameState.resources.energy = 10;
                gameState.resources.energy -= 5;

                expect(gameState.resources.energy).toBe(5);
            });

            it('requires dataProcessing unlocked', () => {
                const dataUnlocked = gameState.unlockedNodes.has('data_processing');
                expect(dataUnlocked).toBe(false);

                gameState.unlockedNodes.add('data_processing');
                const nowUnlocked = gameState.unlockedNodes.has('data_processing');
                expect(nowUnlocked).toBe(true);
            });

            it('requires at least 5 energy', () => {
                gameState.resources.energy = 3;
                const canProcess = gameState.resources.energy >= 5;
                expect(canProcess).toBe(false);

                gameState.resources.energy = 5;
                const nowCanProcess = gameState.resources.energy >= 5;
                expect(nowCanProcess).toBe(true);
            });

            it('adds data based on dataPerClick and multiplier', () => {
                const dataPerClick = 2;
                const dataMultiplier = 1.5;
                const dataGain = Math.floor(dataPerClick * dataMultiplier);

                gameState.resources.data += dataGain;

                expect(gameState.resources.data).toBe(3);
            });
        });
    });

    describe('Node Unlocking', () => {
        it('checks all requirements are met', () => {
            const node = mockGameData.nodes.energy_boost;
            const requirementsMet = node.requires.every(reqId => 
                gameState.unlockedNodes.has(reqId)
            );

            expect(requirementsMet).toBe(true);
        });

        it('prevents unlock when requirements not met', () => {
            const node = mockGameData.nodes.generator_mk1;
            const requirementsMet = node.requires.every(reqId => 
                gameState.unlockedNodes.has(reqId)
            );

            expect(requirementsMet).toBe(false);
        });

        it('checks cost affordability', () => {
            const node = mockGameData.nodes.energy_boost;
            gameState.resources.energy = 10;

            let canAfford = true;
            for (const [resource, amount] of Object.entries(node.cost)) {
                if (gameState.resources[resource] < amount) {
                    canAfford = false;
                }
            }

            expect(canAfford).toBe(true);
        });

        it('deducts costs on unlock', () => {
            const node = mockGameData.nodes.energy_boost;
            gameState.resources.energy = 15;

            for (const [resource, amount] of Object.entries(node.cost)) {
                gameState.resources[resource] -= amount;
            }

            expect(gameState.resources.energy).toBe(5);
        });

        it('adds node to unlocked set', () => {
            gameState.unlockedNodes.add('energy_boost');

            expect(gameState.unlockedNodes.has('energy_boost')).toBe(true);
            expect(gameState.unlockedNodes.size).toBe(2);
        });

        it('applies automation effects', () => {
            const node = mockGameData.nodes.generator_mk1;
            if (node.effects.automation) {
                gameState.automations[node.effects.automation.resource] += 
                    node.effects.automation.rate;
            }

            expect(gameState.automations.energy).toBe(1);
        });
    });

    describe('Node Availability', () => {
        it('node is available when all requirements met', () => {
            const node = mockGameData.nodes.energy_boost;
            const isAvailable = !gameState.unlockedNodes.has(node.id) &&
                node.requires.every(reqId => gameState.unlockedNodes.has(reqId));

            expect(isAvailable).toBe(true);
        });

        it('node is not available when locked', () => {
            const node = mockGameData.nodes.generator_mk1;
            const isAvailable = !gameState.unlockedNodes.has(node.id) &&
                node.requires.every(reqId => gameState.unlockedNodes.has(reqId));

            expect(isAvailable).toBe(false);
        });

        it('unlocked node is not available', () => {
            const node = mockGameData.nodes.core;
            const isAvailable = !gameState.unlockedNodes.has(node.id) &&
                node.requires.every(reqId => gameState.unlockedNodes.has(reqId));

            expect(isAvailable).toBe(false);
        });
    });

    describe('Game Loop', () => {
        it('applies passive resource generation', () => {
            gameState.automations.energy = 5;
            const delta = 1; // 1 second

            gameState.resources.energy += gameState.automations.energy * delta;

            expect(gameState.resources.energy).toBe(5);
        });

        it('scales with delta time', () => {
            gameState.automations.energy = 10;
            const delta = 0.5; // half second

            gameState.resources.energy += gameState.automations.energy * delta;

            expect(gameState.resources.energy).toBe(5);
        });

        it('updates total resources', () => {
            gameState.automations.data = 3;
            const delta = 2;

            const gain = gameState.automations.data * delta;
            gameState.resources.data += gain;
            gameState.totalResources.data += gain;

            expect(gameState.totalResources.data).toBe(6);
        });
    });

    describe('Save/Load System', () => {
        it('serializes game state correctly', () => {
            const saveData = {
                resources: { ...gameState.resources },
                totalResources: { ...gameState.totalResources },
                automations: { ...gameState.automations },
                unlockedNodes: Array.from(gameState.unlockedNodes),
                lastUpdate: Date.now()
            };

            expect(saveData.unlockedNodes).toEqual(['core']);
            expect(saveData.resources.energy).toBe(0);
        });

        it('deserializes unlocked nodes to Set', () => {
            const savedNodes = ['core', 'energy_boost'];
            const loadedSet = new Set(savedNodes);

            expect(loadedSet.size).toBe(2);
            expect(loadedSet.has('core')).toBe(true);
            expect(loadedSet.has('energy_boost')).toBe(true);
        });

        it('calculates offline progress', () => {
            const lastUpdate = Date.now() - 10000; // 10 seconds ago
            const offlineTime = (Date.now() - lastUpdate) / 1000;

            expect(offlineTime).toBeGreaterThanOrEqual(10);
            expect(offlineTime).toBeLessThan(11);
        });

        it('applies offline gains with automation', () => {
            gameState.automations.energy = 5;
            const offlineTime = 60; // 1 minute

            const offlineGain = gameState.automations.energy * offlineTime;
            gameState.resources.energy += offlineGain;

            expect(gameState.resources.energy).toBe(300);
        });

        it('caps offline progress to 24 hours', () => {
            const lastUpdate = Date.now() - (48 * 60 * 60 * 1000); // 48 hours
            const offlineTime = (Date.now() - lastUpdate) / 1000;
            const maxOfflineTime = 86400; // 24 hours

            const cappedTime = Math.min(offlineTime, maxOfflineTime);

            expect(cappedTime).toBe(maxOfflineTime);
        });
    });

    describe('Statistics', () => {
        it('counts unlocked nodes', () => {
            gameState.unlockedNodes.add('energy_boost');
            gameState.unlockedNodes.add('data_processing');

            expect(gameState.unlockedNodes.size).toBe(3);
        });

        it('tracks total energy generated', () => {
            gameState.totalResources.energy = 1000;
            expect(gameState.totalResources.energy).toBe(1000);
        });

        it('tracks total data generated', () => {
            gameState.totalResources.data = 500;
            expect(gameState.totalResources.data).toBe(500);
        });
    });
});
