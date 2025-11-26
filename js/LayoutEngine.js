// LayoutEngine - Dynamic node positioning for the skill tree
// ==========================================================

/**
 * Extract node ID from a requirement (supports both 'node_id' and { id: 'node_id', level: n })
 */
function getReqId(req) {
    return typeof req === 'string' ? req : req.id;
}

const LayoutEngine = {
    // Configuration
    config: {
        centerX: 1400,           // Center of the skill tree
        centerY: 1400,           // Center of the skill tree
        tierSpacing: 180,        // Radial spacing between tiers
        sameTierOffset: 60,      // Extra radius offset for same-tier children (smaller = closer)
        nodeSpacing: 100,        // Minimum spacing between nodes
        nodeSize: 80,            // Size of each node for collision detection
    },

    /**
     * Calculate positions for all nodes dynamically
     * @param {Object} nodes - The nodes object from GameData
     * @returns {Object} - Nodes with updated x, y positions
     */
    calculateLayout(nodes) {
        const nodesCopy = structuredClone(nodes);
        
        // Step 1: Build the tree structure
        const tree = this.buildTree(nodesCopy);
        
        // Step 2: Assign branches and sub-positions to all nodes
        this.assignBranches(nodesCopy, tree);
        
        // Step 3: Calculate positions using a force-directed-like approach per tier
        this.calculatePositions(nodesCopy, tree);
        
        // Step 4: Apply collision resolution
        this.resolveCollisions(nodesCopy);
        
        return nodesCopy;
    },

    /**
     * Build tree structure from node dependencies
     */
    buildTree(nodes) {
        const tree = {
            nodesByTier: {},
            children: {},      
            parents: {},       
            maxTier: 0,
            descendants: {}    // Track all descendants for subtree sizing
        };

        Object.values(nodes).forEach(node => {
            // Group by tier
            if (!tree.nodesByTier[node.tier]) {
                tree.nodesByTier[node.tier] = [];
            }
            tree.nodesByTier[node.tier].push(node.id);
            tree.maxTier = Math.max(tree.maxTier, node.tier);

            // Build parent-child relationships
            tree.parents[node.id] = (node.requires || []).map(getReqId);
            tree.children[node.id] = [];
        });

        // Build children list
        Object.values(nodes).forEach(node => {
            node.requires.forEach(req => {
                const parentId = getReqId(req);
                if (tree.children[parentId]) {
                    tree.children[parentId].push(node.id);
                }
            });
        });

        // Calculate descendant counts for spacing
        Object.keys(nodes).forEach(nodeId => {
            tree.descendants[nodeId] = this.countDescendants(nodeId, tree, nodes);
        });

        return tree;
    },

    /**
     * Count all descendants of a node (for proportional spacing)
     */
    countDescendants(nodeId, tree, nodes) {
        const children = tree.children[nodeId] || [];
        let count = children.length;
        children.forEach(childId => {
            count += this.countDescendants(childId, tree, nodes);
        });
        return count;
    },

    /**
     * Assign each node to a branch based on its ancestry
     * Tier 1 nodes are spread evenly around the circle
     */
    assignBranches(nodes, tree) {
        // Old shed is special
        if (nodes.old_shed) {
            nodes.old_shed.branch = 'old_shed';
            nodes.old_shed.branchAngle = 0;
        }

        // Tier 1 nodes: spread evenly around the circle
        const tier1Nodes = tree.nodesByTier[1] || [];
        const tier1Count = tier1Nodes.length;
        
        tier1Nodes.forEach((nodeId, index) => {
            const angle = -Math.PI / 2 + (2 * Math.PI * index / tier1Count);
            nodes[nodeId].branch = nodeId;
            nodes[nodeId].branchAngle = angle;
        });

        // Propagate branches to descendants
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
    },

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
    },

    /**
     * Calculate radius for a node based on depth and same-tier hops
     */
    calculateRadius(depthInfo) {
        const { tierSpacing, sameTierOffset } = this.config;
        const effectiveDepth = depthInfo.depth - depthInfo.sameTierHops;
        return effectiveDepth * tierSpacing + depthInfo.sameTierHops * sameTierOffset;
    },

    /**
     * Calculate average of angles (handling wraparound)
     */
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
    },

    /**
     * Group tier nodes by their primary parent for symmetrical layout
     */
    groupByParent(nodeIds, nodes, tree) {
        const groups = {};
        
        nodeIds.forEach(nodeId => {
            const node = nodes[nodeId];
            // Use first parent as the grouping key
            const parentId = node.requires && node.requires.length > 0 ? getReqId(node.requires[0]) : 'old_shed';
            
            if (!groups[parentId]) {
                groups[parentId] = { parentId, nodes: [] };
            }
            groups[parentId].nodes.push(nodeId);
        });
        
        return Object.values(groups);
    },

    /**
     * Group nodes by similar angles (within tolerance)
     */
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
    },

    /**
     * Calculate difference between two angles
     */
    angleDiff(a, b) {
        let diff = b - a;
        while (diff > Math.PI) diff -= 2 * Math.PI;
        while (diff < -Math.PI) diff += 2 * Math.PI;
        return diff;
    },

    /**
     * Resolve collisions between nodes
     */
    resolveCollisions(nodes) {
        const nodeList = Object.values(nodes);
        const minDistance = this.config.nodeSpacing;
        const iterations = 15;

        for (let iter = 0; iter < iterations; iter++) {
            let maxOverlap = 0;

            for (let a = 0; a < nodeList.length; a++) {
                for (let b = a + 1; b < nodeList.length; b++) {
                    const nodeA = nodeList[a];
                    const nodeB = nodeList[b];
                    
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
                }
            }

            // Stop early if no significant overlaps
            if (maxOverlap < 1) break;
        }

        // Round positions
        nodeList.forEach(node => {
            node.x = Math.round(node.x);
            node.y = Math.round(node.y);
        });
    },

    /**
     * Apply layout to GameData nodes
     * Call this once to update all node positions
     */
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

    /**
     * Initialize layout - call once on load after GameData is ready
     * @param {Object} gameData - The GameData object
     */
    initializeLayout(gameData) {
        if (gameData && gameData.nodes) {
            console.log('Initializing layout for', Object.keys(gameData.nodes).length, 'nodes');
            this.applyLayout(gameData);
        }
    }
};

// Export for ES6 module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LayoutEngine;
}

// Note: Layout is initialized explicitly from App.js after all modules are loaded
// This ensures nodes are fully imported before layout calculation
