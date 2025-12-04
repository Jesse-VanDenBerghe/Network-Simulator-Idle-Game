// TreeBuilder: Constructs dependency tree structure from nodes
// Single Responsibility: Build tree structure and assign branches
// ==========================================================

import type { Node, NodeRequirement } from '@network-simulator/shared/types/node';

/**
 * Extract node ID from a requirement (supports both 'node_id' and { id: 'node_id', level: n })
 */
function getReqId(req: NodeRequirement): string {
    return typeof req === 'string' ? req : req.id;
}

/**
 * Tree structure for layout calculations
 */
export interface DependencyTree {
    nodesByTier: Record<number, string[]>;
    children: Record<string, string[]>;
    parents: Record<string, string[]>;
    maxTier: number;
    descendants: Record<string, number>;
}

/**
 * Extended node with layout metadata
 */
export interface LayoutNode extends Node {
    branchAngle?: number;
    depth?: number;
    depthInfo?: { depth: number; sameTierHops: number };
}

/**
 * TreeBuilder class - constructs dependency graph and assigns branch angles
 */
export class TreeBuilder {
    buildTree(nodes: Record<string, LayoutNode>): DependencyTree {
        const tree: DependencyTree = {
            nodesByTier: {},
            children: {},
            parents: {},
            maxTier: 0,
            descendants: {}
        };

        // Group nodes by tier and initialize parent/child relationships
        Object.values(nodes).forEach(node => {
            if (!tree.nodesByTier[node.tier]) {
                tree.nodesByTier[node.tier] = [];
            }
            tree.nodesByTier[node.tier].push(node.id);
            tree.maxTier = Math.max(tree.maxTier, node.tier);
            tree.parents[node.id] = (node.requires || []).map(getReqId);
            tree.children[node.id] = [];
        });

        // Build children arrays
        Object.values(nodes).forEach(node => {
            node.requires.forEach(req => {
                const parentId = getReqId(req);
                if (tree.children[parentId]) {
                    tree.children[parentId].push(node.id);
                }
            });
        });

        // Calculate descendant counts
        Object.keys(nodes).forEach(nodeId => {
            tree.descendants[nodeId] = this.countDescendants(nodeId, tree, nodes);
        });

        return tree;
    }

    countDescendants(
        nodeId: string,
        tree: DependencyTree,
        nodes: Record<string, LayoutNode>,
        visited = new Set<string>()
    ): number {
        if (visited.has(nodeId)) return 0;
        visited.add(nodeId);
        
        const children = tree.children[nodeId] || [];
        let count = children.length;
        children.forEach(childId => {
            count += this.countDescendants(childId, tree, nodes, visited);
        });
        return count;
    }

    assignBranches(nodes: Record<string, LayoutNode>, tree: DependencyTree): void {
        // Assign old_shed as root
        if (nodes.old_shed) {
            nodes.old_shed.branch = 'old_shed' as any;
            nodes.old_shed.branchAngle = 0;
        }

        // Assign tier 1 nodes evenly around circle
        const tier1Nodes = tree.nodesByTier[1] || [];
        const tier1Count = tier1Nodes.length;
        
        tier1Nodes.forEach((nodeId, index) => {
            const angle = -Math.PI / 2 + (2 * Math.PI * index / tier1Count);
            nodes[nodeId].branch = nodeId as any;
            nodes[nodeId].branchAngle = angle;
        });

        // Assign branches to higher tier nodes based on parents
        for (let tier = 2; tier <= tree.maxTier; tier++) {
            const tierNodes = tree.nodesByTier[tier] || [];
            
            tierNodes.forEach(nodeId => {
                const node = nodes[nodeId];
                const parents = node.requires.map(req => nodes[getReqId(req)]).filter(p => p);
                
                if (parents.length === 0) return;

                const parentAngles = parents.map(p => p.branchAngle).filter(a => a !== undefined) as number[];
                
                if (parentAngles.length > 0) {
                    node.branchAngle = this.averageAngle(parentAngles);
                    node.branch = parents[0].branch;
                }
            });
        }
    }

    averageAngle(angles: number[]): number {
        if (angles.length === 0) return 0;
        if (angles.length === 1) return angles[0];
        
        let sumSin = 0, sumCos = 0;
        angles.forEach(a => {
            sumSin += Math.sin(a);
            sumCos += Math.cos(a);
        });
        
        return Math.atan2(sumSin / angles.length, sumCos / angles.length);
    }
}
