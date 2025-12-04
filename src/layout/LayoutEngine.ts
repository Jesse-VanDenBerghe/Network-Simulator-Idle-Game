// LayoutEngine: Main orchestrator that composes the three specialized classes
// Maintains original API while using composition internally
// ==========================================================

import { TreeBuilder } from './TreeBuilder';
import { PositionCalculator, type LayoutConfig } from './PositionCalculator';
import { CollisionResolver } from './CollisionResolver';
import type { Node } from 'packages/shared/src/types/node';
import type { LayoutNode } from './TreeBuilder';
import { LAYOUT_CONFIG } from '@/data/constants';

/**
 * GameData interface (minimal for layout purposes)
 */
interface GameData {
    nodes: Record<string, Node>;
}

/**
 * LayoutEngine singleton - orchestrates tree building, positioning, and collision resolution
 */
class LayoutEngineClass {
    private config: LayoutConfig;
    private treeBuilder: TreeBuilder;
    private positionCalculator: PositionCalculator;
    private collisionResolver: CollisionResolver;

    constructor() {
        this.config = {
            centerX: LAYOUT_CONFIG.CENTER_X,
            centerY: LAYOUT_CONFIG.CENTER_Y,
            tierSpacing: LAYOUT_CONFIG.TIER_SPACING,
            sameTierOffset: LAYOUT_CONFIG.SAME_TIER_OFFSET,
            nodeSpacing: LAYOUT_CONFIG.NODE_SPACING,
            nodeSize: LAYOUT_CONFIG.NODE_SIZE,
        };

        this.treeBuilder = new TreeBuilder();
        this.positionCalculator = new PositionCalculator(this.config);
        this.collisionResolver = new CollisionResolver(this.config);
    }

    /**
     * Calculate layout for nodes (returns copy with positions)
     */
    calculateLayout(nodes: Record<string, Node>): Record<string, LayoutNode> {
        const nodesCopy = structuredClone(nodes) as Record<string, LayoutNode>;
        
        const tree = this.treeBuilder.buildTree(nodesCopy);
        this.treeBuilder.assignBranches(nodesCopy, tree);
        this.positionCalculator.calculatePositions(nodesCopy);
        this.collisionResolver.resolveCollisions(nodesCopy);
        
        return nodesCopy;
    }

    /**
     * Apply layout to gameData nodes in-place
     */
    applyLayout(gameData: GameData): GameData {
        const layoutNodes = this.calculateLayout(gameData.nodes);
        
        Object.keys(layoutNodes).forEach(nodeId => {
            if (gameData.nodes[nodeId]) {
                gameData.nodes[nodeId].x = layoutNodes[nodeId].x;
                gameData.nodes[nodeId].y = layoutNodes[nodeId].y;
            }
        });
        
        return gameData;
    }

    /**
     * Initialize layout for gameData
     */
    initializeLayout(gameData: GameData): void {
        if (gameData && gameData.nodes) {
            this.applyLayout(gameData);
        }
    }
}

// Export singleton instance
export const LayoutEngine = new LayoutEngineClass();
