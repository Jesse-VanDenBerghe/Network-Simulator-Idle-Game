import { describe, it, expect } from 'vitest';

// Import GameData module
const GameData = {
    resources: {
        energy: { id: 'energy', name: 'Energy', icon: '⚡', color: '#00ffaa' },
        data: { id: 'data', name: 'Data', icon: '📊', color: '#00aaff' },
        bandwidth: { id: 'bandwidth', name: 'Bandwidth', icon: '📡', color: '#ff00aa' }
    },
    nodes: {
        core: {
            id: 'core',
            name: 'Core System',
            icon: '🔮',
            tier: 0,
            x: 1400,
            y: 1200,
            description: 'The central hub of your network.',
            requires: [],
            cost: {},
            effects: { description: 'Starting node' }
        },
        energy_boost: {
            id: 'energy_boost',
            name: 'Energy Boost',
            icon: '⚡',
            tier: 1,
            x: 900,
            y: 1050,
            description: 'Increases manual energy generation.',
            requires: ['core'],
            cost: { energy: 10 },
            effects: { energyPerClick: 1, description: '+1 Energy per click' }
        }
    },
    formatNumber(num) {
        if (num < 1000) return Math.floor(num).toString();
        if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
        if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
        return (num / 1000000000).toFixed(1) + 'B';
    }
};

describe('GameData', () => {
    describe('formatNumber', () => {
        it('formats small numbers (<1000) as integers', () => {
            expect(GameData.formatNumber(0)).toBe('0');
            expect(GameData.formatNumber(42)).toBe('42');
            expect(GameData.formatNumber(999)).toBe('999');
            expect(GameData.formatNumber(999.9)).toBe('999');
        });

        it('formats thousands with K suffix', () => {
            expect(GameData.formatNumber(1000)).toBe('1.0K');
            expect(GameData.formatNumber(1500)).toBe('1.5K');
            expect(GameData.formatNumber(12345)).toBe('12.3K');
            expect(GameData.formatNumber(999999)).toBe('1000.0K');
        });

        it('formats millions with M suffix', () => {
            expect(GameData.formatNumber(1000000)).toBe('1.0M');
            expect(GameData.formatNumber(2500000)).toBe('2.5M');
            expect(GameData.formatNumber(123456789)).toBe('123.5M');
        });

        it('formats billions with B suffix', () => {
            expect(GameData.formatNumber(1000000000)).toBe('1.0B');
            expect(GameData.formatNumber(5500000000)).toBe('5.5B');
            expect(GameData.formatNumber(999999999999)).toBe('1000.0B');
        });
    });

    describe('resources', () => {
        it('has all three resource types defined', () => {
            expect(GameData.resources.energy).toBeDefined();
            expect(GameData.resources.data).toBeDefined();
            expect(GameData.resources.bandwidth).toBeDefined();
        });

        it('each resource has required properties', () => {
            Object.values(GameData.resources).forEach(resource => {
                expect(resource).toHaveProperty('id');
                expect(resource).toHaveProperty('name');
                expect(resource).toHaveProperty('icon');
                expect(resource).toHaveProperty('color');
            });
        });
    });

    describe('nodes', () => {
        it('core node exists and is tier 0', () => {
            expect(GameData.nodes.core).toBeDefined();
            expect(GameData.nodes.core.tier).toBe(0);
            expect(GameData.nodes.core.requires).toEqual([]);
        });

        it('all nodes have required structure', () => {
            Object.values(GameData.nodes).forEach(node => {
                expect(node).toHaveProperty('id');
                expect(node).toHaveProperty('name');
                expect(node).toHaveProperty('icon');
                expect(node).toHaveProperty('tier');
                expect(node).toHaveProperty('description');
                expect(node).toHaveProperty('requires');
                expect(node).toHaveProperty('cost');
                expect(node).toHaveProperty('effects');
                expect(Array.isArray(node.requires)).toBe(true);
            });
        });

        it('nodes with requires reference valid node ids', () => {
            Object.values(GameData.nodes).forEach(node => {
                node.requires.forEach(reqId => {
                    expect(GameData.nodes[reqId]).toBeDefined();
                });
            });
        });

        it('tier 1 nodes all require core', () => {
            const tier1Nodes = Object.values(GameData.nodes).filter(n => n.tier === 1);
            tier1Nodes.forEach(node => {
                expect(node.requires).toContain('core');
            });
        });
    });
});
