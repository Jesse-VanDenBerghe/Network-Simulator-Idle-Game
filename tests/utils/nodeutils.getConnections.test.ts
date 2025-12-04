import { describe, expect, it } from 'vitest';
import type { Node } from '@/types/node';
import { getConnections } from '@/utils/nodeUtils';

//Helper function to create a node
function createNode(overrides: Partial<Node>): Node {
    return {
        id: '',
        name: '',
        icon: '',
        tier: 0,
        description: '',
        x: 0,
        y: 0,
        branch: 'energy',
        isTierGate: false,
        requires: [],
        costScaling: 1,
        maxLevel: 1,
        effects: {},
        cost: {
            energy: 0,
            data: 0,
        },
        ...overrides,
    };
}

describe('getConnections', () => {
    it('should return empty array for no nodes', () => {
        const connections = getConnections({});
        expect(connections).toEqual([]);
    });

    it('should return empty array for nodes with no requirements', () => {
        const nodes = {
            node1: createNode({ id: 'node1' }),
            node2: createNode({ id: 'node2' }),
        };
        const connections = getConnections(nodes);
        expect(connections).toEqual([]);
    });

    it('should return connection for simple requirement', () => {
        const nodes = {
            node1: createNode({ id: 'node1', x: 10, y: 20 }),
            node2: createNode({ id: 'node2', x: 30, y: 40, requires: ['node1'] }),
        };
        const connections = getConnections(nodes);
        expect(connections).toMatchObject([
            {
                from: 'node1',
                to: 'node2'
            }
        ]);
    });

    it('should skip connection when required node does not exist', () => {
        const nodes = {
            node1: createNode({ id: 'node1', requires: ['nonexistent'] }),
        };
        const connections = getConnections(nodes);
        expect(connections).toEqual([]);
    });

    it('should skip connection when parent is a tier gate', () => {
        const nodes = {
            gate: createNode({ id: 'gate', isTierGate: true }),
            child: createNode({ id: 'child', requires: ['gate'] }),
        };
        const connections = getConnections(nodes);
        expect(connections).toEqual([]);
    });

    it('should skip connection when nodes are in different branches', () => {
        const nodes = {
            energyNode: createNode({ id: 'energyNode', branch: 'energy' }),
            computerNode: createNode({ id: 'computerNode', branch: 'computer', requires: ['energyNode'] }),
        };
        const connections = getConnections(nodes);
        expect(connections).toEqual([]);
    });

    it('should handle object-style requirements with level', () => {
        const nodes = {
            node1: createNode({ id: 'node1' }),
            node2: createNode({ id: 'node2', requires: [{ id: 'node1', level: 3 }] }),
        };
        const connections = getConnections(nodes);
        expect(connections).toHaveLength(1);
        expect(connections[0]).toMatchObject({
            from: 'node1',
            to: 'node2'
        });
    });

    it('should create multiple connections for multiple requirements', () => {
        const nodes = {
            nodeA: createNode({ id: 'nodeA' }),
            nodeB: createNode({ id: 'nodeB' }),
            nodeC: createNode({ id: 'nodeC', requires: ['nodeA', 'nodeB'] }),
        };
        const connections = getConnections(nodes);
        expect(connections).toHaveLength(2);
        expect(connections.map(c => c.from)).toContain('nodeA');
        expect(connections.map(c => c.from)).toContain('nodeB');
        expect(connections.every(c => c.to === 'nodeC')).toBe(true);
    });

    it('should handle undefined x/y coordinates', () => {
        const nodes = {
            node1: createNode({ id: 'node1', x: undefined, y: undefined }),
            node2: createNode({ id: 'node2', requires: ['node1'] }),
        };
        const connections = getConnections(nodes);
        expect(connections).toHaveLength(1);
        expect(connections[0]).toMatchObject({
            from: 'node1',
            to: 'node2'
        });
    });

    it('should handle complex dependency chain', () => {
        const nodes = {
            node1: createNode({ id: 'node1' }),
            node2: createNode({ id: 'node2', requires: ['node1'] }),
            node3: createNode({ id: 'node3', requires: ['node2'] }),
            node4: createNode({ id: 'node4', requires: ['node2', 'node3'] }),
        };
        const connections = getConnections(nodes);
        expect(connections).toHaveLength(4);
        expect(connections.filter(c => c.from === 'node1')).toHaveLength(1);
        expect(connections.filter(c => c.from === 'node2')).toHaveLength(2);
        expect(connections.filter(c => c.from === 'node3')).toHaveLength(1);
    });
});