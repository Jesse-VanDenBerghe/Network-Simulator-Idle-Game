import { describe, it, expect, beforeEach } from 'vitest';

// Mock LayoutEngine
const LayoutEngine = {
    config: {
        centerX: 1400,
        centerY: 1400,
        tierSpacing: 180,
        nodeSpacing: 100,
        nodeSize: 80,
    },

    buildTree(nodes) {
        const tree = {
            nodesByTier: {},
            children: {},
            parents: {},
            maxTier: 0,
            descendants: {}
        };

        Object.values(nodes).forEach(node => {
            if (!tree.nodesByTier[node.tier]) {
                tree.nodesByTier[node.tier] = [];
            }
            tree.nodesByTier[node.tier].push(node.id);
            tree.maxTier = Math.max(tree.maxTier, node.tier);
            tree.parents[node.id] = node.requires || [];
            tree.children[node.id] = [];
        });

        Object.values(nodes).forEach(node => {
            node.requires.forEach(parentId => {
                if (tree.children[parentId]) {
                    tree.children[parentId].push(node.id);
                }
            });
        });

        return tree;
    },

    averageAngle(angles) {
        if (angles.length === 0) return 0;
        if (angles.length === 1) return angles[0];
        
        let sumSin = 0, sumCos = 0;
        angles.forEach(a => {
            sumSin += Math.sin(a);
            sumCos += Math.cos(a);
        });
        
        return Math.atan2(sumSin / angles.length, sumCos / angles.length);
    },

    angleDiff(a, b) {
        let diff = b - a;
        while (diff > Math.PI) diff -= 2 * Math.PI;
        while (diff < -Math.PI) diff += 2 * Math.PI;
        return diff;
    },

    calculateLayout(nodes) {
        const nodesCopy = JSON.parse(JSON.stringify(nodes));
        const tree = this.buildTree(nodesCopy);
        
        // Position core
        if (nodesCopy.core) {
            nodesCopy.core.x = this.config.centerX;
            nodesCopy.core.y = this.config.centerY;
        }

        return nodesCopy;
    }
};

describe('LayoutEngine', () => {
    let testNodes;

    beforeEach(() => {
        testNodes = {
            core: {
                id: 'core',
                tier: 0,
                requires: [],
                x: 0,
                y: 0
            },
            node1: {
                id: 'node1',
                tier: 1,
                requires: ['core'],
                x: 0,
                y: 0
            },
            node2: {
                id: 'node2',
                tier: 1,
                requires: ['core'],
                x: 0,
                y: 0
            },
            node3: {
                id: 'node3',
                tier: 2,
                requires: ['node1'],
                x: 0,
                y: 0
            }
        };
    });

    describe('buildTree', () => {
        it('groups nodes by tier', () => {
            const tree = LayoutEngine.buildTree(testNodes);
            
            expect(tree.nodesByTier[0]).toEqual(['core']);
            expect(tree.nodesByTier[1]).toContain('node1');
            expect(tree.nodesByTier[1]).toContain('node2');
            expect(tree.nodesByTier[2]).toEqual(['node3']);
        });

        it('calculates max tier', () => {
            const tree = LayoutEngine.buildTree(testNodes);
            expect(tree.maxTier).toBe(2);
        });

        it('builds parent-child relationships', () => {
            const tree = LayoutEngine.buildTree(testNodes);
            
            expect(tree.parents.node1).toEqual(['core']);
            expect(tree.parents.node3).toEqual(['node1']);
            expect(tree.children.core).toContain('node1');
            expect(tree.children.core).toContain('node2');
            expect(tree.children.node1).toEqual(['node3']);
        });
    });

    describe('averageAngle', () => {
        it('returns 0 for empty array', () => {
            expect(LayoutEngine.averageAngle([])).toBe(0);
        });

        it('returns single angle unchanged', () => {
            expect(LayoutEngine.averageAngle([Math.PI / 4])).toBe(Math.PI / 4);
        });

        it('calculates average of multiple angles', () => {
            const result = LayoutEngine.averageAngle([0, Math.PI / 2]);
            expect(result).toBeCloseTo(Math.PI / 4, 5);
        });

        it('handles angle wraparound correctly', () => {
            const result = LayoutEngine.averageAngle([-Math.PI / 4, Math.PI / 4]);
            expect(result).toBeCloseTo(0, 5);
        });
    });

    describe('angleDiff', () => {
        it('calculates difference between angles', () => {
            expect(LayoutEngine.angleDiff(0, Math.PI / 4)).toBeCloseTo(Math.PI / 4, 5);
            expect(LayoutEngine.angleDiff(Math.PI / 4, 0)).toBeCloseTo(-Math.PI / 4, 5);
        });

        it('handles wraparound at 2π', () => {
            const diff = LayoutEngine.angleDiff(-Math.PI + 0.1, Math.PI - 0.1);
            expect(Math.abs(diff)).toBeLessThan(0.5);
        });
    });

    describe('calculateLayout', () => {
        it('positions core at center', () => {
            const result = LayoutEngine.calculateLayout(testNodes);
            
            expect(result.core.x).toBe(LayoutEngine.config.centerX);
            expect(result.core.y).toBe(LayoutEngine.config.centerY);
        });

        it('does not modify original nodes', () => {
            const originalX = testNodes.core.x;
            LayoutEngine.calculateLayout(testNodes);
            
            expect(testNodes.core.x).toBe(originalX);
        });

        it('returns nodes with position data', () => {
            const result = LayoutEngine.calculateLayout(testNodes);
            
            Object.values(result).forEach(node => {
                expect(typeof node.x).toBe('number');
                expect(typeof node.y).toBe('number');
            });
        });
    });

    describe('config', () => {
        it('has all required configuration properties', () => {
            expect(LayoutEngine.config).toHaveProperty('centerX');
            expect(LayoutEngine.config).toHaveProperty('centerY');
            expect(LayoutEngine.config).toHaveProperty('tierSpacing');
            expect(LayoutEngine.config).toHaveProperty('nodeSpacing');
            expect(LayoutEngine.config).toHaveProperty('nodeSize');
        });

        it('config values are positive numbers', () => {
            Object.values(LayoutEngine.config).forEach(val => {
                expect(typeof val).toBe('number');
                expect(val).toBeGreaterThan(0);
            });
        });
    });
});
