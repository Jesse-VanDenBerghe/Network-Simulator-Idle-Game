// CollisionResolver: Resolves node collisions using spatial partitioning
// Single Responsibility: Collision detection and resolution only
// Complexity: O(n*k) where k = avg nodes per grid cell (instead of O(n²))
// ==========================================================

import type { LayoutNode } from './TreeBuilder';
import type { LayoutConfig } from './PositionCalculator';

/**
 * CollisionResolver class - resolves overlapping nodes using spatial grid
 */
export class CollisionResolver {
    constructor(private config: LayoutConfig) {}

    resolveCollisions(nodes: Record<string, LayoutNode>): void {
        const nodeList = Object.values(nodes);
        const minDistance = this.config.nodeSpacing;
        const cellSize = minDistance * 2;
        const iterations = 15;

        for (let iter = 0; iter < iterations; iter++) {
            let maxOverlap = 0;

            // Step 1: Partition nodes into grid cells - O(n)
            const grid = this.buildSpatialGrid(nodeList, cellSize);

            // Step 2: Check collisions only within & adjacent cells - O(n·k)
            nodeList.forEach(nodeA => {
                const cellKey = this.getGridCellKey(nodeA.x!, nodeA.y!, cellSize);
                const [cx, cy] = cellKey.split(',').map(Number);
                
                // Check current cell and 8 adjacent cells
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        const adjKey = `${cx + dx},${cy + dy}`;
                        const cellNodes = grid.get(adjKey) || [];
                        
                        cellNodes.forEach(nodeB => {
                            // Avoid duplicate checks (only process if nodeB comes after nodeA)
                            if (nodeA.id >= nodeB.id) return;
                            
                            const dx = nodeB.x! - nodeA.x!;
                            const dy = nodeB.y! - nodeA.y!;
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            
                            if (distance < minDistance && distance > 0) {
                                const overlap = minDistance - distance;
                                maxOverlap = Math.max(maxOverlap, overlap);
                                
                                // Push nodes apart
                                const pushX = (dx / distance) * overlap * 0.5;
                                const pushY = (dy / distance) * overlap * 0.5;
                                
                                // Don't move the old_shed node
                                if (nodeA.id !== 'old_shed') {
                                    nodeA.x! -= pushX;
                                    nodeA.y! -= pushY;
                                }
                                if (nodeB.id !== 'old_shed') {
                                    nodeB.x! += pushX;
                                    nodeB.y! += pushY;
                                }
                            }
                        });
                    }
                }
            });

            // Stop early if no significant overlaps
            if (maxOverlap < 1) break;
        }

        // Round positions
        nodeList.forEach(node => {
            node.x = Math.round(node.x!);
            node.y = Math.round(node.y!);
        });
    }

    buildSpatialGrid(nodeList: LayoutNode[], cellSize: number): Map<string, LayoutNode[]> {
        const grid = new Map<string, LayoutNode[]>();
        
        nodeList.forEach(node => {
            const cellKey = this.getGridCellKey(node.x!, node.y!, cellSize);
            if (!grid.has(cellKey)) {
                grid.set(cellKey, []);
            }
            grid.get(cellKey)!.push(node);
        });
        
        return grid;
    }

    getGridCellKey(x: number, y: number, cellSize: number): string {
        const cellX = Math.floor(x / cellSize);
        const cellY = Math.floor(y / cellSize);
        return `${cellX},${cellY}`;
    }
}
