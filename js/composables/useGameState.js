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
        data: 0
    });

    const totalResources = reactive({
        energy: 0,
        data: 0
    });

    const automations = reactive({
        energy: 0,
        data: 0
    });

    const unlockedNodes = ref(new Set(['old_shed']));
    const nodeLevels = reactive({}); // Track levels for each node (0=locked, 1+=unlocked)
    const unlockedBranches = ref(new Set(['energy'])); // Explicit branch tracking
    const unlockedFeatures = ref(new Set()); // Features unlocked via effects (dataProcessing, etc.)
    const selectedNodeId = ref(null);
    const lastUnlockedNodeId = ref(null);

    const dataGeneration = reactive({
        active: false,
        progress: 0, // 0-100%
        interval: 20000, // 20 seconds default
        bitsPerTick: 1,
        energyCost: 1
    });

    const energyGeneration = reactive({
        active: false,
        progress: 0, // 0-100%
        interval: 1000, // 1 second default
        energyPerTick: 1
    });

    const isCrankDisabled = ref(false);

    // ==========================================
    // COMPUTED
    // ==========================================
    const isDataUnlocked = computed(() => {
        return unlockedFeatures.value.has('dataProcessing');
    });

    const canProcessData = computed(() => {
        return isDataUnlocked.value && resources.energy >= 5;
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
    
    /**
     * Select a node for viewing in the info panel
     * @param {string|null} nodeId - The node ID to select, or null to deselect
     */
    function selectNode(nodeId) {
        selectedNodeId.value = nodeId;
    }

    /**
     * Reset all resources and automations to zero
     */
    function resetResources() {
        Object.keys(resources).forEach(k => resources[k] = 0);
        Object.keys(totalResources).forEach(k => totalResources[k] = 0);
        Object.keys(automations).forEach(k => automations[k] = 0);
    }

    /**
     * Reset all node-related state to initial values (for ascension)
     */
    function resetNodes() {
        unlockedNodes.value = new Set(['old_shed']);
        // Reset node levels
        Object.keys(nodeLevels).forEach(k => delete nodeLevels[k]);
        unlockedBranches.value = new Set(['energy']);
        unlockedFeatures.value = new Set();
        // Reset data generation
        dataGeneration.active = false;
        dataGeneration.progress = 0;
        dataGeneration.interval = 20000;
        dataGeneration.bitsPerTick = 1;
        dataGeneration.energyCost = 1;
        // Reset energy generation
        energyGeneration.active = false;
        energyGeneration.progress = 0;
        energyGeneration.interval = 1000;
        energyGeneration.energyPerTick = 1;
        isCrankDisabled.value = false;
    }

    /**
     * Unlock a branch for node visibility
     * @param {string} branch - The branch name to unlock
     */
    function unlockBranch(branch) {
        if (!unlockedBranches.value.has(branch)) {
            const newBranches = new Set(unlockedBranches.value);
            newBranches.add(branch);
            unlockedBranches.value = newBranches;
        }
    }

    /**
     * Unlock a game feature (e.g., 'dataProcessing')
     * @param {string} feature - The feature name to unlock
     */
    function unlockFeature(feature) {
        if (!unlockedFeatures.value.has(feature)) {
            const newFeatures = new Set(unlockedFeatures.value);
            newFeatures.add(feature);
            unlockedFeatures.value = newFeatures;
        }
    }

    /**
     * Set the last unlocked node for animation purposes
     * @param {string} nodeId - The node ID that was just unlocked
     */
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
        nodeLevels,
        unlockedBranches,
        unlockedFeatures,
        selectedNodeId,
        lastUnlockedNodeId,
        dataGeneration,
        energyGeneration,
        isCrankDisabled,
        
        // Computed
        isDataUnlocked,
        canProcessData,
        highestTierReached,
        stats,
        
        // Methods
        selectNode,
        resetResources,
        resetNodes,
        unlockBranch,
        unlockFeature,
        setLastUnlockedNode
    };
}
