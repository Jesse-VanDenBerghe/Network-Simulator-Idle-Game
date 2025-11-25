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
        resources: { type: Object, required: true }
    },
    emits: ['select-node'],
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
            for (const [resource, amount] of Object.entries(node.cost)) {
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
        }
    },
    mounted() {
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
    template: `
        <section id="skill-tree-container" ref="container">
            <div id="skill-tree">
                <svg id="connections">
                    <line
                        v-for="(conn, index) in connections"
                        :key="index"
                        :x1="conn.x1"
                        :y1="conn.y1"
                        :x2="conn.x2"
                        :y2="conn.y2"
                        :class="{ unlocked: isConnectionUnlocked(conn) }"
                    />
                </svg>
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
                        @select="selectNode"
                    />
                </div>
            </div>
        </section>
    `
};
