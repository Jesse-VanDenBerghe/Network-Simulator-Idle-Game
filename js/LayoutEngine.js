// LayoutEngine - Dynamic node positioning for the skill tree
// Refactored into 3 focused classes: TreeBuilder, PositionCalculator, CollisionResolver
// ==========================================================

// Layout config (mirrors LAYOUT_CONFIG from constants.js for non-module scripts)
const LAYOUT_ENGINE_CONFIG = Object.freeze({
    CENTER_X: 1400,
    CENTER_Y: 1400,
    TIER_SPACING: 180,
    SAME_TIER_OFFSET: 60,
    NODE_SPACING: 100,
    NODE_SIZE: 80
});

/**
 * Extract node ID from a requirement (supports both 'node_id' and { id: 'node_id', level: n })
 */
function getReqId(req) {
    return typeof req === 'string' ? req : req.id;
}

// ==========================================================
// TreeBuilder: Constructs dependency tree structure from nodes
// Single Responsibility: Build tree structure and assign branches
// ==========================================================
class TreeBuilder {
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
            tree.parents[node.id] = (node.requires || []).map(getReqId);
            tree.children[node.id] = [];
        });

        Object.values(nodes).forEach(node => {
            node.requires.forEach(req => {
                const parentId = getReqId(req);
                if (tree.children[parentId]) {
                    tree.children[parentId].push(node.id);
                }
            });
        });

        Object.keys(nodes).forEach(nodeId => {
            tree.descendants[nodeId] = this.countDescendants(nodeId, tree, nodes);
        });

        return tree;
    }

    countDescendants(nodeId, tree, nodes, visited = new Set()) {
        if (visited.has(nodeId)) return 0;
        visited.add(nodeId);
        
        const children = tree.children[nodeId] || [];
        let count = children.length;
        children.forEach(childId => {
            count += this.countDescendants(childId, tree, nodes, visited);
        });
        return count;
    }

    assignBranches(nodes, tree) {
        if (nodes.old_shed) {
            nodes.old_shed.branch = 'old_shed';
            nodes.old_shed.branchAngle = 0;
        }

        const tier1Nodes = tree.nodesByTier[1] || [];
        const tier1Count = tier1Nodes.length;
        
        tier1Nodes.forEach((nodeId, index) => {
            const angle = -Math.PI / 2 + (2 * Math.PI * index / tier1Count);
            nodes[nodeId].branch = nodeId;
            nodes[nodeId].branchAngle = angle;
        });

        for (let tier = 2; tier <= tree.maxTier; tier++) {
            const tierNodes = tree.nodesByTier[tier] || [];
            
            tierNodes.forEach(nodeId => {
                const node = nodes[nodeId];
                const parents = node.requires.map(req => nodes[getReqId(req)]).filter(p => p);
                
                if (parents.length === 0) return;

                const parentAngles = parents.map(p => p.branchAngle).filter(a => a !== undefined);
                
                if (parentAngles.length > 0) {
                    node.branchAngle = this.averageAngle(parentAngles);
                    node.branch = parents[0].branch;
                }
            });
        }
    }

    averageAngle(angles) {
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

// ==========================================================
// PositionCalculator: Calculates node positions based on tree structure
// Single Responsibility: Physics-based positioning and depth calculations
// ==========================================================
class PositionCalculator {
    constructor(config) {
        this.config = config;
    }

    /**
     * Calculate the depth of a node from tier 1 (how many parent hops)
     * Returns an object with depth count and same-tier hops for radius calculation
     */
    calculateDepth(nodeId, nodes, cache = {}) {
        if (cache[nodeId] !== undefined) return cache[nodeId];
        
        const node = nodes[nodeId];
        if (!node) return { depth: 0, sameTierHops: 0 };
        if (node.tier === 0) { cache[nodeId] = { depth: 0, sameTierHops: 0 }; return cache[nodeId]; }
        if (node.tier === 1) { cache[nodeId] = { depth: 1, sameTierHops: 0 }; return cache[nodeId]; }
        
        // Find parent with max depth
        const parents = (node.requires || []).map(req => nodes[getReqId(req)]).filter(p => p);
        if (parents.length === 0) {
            cache[nodeId] = { depth: node.tier, sameTierHops: 0 };
            return cache[nodeId];
        }
        
        const parentDepths = parents.map(p => this.calculateDepth(p.id, nodes, cache));
        const maxParentDepth = Math.max(...parentDepths.map(d => d.depth));
        const parentWithMaxDepth = parents.find((p, i) => parentDepths[i].depth === maxParentDepth);
        const parentDepthInfo = parentDepths[parents.indexOf(parentWithMaxDepth)];
        
        // Check if this is a same-tier hop
        const isSameTierHop = parentWithMaxDepth && parentWithMaxDepth.tier === node.tier;
        
        cache[nodeId] = {
            depth: maxParentDepth + 1,
            sameTierHops: parentDepthInfo.sameTierHops + (isSameTierHop ? 1 : 0)
        };
        return cache[nodeId];
    }

    calculateRadius(depthInfo) {
        const { tierSpacing, sameTierOffset } = this.config;
        const effectiveDepth = depthInfo.depth - depthInfo.sameTierHops;
        return effectiveDepth * tierSpacing + depthInfo.sameTierHops * sameTierOffset;
    }

    averageAngle(angles) {
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
    calculatePositions(nodes, tree) {
        const { centerX, centerY, tierSpacing } = this.config;

        // Position old_shed at center
        if (nodes.old_shed) {
            nodes.old_shed.x = centerX;
            nodes.old_shed.y = centerY;
        }

        // Calculate depth info for all nodes (based on parent chain, not tier)
        const depthCache = {};
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
            node.x = centerX + Math.cos(node.branchAngle) * radius1;
            node.y = centerY + Math.sin(node.branchAngle) * radius1;
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
                const radius = this.calculateRadius(node.depthInfo);
                node.x = centerX + Math.cos(node.branchAngle) * radius;
                node.y = centerY + Math.sin(node.branchAngle) * radius;
            });
            
            // Single-parent nodes: group by parent and spread symmetrically
            const parentGroups = this.groupByParent(singleParentNodes, nodes, tree);
            
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
                    const radius = this.calculateRadius(node.depthInfo);
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
            node.x = Math.round(node.x - halfNode);
            node.y = Math.round(node.y - halfNode);
        });
    }

    groupByParent(nodeIds, nodes, tree) {
        const groups = {};
        
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

    groupByAngle(nodeIds, nodes, tolerance = 0.3) {
        const groups = [];
        
        nodeIds.forEach(nodeId => {
            const angle = nodes[nodeId].branchAngle || 0;
            
            // Find existing group with similar angle
            let found = false;
            for (const group of groups) {
                const diff = Math.abs(this.angleDiff(group.angle, angle));
                if (diff < tolerance) {
                    group.nodes.push(nodeId);
                    // Update group angle to be average
                    const angles = group.nodes.map(id => nodes[id].branchAngle || 0);
                    group.angle = this.averageAngle(angles);
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                groups.push({ angle, nodes: [nodeId] });
            }
        });
        
        return groups;
    }

    angleDiff(a, b) {
        let diff = b - a;
        while (diff > Math.PI) diff -= 2 * Math.PI;
        while (diff < -Math.PI) diff += 2 * Math.PI;
        return diff;
    }
}

// ==========================================================
// CollisionResolver: Resolves node collisions using spatial partitioning
// Single Responsibility: Collision detection and resolution only
// Complexity: O(n*k) where k = avg nodes per grid cell (instead of O(n²))
// ==========================================================
class CollisionResolver {
    constructor(config) {
        this.config = config;
    }

    resolveCollisions(nodes) {
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
                const cellKey = this.getGridCellKey(nodeA.x, nodeA.y, cellSize);
                const [cx, cy] = cellKey.split(',').map(Number);
                
                // Check current cell and 8 adjacent cells
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        const adjKey = `${cx + dx},${cy + dy}`;
                        const cellNodes = grid.get(adjKey) || [];
                        
                        cellNodes.forEach(nodeB => {
                            // Avoid duplicate checks (only process if nodeB comes after nodeA)
                            if (nodeA.id >= nodeB.id) return;
                            
                            const dx = nodeB.x - nodeA.x;
                            const dy = nodeB.y - nodeA.y;
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            
                            if (distance < minDistance && distance > 0) {
                                const overlap = minDistance - distance;
                                maxOverlap = Math.max(maxOverlap, overlap);
                                
                                // Push nodes apart
                                const pushX = (dx / distance) * overlap * 0.5;
                                const pushY = (dy / distance) * overlap * 0.5;
                                
                                // Don't move the old_shed node
                                if (nodeA.id !== 'old_shed') {
                                    nodeA.x -= pushX;
                                    nodeA.y -= pushY;
                                }
                                if (nodeB.id !== 'old_shed') {
                                    nodeB.x += pushX;
                                    nodeB.y += pushY;
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
            node.x = Math.round(node.x);
            node.y = Math.round(node.y);
        });
    }

    buildSpatialGrid(nodeList, cellSize) {
        const grid = new Map();
        
        nodeList.forEach(node => {
            const cellKey = this.getGridCellKey(node.x, node.y, cellSize);
            if (!grid.has(cellKey)) {
                grid.set(cellKey, []);
            }
            grid.get(cellKey).push(node);
        });
        
        return grid;
    }

    getGridCellKey(x, y, cellSize) {
        const cellX = Math.floor(x / cellSize);
        const cellY = Math.floor(y / cellSize);
        return `${cellX},${cellY}`;
    }
}

// ==========================================================
// LayoutEngine: Main orchestrator that composes the three specialized classes
// Maintains original API while using composition internally
// ==========================================================
const LayoutEngine = {
    // Use LAYOUT_ENGINE_CONFIG (C14)
    config: {
        centerX: LAYOUT_ENGINE_CONFIG.CENTER_X,
        centerY: LAYOUT_ENGINE_CONFIG.CENTER_Y,
        tierSpacing: LAYOUT_ENGINE_CONFIG.TIER_SPACING,
        sameTierOffset: LAYOUT_ENGINE_CONFIG.SAME_TIER_OFFSET,
        nodeSpacing: LAYOUT_ENGINE_CONFIG.NODE_SPACING,
        nodeSize: LAYOUT_ENGINE_CONFIG.NODE_SIZE,
    },

    _treeBuilder: new TreeBuilder(),
    _positionCalculator: null,
    _collisionResolver: null,

    _ensureComponents() {
        if (!this._positionCalculator) {
            this._positionCalculator = new PositionCalculator(this.config);
        }
        if (!this._collisionResolver) {
            this._collisionResolver = new CollisionResolver(this.config);
        }
    },

    calculateLayout(nodes) {
        this._ensureComponents();
        const nodesCopy = structuredClone(nodes);
        
        const tree = this._treeBuilder.buildTree(nodesCopy);
        this._treeBuilder.assignBranches(nodesCopy, tree);
        this._positionCalculator.calculatePositions(nodesCopy, tree);
        this._collisionResolver.resolveCollisions(nodesCopy);
        
        return nodesCopy;
    },

    applyLayout(gameData) {
        const layoutNodes = this.calculateLayout(gameData.nodes);
        
        Object.keys(layoutNodes).forEach(nodeId => {
            if (gameData.nodes[nodeId]) {
                gameData.nodes[nodeId].x = layoutNodes[nodeId].x;
                gameData.nodes[nodeId].y = layoutNodes[nodeId].y;
            }
        });
        
        return gameData;
    },

    initializeLayout(gameData) {
        if (gameData && gameData.nodes) {
            this.applyLayout(gameData);
        }
    }
};

// Export for ES6 module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LayoutEngine;
}
