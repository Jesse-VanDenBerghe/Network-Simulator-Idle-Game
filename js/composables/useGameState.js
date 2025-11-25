// useGameState Composable
// ========================
// Manages core game state: resources, automations, unlocked nodes

const { ref, reactive, computed } = Vue;

export function useGameState() {
    // ==========================================
    // STATE
    // ==========================================
    const resources = reactive({
        energy: 0,
        data: 0,
        bandwidth: 0
    });

    const totalResources = reactive({
        energy: 0,
        data: 0,
        bandwidth: 0
    });

    const automations = reactive({
        energy: 0,
        data: 0,
        bandwidth: 0
    });

    const unlockedNodes = ref(new Set(['core']));
    const selectedNodeId = ref(null);
    const lastUnlockedNodeId = ref(null);

    // ==========================================
    // COMPUTED
    // ==========================================
    const dataUnlocked = computed(() => {
        return unlockedNodes.value.has('data_processing');
    });

    const bandwidthUnlocked = computed(() => {
        return unlockedNodes.value.has('bandwidth_unlock');
    });

    const canProcessData = computed(() => {
        return dataUnlocked.value && resources.energy >= 5;
    });

    const highestTierReached = computed(() => {
        let maxTier = 0;
        unlockedNodes.value.forEach(nodeId => {
            const node = GameData.nodes[nodeId];
            if (node && node.tier > maxTier) {
                maxTier = node.tier;
            }
        });
        return maxTier;
    });

    const stats = computed(() => ({
        nodesUnlocked: unlockedNodes.value.size,
        totalEnergy: totalResources.energy,
        totalData: totalResources.data
    }));

    // ==========================================
    // METHODS
    // ==========================================
    function selectNode(nodeId) {
        selectedNodeId.value = nodeId;
    }

    function resetResources() {
        Object.keys(resources).forEach(k => resources[k] = 0);
        Object.keys(totalResources).forEach(k => totalResources[k] = 0);
        Object.keys(automations).forEach(k => automations[k] = 0);
    }

    function resetNodes() {
        unlockedNodes.value = new Set(['core']);
    }

    function setLastUnlockedNode(nodeId) {
        lastUnlockedNodeId.value = nodeId;
        // Clear after animation completes
        setTimeout(() => {
            if (lastUnlockedNodeId.value === nodeId) {
                lastUnlockedNodeId.value = null;
            }
        }, 1200);
    }

    // ==========================================
    // RETURN
    // ==========================================
    return {
        // State
        resources,
        totalResources,
        automations,
        unlockedNodes,
        selectedNodeId,
        lastUnlockedNodeId,
        
        // Computed
        dataUnlocked,
        bandwidthUnlocked,
        canProcessData,
        highestTierReached,
        stats,
        
        // Methods
        selectNode,
        resetResources,
        resetNodes,
        setLastUnlockedNode
    };
}
