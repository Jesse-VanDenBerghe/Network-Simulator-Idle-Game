// useGameState Composable
// ========================
// Manages core game state: resources, automations, unlocked nodes

import { ref, reactive, computed, type Ref, type ComputedRef } from 'vue';
import type { 
    ResourceAmounts, 
    AutomationRates, 
    DataGeneration, 
    EnergyGeneration 
} from '@network-simulator/shared/types/game';
import GameData from '@/core/gameData';

/**
 * Game statistics computed values
 */
interface GameStats {
    nodesUnlocked: number;
    totalEnergy: number;
    totalData: number;
}

/**
 * Return type for useGameState composable
 */
export interface UseGameStateReturn {
    // State
    resources: ResourceAmounts;
    totalResources: ResourceAmounts;
    automations: AutomationRates;
    unlockedNodes: Ref<Set<string>>;
    nodeLevels: Record<string, number>;
    unlockedBranches: Ref<Set<string>>;
    unlockedFeatures: Ref<Set<string>>;
    selectedNodeId: Ref<string | null>;
    lastUnlockedNodeId: Ref<string | null>;
    dataGeneration: DataGeneration;
    energyGeneration: EnergyGeneration;
    isCrankBroken: Ref<boolean>;
    isCrankAutomated: Ref<boolean>;
    
    // Computed
    isDataUnlocked: ComputedRef<boolean>;
    canProcessData: ComputedRef<boolean>;
    highestTierReached: ComputedRef<number>;
    maxDataCapacity: ComputedRef<number>;
    stats: ComputedRef<GameStats>;
    
    // Methods
    selectNode: (nodeId: string | null) => void;
    resetResources: () => void;
    resetNodes: () => void;
    unlockBranch: (branch: string) => void;
    unlockFeature: (feature: string) => void;
    setLastUnlockedNode: (nodeId: string) => void;
}

export function useGameState(): UseGameStateReturn {
    // ==========================================
    // STATE
    // ==========================================
    const resources = reactive<ResourceAmounts>({
        energy: 0,
        data: 0
    });

    const totalResources = reactive<ResourceAmounts>({
        energy: 0,
        data: 0
    });

    const automations = reactive<AutomationRates>({
        energy: 0,
        data: 0
    });

    const unlockedNodes = ref<Set<string>>(new Set(['old_shed']));
    const nodeLevels = reactive<Record<string, number>>({}); // Track levels for each node (0=locked, 1+=unlocked)
    const unlockedBranches = ref<Set<string>>(new Set(['energy'])); // Explicit branch tracking
    const unlockedFeatures = ref<Set<string>>(new Set()); // Features unlocked via effects (dataProcessing, etc.)
    const selectedNodeId = ref<string | null>(null);
    const lastUnlockedNodeId = ref<string | null>(null);

    const dataGeneration = reactive<DataGeneration>({
        active: false,
        progress: 0, // 0-100%
        interval: 20000, // 20 seconds default
        bitsPerTick: 1,
        energyCost: 1,
        baseCapacity: 1028, // Base max data capacity
        capacityBonus: 0   // Bonus from upgrades
    });

    const energyGeneration = reactive<EnergyGeneration>({
        active: false,
        progress: 0, // 0-100%
        interval: 1000, // 1 second default
        energyPerTick: 1
    });

    const isCrankBroken = ref<boolean>(false);
    const isCrankAutomated = ref<boolean>(false);

    // ==========================================
    // COMPUTED
    // ==========================================
    const maxDataCapacity = computed<number>(() => {
        return dataGeneration.baseCapacity + dataGeneration.capacityBonus;
    });

    const isDataUnlocked = computed<boolean>(() => {
        return unlockedFeatures.value.has('dataProcessing');
    });

    const canProcessData = computed<boolean>(() => {
        return isDataUnlocked.value && resources.energy >= 5;
    });

    const highestTierReached = computed<number>(() => {
        let maxTier = 0;
        unlockedNodes.value.forEach(nodeId => {
            const node = GameData.nodes[nodeId];
            if (node && node.tier > maxTier) {
                maxTier = node.tier;
            }
        });
        return maxTier;
    });

    const stats = computed<GameStats>(() => ({
        nodesUnlocked: unlockedNodes.value.size,
        totalEnergy: totalResources.energy,
        totalData: totalResources.data
    }));

    // ==========================================
    // METHODS
    // ==========================================
    
    /**
     * Select a node for viewing in the info panel
     * @param nodeId - The node ID to select, or null to deselect
     */
    function selectNode(nodeId: string | null): void {
        selectedNodeId.value = nodeId;
    }

    /**
     * Reset all resources and automations to zero
     */
    function resetResources(): void {
        Object.keys(resources).forEach(k => resources[k as keyof ResourceAmounts] = 0);
        Object.keys(totalResources).forEach(k => totalResources[k as keyof ResourceAmounts] = 0);
        Object.keys(automations).forEach(k => automations[k as keyof AutomationRates] = 0);
    }

    /**
     * Reset all node-related state to initial values (for ascension)
     */
    function resetNodes(): void {
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
        dataGeneration.baseCapacity = 100;
        dataGeneration.capacityBonus = 0;
        // Reset energy generation
        energyGeneration.active = false;
        energyGeneration.progress = 0;
        energyGeneration.interval = 1000;
        energyGeneration.energyPerTick = 1;
        isCrankBroken.value = false;
        isCrankAutomated.value = false;
    }

    /**
     * Unlock a branch for node visibility
     * @param branch - The branch name to unlock
     */
    function unlockBranch(branch: string): void {
        if (!unlockedBranches.value.has(branch)) {
            const newBranches = new Set(unlockedBranches.value);
            newBranches.add(branch);
            unlockedBranches.value = newBranches;
        }
    }

    /**
     * Unlock a game feature (e.g., 'dataProcessing')
     * @param feature - The feature name to unlock
     */
    function unlockFeature(feature: string): void {
        if (!unlockedFeatures.value.has(feature)) {
            const newFeatures = new Set(unlockedFeatures.value);
            newFeatures.add(feature);
            unlockedFeatures.value = newFeatures;
        }
    }

    /**
     * Set the last unlocked node for animation purposes
     * @param nodeId - The node ID that was just unlocked
     */
    function setLastUnlockedNode(nodeId: string): void {
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
        isCrankBroken,
        isCrankAutomated,
        
        // Computed
        isDataUnlocked,
        canProcessData,
        highestTierReached,
        maxDataCapacity,
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
