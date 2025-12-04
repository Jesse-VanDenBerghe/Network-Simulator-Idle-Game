// PositionCalculator: Calculates node positions based on tree structure
// Single Responsibility: Physics-based positioning and depth calculations
// ==========================================================

import type { NodeRequirement } from '@network-simulator/shared/types/node';
import type { LayoutNode } from './TreeBuilder';

/**
 * Extract node ID from a requirement
 */
function getReqId(req: NodeRequirement): string {
    return typeof req === 'string' ? req : req.id;
}

/**
 * Depth information for radius calculation
 */
export interface DepthInfo {
    depth: number;
    sameTierHops: number;
}

/**
 * Layout configuration
 */
export interface LayoutConfig {
    centerX: number;
    centerY: number;
    tierSpacing: number;
    sameTierOffset: number;
    nodeSpacing: number;
    nodeSize: number;
}

/**
 * Parent group for positioning
 */
interface ParentGroup {
    parentId: string;
    nodes: string[];
}

/**
 * PositionCalculator class - calculates node positions using radial layout
 */
export class PositionCalculator {
    constructor(private config: LayoutConfig) {}

    /**
     * Calculate the depth of a node from tier 1 (how many parent hops)
     * Returns an object with depth count and same-tier hops for radius calculation
     */
    calculateDepth(
        nodeId: string,
        nodes: Record<string, LayoutNode>,
        cache: Record<string, DepthInfo> = {}
    ): DepthInfo {
        if (cache[nodeId] !== undefined) return cache[nodeId];
        
        const node = nodes[nodeId];
        if (!node) return { depth: 0, sameTierHops: 0 };
        if (node.tier === 0) {
            cache[nodeId] = { depth: 0, sameTierHops: 0 };
            return cache[nodeId];
        }
        if (node.tier === 1) {
            cache[nodeId] = { depth: 1, sameTierHops: 0 };
            return cache[nodeId];
        }
        
        // Find parent with max depth
        const parents = (node.requires || []).map(req => nodes[getReqId(req)]).filter(p => p);
        if (parents.length === 0) {
            cache[nodeId] = { depth: node.tier, sameTierHops: 0 };
            return cache[nodeId];
        }
        
        const parentDepths = parents.map(parent => this.calculateDepth(parent.id, nodes, cache));
        const maxParentDepth = Math.max(...parentDepths.map(d => d.depth));
        const parentWithMaxDepth = parents.find((_, i) => parentDepths[i].depth === maxParentDepth);
        const parentDepthInfo = parentDepths[parents.indexOf(parentWithMaxDepth!)];
        
        // Check if this is a same-tier hop
        const isSameTierHop = parentWithMaxDepth && parentWithMaxDepth.tier === node.tier;
        
        cache[nodeId] = {
            depth: maxParentDepth + 1,
            sameTierHops: parentDepthInfo.sameTierHops + (isSameTierHop ? 1 : 0)
        };
        return cache[nodeId];
    }

    calculateRadius(depthInfo: DepthInfo): number {
        const { tierSpacing, sameTierOffset } = this.config;
        const effectiveDepth = depthInfo.depth - depthInfo.sameTierHops;
        return effectiveDepth * tierSpacing + depthInfo.sameTierHops * sameTierOffset;
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

    /**
     * Calculate positions for all nodes
     * Uses depth (parent hops) for radius, with reduced spacing for same-tier hops
     */
    calculatePositions(nodes: Record<string, LayoutNode>): void {
        const { centerX, centerY, tierSpacing } = this.config;

        // Position old_shed at center
        if (nodes.old_shed) {
            nodes.old_shed.x = centerX;
            nodes.old_shed.y = centerY;
        }

        // Calculate depth info for all nodes (based on parent chain, not tier)
        const depthCache: Record<string, DepthInfo> = {};
        Object.keys(nodes).forEach(nodeId => {
            const depthInfo = this.calculateDepth(nodeId, nodes, depthCache);
            nodes[nodeId].depthInfo = depthInfo;
            nodes[nodeId].depth = depthInfo.depth;
        });

        // Find max depth
        const maxDepth = Math.max(...Object.values(nodes).map(n => n.depth || 0));

        // Position depth 1 nodes (tier 1) evenly around the circle using pre-assigned angles
        const depth1Nodes = Object.values(nodes).filter(n => n.depth === 1);
        const radius1 = tierSpacing;
        depth1Nodes.forEach(node => {
            node.x = centerX + Math.cos(node.branchAngle!) * radius1;
            node.y = centerY + Math.sin(node.branchAngle!) * radius1;
        });

        // Position nodes at depth 2+ by grouping under parents
        for (let depth = 2; depth <= maxDepth; depth++) {
            const depthNodes = Object.values(nodes).filter(n => n.depth === depth).map(n => n.id);
            if (depthNodes.length === 0) continue;
            
            // Separate nodes with single parent vs multiple parents
            const singleParentNodes = depthNodes.filter(id => (nodes[id].requires || []).length === 1);
            const multiParentNodes = depthNodes.filter(id => (nodes[id].requires || []).length > 1);
            
            // Multi-parent nodes: use their pre-calculated averaged angle and individual radius
            multiParentNodes.forEach(nodeId => {
                const node = nodes[nodeId];
                const radius = this.calculateRadius(node.depthInfo!);
                node.x = centerX + Math.cos(node.branchAngle!) * radius;
                node.y = centerY + Math.sin(node.branchAngle!) * radius;
            });
            
            // Single-parent nodes: group by parent and spread symmetrically
            const parentGroups = this.groupByParent(singleParentNodes, nodes);
            
            // Position each parent group symmetrically
            parentGroups.forEach(group => {
                const parent = nodes[group.parentId];
                const parentAngle = parent ? parent.branchAngle || 0 : 0;
                const siblings = group.nodes;
                const count = siblings.length;
                
                // Calculate angular spread - wider for more siblings, narrower at higher depth
                const spreadPerNode = 0.25 / Math.sqrt(depth);
                
                // Sort siblings for consistent ordering
                siblings.sort((a, b) => a.localeCompare(b));
                
                // Distribute symmetrically around parent angle
                siblings.forEach((nodeId, idx) => {
                    const node = nodes[nodeId];
                    const radius = this.calculateRadius(node.depthInfo!);
                    let nodeAngle = parentAngle;
                    
                    if (count > 1) {
                        const position = idx - (count - 1) / 2;
                        nodeAngle = parentAngle + position * spreadPerNode;
                    }
                    
                    node.branchAngle = nodeAngle;
                    node.x = centerX + Math.cos(nodeAngle) * radius;
                    node.y = centerY + Math.sin(nodeAngle) * radius;
                });
            });
        }

        // Offset for node center (nodes are positioned by top-left corner)
        const halfNode = this.config.nodeSize / 2;
        Object.values(nodes).forEach(node => {
            node.x = Math.round(node.x! - halfNode);
            node.y = Math.round(node.y! - halfNode);
        });
    }

    groupByParent(nodeIds: string[], nodes: Record<string, LayoutNode>): ParentGroup[] {
        const groups: Record<string, ParentGroup> = {};
        
        nodeIds.forEach(nodeId => {
            const node = nodes[nodeId];
            const parentId = node.requires && node.requires.length > 0 ? getReqId(node.requires[0]) : 'old_shed';
            
            if (!groups[parentId]) {
                groups[parentId] = { parentId, nodes: [] };
            }
            groups[parentId].nodes.push(nodeId);
        });
        
        return Object.values(groups);
    }
}
