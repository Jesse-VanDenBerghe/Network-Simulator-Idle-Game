// LayoutEngine - Dynamic node positioning for the skill tree
// ==========================================================

const LayoutEngine = {
    // Configuration
    config: {
        centerX: 1400,           // Center of the skill tree
        centerY: 1400,           // Center of the skill tree
        tierSpacing: 180,        // Radial spacing between tiers
        nodeSpacing: 100,        // Minimum spacing between nodes
        nodeSize: 80,            // Size of each node for collision detection
    },

    /**
     * Calculate positions for all nodes dynamically
     * @param {Object} nodes - The nodes object from GameData
     * @returns {Object} - Nodes with updated x, y positions
     */
    calculateLayout(nodes) {
        const nodesCopy = JSON.parse(JSON.stringify(nodes));
        
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
            tree.parents[node.id] = node.requires || [];
            tree.children[node.id] = [];
        });

        // Build children list
        Object.values(nodes).forEach(node => {
            node.requires.forEach(parentId => {
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
        // Core is special
        if (nodes.core) {
            nodes.core.branch = 'core';
            nodes.core.branchAngle = 0;
        }

        // Tier 1 nodes: spread evenly around the circle
        const tier1Nodes = tree.nodesByTier[1] || [];
        const tier1Count = tier1Nodes.length;
        
        tier1Nodes.forEach((nodeId, index) => {
            // Distribute evenly, starting from top (-PI/2) going clockwise
            const angle = -Math.PI / 2 + (2 * Math.PI * index / tier1Count);
            nodes[nodeId].branch = nodeId; // Each tier1 node is its own branch
            nodes[nodeId].branchAngle = angle;
        });

        // Propagate branches to descendants
        for (let tier = 2; tier <= tree.maxTier; tier++) {
            const tierNodes = tree.nodesByTier[tier] || [];
            
            tierNodes.forEach(nodeId => {
                const node = nodes[nodeId];
                const parents = node.requires.map(pid => nodes[pid]).filter(p => p);
                
                if (parents.length === 0) return;

                // Calculate branch angle as weighted average of parents
                const parentAngles = parents.map(p => p.branchAngle).filter(a => a !== undefined);
                
                if (parentAngles.length > 0) {
                    node.branchAngle = this.averageAngle(parentAngles);
                    node.branch = parents[0].branch; // Use first parent's branch name
                }
            });
        }
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
     */
    calculatePositions(nodes, tree) {
        const { centerX, centerY, tierSpacing } = this.config;

        // Position core at center
        if (nodes.core) {
            nodes.core.x = centerX;
            nodes.core.y = centerY;
        }

        // For each tier, distribute nodes radially
        for (let tier = 1; tier <= tree.maxTier; tier++) {
            const tierNodes = tree.nodesByTier[tier] || [];
            if (tierNodes.length === 0) continue;

            const radius = tier * tierSpacing;
            
            // Sort nodes by their branch angle for smooth distribution
            const sortedNodes = tierNodes.slice().sort((a, b) => {
                const angleA = nodes[a].branchAngle || 0;
                const angleB = nodes[b].branchAngle || 0;
                return angleA - angleB;
            });

            // Group by similar angles (within same branch area)
            const angleGroups = this.groupByAngle(sortedNodes, nodes);
            
            // Position each group
            angleGroups.forEach(group => {
                const baseAngle = group.angle;
                const count = group.nodes.length;
                
                // Calculate angular spread based on group size and tier
                const spreadPerNode = 0.15 / Math.sqrt(tier);
                const totalSpread = spreadPerNode * (count - 1);
                
                group.nodes.forEach((nodeId, idx) => {
                    const node = nodes[nodeId];
                    let nodeAngle = baseAngle;
                    
                    if (count > 1) {
                        // Spread nodes around the base angle
                        const offset = (idx - (count - 1) / 2) * spreadPerNode;
                        nodeAngle = baseAngle + offset;
                    }
                    
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
                        
                        // Don't move the core node
                        if (nodeA.id !== 'core') {
                            nodeA.x -= pushX;
                            nodeA.y -= pushY;
                        }
                        if (nodeB.id !== 'core') {
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
    }
};

// Note: Layout is now initialized explicitly from gameData.js after module loading
// This ensures nodes are fully imported before layout calculation
