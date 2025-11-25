// SkillTree Component - The main skill tree visualization
const SkillTree = {
    name: 'SkillTree',
    components: {
        SkillNode
    },
    props: {
        nodes: { type: Object, required: true },
        unlockedNodes: { type: Set, required: true },
        selectedNodeId: { type: String, default: null },
        resources: { type: Object, required: true },
        ascensionCount: { type: Number, default: 0 },
        prestigeBonuses: { type: Object, default: null },
        lastUnlockedNodeId: { type: String, default: null }
    },
    emits: ['select-node'],
    data() {
        return {
            justUnlockedNodeId: null,
            animatingConnections: new Set(),
            glowingConnections: new Map(), // tracks glow animation offset for each connection
            travelingDots: [], // { id, fromNode, toNode, progress, startTime }
            nodeProgress: new Map() // tracks unlock progress for each available node
        };
    },
    watch: {
        lastUnlockedNodeId(newId) {
            if (newId) {
                this.triggerUnlockAnimation(newId);
                // Clear progress for the unlocked node
                this.nodeProgress.delete(newId);
            }
        }
    },
    computed: {
        connections() {
            // Only show connections where both nodes are visible
            return GameData.getConnections().filter(conn => 
                this.isNodeVisible(this.nodes[conn.from]) && this.isNodeVisible(this.nodes[conn.to])
            );
        },
        nodesList() {
            // Only show unlocked nodes and available nodes
            return Object.values(this.nodes).filter(node => this.isNodeVisible(node));
        }
    },
    methods: {
        isUnlocked(nodeId) {
            return this.unlockedNodes.has(nodeId);
        },
        isAvailable(node) {
            if (this.unlockedNodes.has(node.id)) return false;
            return node.requires.every(reqId => this.unlockedNodes.has(reqId));
        },
        canAfford(node) {
            if (!node || !this.isAvailable(node)) return false;
            const scaledCost = GameData.getScaledNodeCost(node, this.ascensionCount, this.prestigeBonuses);
            for (const [resource, amount] of Object.entries(scaledCost)) {
                if (this.resources[resource] < amount) return false;
            }
            return true;
        },
        isTierLocked(node) {
             return !GameData.isTierUnlocked(node.tier, this.unlockedNodes);
        },
        isNodeVisible(node) {
            if (!node) return false;
            // Show if unlocked OR available
            // Note: We SHOW tier-locked nodes if they are otherwise available (parents unlocked)
            return this.unlockedNodes.has(node.id) || this.isAvailable(node);
        },
        isConnectionUnlocked(connection) {
            return this.unlockedNodes.has(connection.from) && this.unlockedNodes.has(connection.to);
        },
        selectNode(nodeId) {
            this.$emit('select-node', nodeId);
        },
        triggerUnlockAnimation(nodeId) {
            // Trigger shockwave on node
            this.justUnlockedNodeId = nodeId;
            
            // Find connections to this node and animate them
            const node = this.nodes[nodeId];
            if (node && node.requires) {
                node.requires.forEach(parentId => {
                    const connKey = `${parentId}-${nodeId}`;
                    this.animatingConnections.add(connKey);
                    
                    // Remove animation after it completes
                    setTimeout(() => {
                        this.animatingConnections.delete(connKey);
                    }, 800);
                });
            }
            
            // Clear shockwave after animation
            setTimeout(() => {
                this.justUnlockedNodeId = null;
            }, 1000);
        },
        isConnectionAnimating(conn) {
            if (!conn || !conn.from || !conn.to) return false;
            const key = `${conn.from}-${conn.to}`;
            return this.animatingConnections.has(key);
        },
        getConnectionGradientId(conn) {
            if (!conn) return '';
            return `pulse-gradient-${conn.from}-${conn.to}`;
        },
        getAnimatingConnections() {
            return this.connections.filter(conn => this.isConnectionAnimating(conn));
        },
        startGlowAnimation() {
            let time = 0;
            const animate = () => {
                time += 0.01;
                // Update glow positions for unlocked connections
                this.connections.forEach((conn, index) => {
                    if (this.isConnectionUnlocked(conn)) {
                        // Stagger the glow based on connection index
                        const offset = (time + index * 0.3) % 1;
                        this.glowingConnections.set(`${conn.from}-${conn.to}`, offset);
                    }
                });
                this.glowAnimationFrame = requestAnimationFrame(animate);
            };
            animate();
        },
        getGlowOffset(conn) {
            return this.glowingConnections.get(`${conn.from}-${conn.to}`) || 0;
        },
        getGlowGradientId(conn) {
            return `glow-gradient-${conn.from}-${conn.to}`;
        },
        startDotAnimation() {
            // Every 3 seconds, spawn dots from the core node
            this.dotInterval = setInterval(() => {
                this.spawnDotsFromCore();
            }, 3000);
            
            // Animation loop to update dot positions
            const animate = () => {
                const now = Date.now();
                const dotSpeed = 0.5; // dots take 2 seconds to traverse a connection
                
                // First, check for dots that have completed and spawn new ones
                const dotsToSpawn = [];
                this.travelingDots.forEach(dot => {
                    const elapsed = (now - dot.startTime) / 1000;
                    dot.progress = Math.min(elapsed * dotSpeed, 1);
                    
                    if (dot.progress >= 1) {
                        const toNode = this.nodes[dot.toNode];
                        
                        // If target node is available (not unlocked), increase its progress
                        if (toNode && this.isAvailable(toNode)) {
                            const currentProgress = this.nodeProgress.get(dot.toNode) || 0;
                            const scaledCost = GameData.getScaledNodeCost(toNode, this.ascensionCount, this.prestigeBonuses);
                            const totalCost = Object.values(scaledCost).reduce((sum, cost) => sum + cost, 0);
                            // Each dot contributes 1% of the total cost
                            const progressIncrement = totalCost * 0.01;
                            this.nodeProgress.set(dot.toNode, currentProgress + progressIncrement);
                        }
                        
                        // Only spawn from unlocked nodes
                        if (this.isUnlocked(dot.toNode)) {
                            dotsToSpawn.push(dot.toNode);
                        }
                    }
                });
                
                // Spawn new dots from completed nodes
                dotsToSpawn.forEach(nodeId => {
                    this.spawnDotsFromNode(nodeId);
                });
                
                // Then filter out completed dots
                this.travelingDots = this.travelingDots.filter(dot => dot.progress < 1);
                
                this.dotAnimationFrame = requestAnimationFrame(animate);
            };
            animate();
        },
        spawnDotsFromCore() {
            // Find connections from core to unlocked nodes (and optionally available nodes)
            const coreConnections = this.connections.filter(conn => {
                if (conn.from !== 'core') return false;
                if (this.isUnlocked(conn.to)) return true;
                // Only include available nodes if feature flag is enabled
                return GameData.FEATURE_FLAGS.DOTS_TO_AVAILABLE_NODES && this.isAvailable(this.nodes[conn.to]);
            });
            
            coreConnections.forEach(conn => {
                this.travelingDots.push({
                    id: `${Date.now()}-${Math.random()}`,
                    fromNode: conn.from,
                    toNode: conn.to,
                    progress: 0,
                    startTime: Date.now(),
                    toUnlocked: this.isUnlocked(conn.to)
                });
            });
        },
        spawnDotsFromNode(nodeId) {
            // Find connections going out from this unlocked node to unlocked nodes (and optionally available)
            const outgoingConnections = this.connections.filter(conn => {
                if (conn.from !== nodeId) return false;
                if (!this.isUnlocked(conn.from)) return false;
                if (this.isUnlocked(conn.to)) return true;
                // Only include available nodes if feature flag is enabled
                return GameData.FEATURE_FLAGS.DOTS_TO_AVAILABLE_NODES && this.isAvailable(this.nodes[conn.to]);
            });
            
            console.log(`Spawning dots from node ${nodeId}, found ${outgoingConnections.length} outgoing connections`, outgoingConnections);
            
            const now = Date.now();
            outgoingConnections.forEach((conn, index) => {
                this.travelingDots.push({
                    id: `${now}-${Math.random()}-${index}`,
                    fromNode: conn.from,
                    toNode: conn.to,
                    progress: 0,
                    startTime: now,
                    toUnlocked: this.isUnlocked(conn.to)
                });
            });
        },
        getDotPosition(dot) {
            const fromNode = this.nodes[dot.fromNode];
            const toNode = this.nodes[dot.toNode];
            if (!fromNode || !toNode) return { x: 0, y: 0 };
            
            // Interpolate position along the line
            const x = fromNode.x + (toNode.x - fromNode.x) * dot.progress + 40; // +40 for node center
            const y = fromNode.y + (toNode.y - fromNode.y) * dot.progress + 40;
            return { x, y };
        },
        getNodeProgressPercent(nodeId) {
            const node = this.nodes[nodeId];
            if (!node || !this.isAvailable(node)) return 0;
            
            const currentProgress = this.nodeProgress.get(nodeId) || 0;
            const scaledCost = GameData.getScaledNodeCost(node, this.ascensionCount, this.prestigeBonuses);
            const totalCost = Object.values(scaledCost).reduce((sum, cost) => sum + cost, 0);
            
            return Math.min((currentProgress / totalCost) * 100, 100);
        }
    },
    mounted() {
        // Start connection glow animation loop
        this.startGlowAnimation();
        
        // Start traveling dot animation
        this.startDotAnimation();
        
        // Center on core node
        this.$nextTick(() => {
            const container = this.$refs.container;
            const coreNode = this.nodes.core;
            if (container && coreNode) {
                container.scrollLeft = coreNode.x - container.clientWidth / 2 + 40;
                container.scrollTop = coreNode.y - container.clientHeight / 2 + 40;
            }
        });
    },
    beforeUnmount() {
        if (this.glowAnimationFrame) {
            cancelAnimationFrame(this.glowAnimationFrame);
        }
        if (this.dotAnimationFrame) {
            cancelAnimationFrame(this.dotAnimationFrame);
        }
        if (this.dotInterval) {
            clearInterval(this.dotInterval);
        }
    },
    template: `
        <section id="skill-tree-container" ref="container">
            <div id="skill-tree">
                <svg id="connections">
                    <defs>
                        <!-- Glow gradients for flowing effect -->
                        <template v-for="conn in connections" :key="'glow-template-' + conn.from + '-' + conn.to">
                            <linearGradient 
                                v-if="isConnectionUnlocked(conn)"
                                :id="getGlowGradientId(conn)"
                                gradientUnits="userSpaceOnUse"
                                :x1="conn.x1" :y1="conn.y1" :x2="conn.x2" :y2="conn.y2"
                            >
                                <stop :offset="Math.max(0, getGlowOffset(conn) - 0.1)" stop-color="rgba(0, 255, 170, 0)" />
                                <stop :offset="getGlowOffset(conn)" stop-color="rgba(0, 255, 255, 0.8)" />
                                <stop :offset="Math.min(1, getGlowOffset(conn) + 0.1)" stop-color="rgba(0, 255, 170, 0)" />
                            </linearGradient>
                        </template>
                        
                        <!-- Pulse gradients for unlock animation -->
                        <linearGradient 
                            v-for="conn in connections"
                            :key="'grad-' + conn.from + '-' + conn.to"
                            :id="getConnectionGradientId(conn)"
                            gradientUnits="userSpaceOnUse"
                            :x1="conn.x1" :y1="conn.y1" :x2="conn.x2" :y2="conn.y2"
                        >
                            <stop offset="0%" stop-color="#00ffaa" stop-opacity="0">
                                <animate 
                                    v-if="isConnectionAnimating(conn)"
                                    attributeName="offset" 
                                    values="0;1" 
                                    dur="0.6s" 
                                    fill="freeze"
                                />
                            </stop>
                            <stop offset="0%" stop-color="#ffffff" stop-opacity="1">
                                <animate 
                                    v-if="isConnectionAnimating(conn)"
                                    attributeName="offset" 
                                    values="0;1" 
                                    dur="0.6s" 
                                    fill="freeze"
                                />
                            </stop>
                            <stop offset="10%" stop-color="#00ffaa" stop-opacity="0">
                                <animate 
                                    v-if="isConnectionAnimating(conn)"
                                    attributeName="offset" 
                                    values="0.1;1.1" 
                                    dur="0.6s" 
                                    fill="freeze"
                                />
                            </stop>
                        </linearGradient>
                    </defs>
                    <!-- Base connection lines -->
                    <line
                        v-for="(conn, index) in connections"
                        :key="index"
                        :x1="conn.x1"
                        :y1="conn.y1"
                        :x2="conn.x2"
                        :y2="conn.y2"
                        :class="{ unlocked: isConnectionUnlocked(conn), animating: isConnectionAnimating(conn) }"
                    />
                    
                    <!-- Flowing glow overlay for unlocked connections -->
                    <template v-for="conn in connections" :key="'glow-line-' + conn.from + '-' + conn.to">
                        <line
                            v-if="isConnectionUnlocked(conn) && !isConnectionAnimating(conn)"
                            :x1="conn.x1"
                            :y1="conn.y1"
                            :x2="conn.x2"
                            :y2="conn.y2"
                            class="connection-glow"
                            :stroke="'url(#' + getGlowGradientId(conn) + ')'"
                        />
                    </template>
                    <line
                        v-for="conn in getAnimatingConnections()"
                        :key="'pulse-' + conn.from + '-' + conn.to"
                        :x1="conn.x1"
                        :y1="conn.y1"
                        :x2="conn.x2"
                        :y2="conn.y2"
                        class="connection-pulse"
                        :stroke="'url(#' + getConnectionGradientId(conn) + ')'"
                    />
                </svg>
                
                <!-- Traveling dots -->
                <div 
                    v-for="dot in travelingDots" 
                    :key="dot.id"
                    :class="['traveling-dot', { 'to-locked': !dot.toUnlocked }]"
                    :style="{
                        left: getDotPosition(dot).x + 'px',
                        top: getDotPosition(dot).y + 'px'
                    }"
                ></div>
                
                <div id="nodes">
                    <SkillNode
                        v-for="node in nodesList"
                        :key="node.id"
                        :node="node"
                        :is-unlocked="isUnlocked(node.id)"
                        :is-available="isAvailable(node)"
                        :is-tier-locked="isTierLocked(node)"
                        :can-afford="canAfford(node)"
                        :is-selected="selectedNodeId === node.id"
                        :just-unlocked="justUnlockedNodeId === node.id"
                        :progress-percent="getNodeProgressPercent(node.id)"
                        @select="selectNode"
                    />
                </div>
            </div>
        </section>
    `
};
