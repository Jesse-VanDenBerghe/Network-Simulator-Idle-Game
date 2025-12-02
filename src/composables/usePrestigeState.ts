// usePrestigeState Composable
// =============================
// Manages prestige state: quantum cores, upgrades, ascension

import { ref, reactive, computed, type Ref, type ComputedRef } from 'vue';
import type { PrestigeState, PrestigeBonuses, ResourceAmounts } from '@/types/game';
import type { Node } from '@/types/node';
import { prestigeUpgrades } from '@/data/prestigeData';
import GameData from '@/core/gameData';

/**
 * Random starting nodes configuration
 */
interface RandomStartingNodes {
    tier: number;
    count: number;
}

/**
 * Extended prestige bonuses with additional properties
 */
interface ExtendedPrestigeBonuses extends PrestigeBonuses {
    startingEnergy: number;
    startingAutomation: Record<string, number>;
    startingNodes: Set<string>;
    costMultiplier: number;
    automationMultiplier: number;
    bonusEnergyPerClick: number;
    coreMultiplier: number;
    tierCostMultipliers: Record<number, number>;
    randomStartingNodes?: RandomStartingNodes;
}

/**
 * Return type for usePrestigeState composable
 */
export interface UsePrestigeStateReturn {
    // State
    prestigeState: PrestigeState;
    showAscensionPanel: Ref<boolean>;
    
    // Computed
    prestigeBonuses: ComputedRef<ExtendedPrestigeBonuses>;
    
    // Methods
    calculateQuantumCores: (totalResources: ResourceAmounts, unlockedNodes: Set<string>) => number;
    getAccumulatedBonuses: () => ExtendedPrestigeBonuses;
    purchaseUpgrade: (upgradeId: string) => boolean;
    toggleAscensionPanel: () => void;
    resetRunTimer: () => void;
}

export function usePrestigeState(): UsePrestigeStateReturn {
    // ==========================================
    // STATE
    // ==========================================
    const prestigeState = reactive<PrestigeState>({
        ascensionCount: 0,
        quantumCores: 0,
        totalCoresEarned: 0,
        upgrades: new Set<string>(),
        statistics: {
            fastestClear: null,
            totalNodesEverUnlocked: 0,
            totalEnergyEverEarned: 0,
            runStartTime: Date.now()
        }
    });
    
    const showAscensionPanel = ref<boolean>(false);

    // ==========================================
    // COMPUTED
    // ==========================================
    const prestigeBonuses = computed<ExtendedPrestigeBonuses>(() => getAccumulatedBonuses());

    // ==========================================
    // METHODS
    // ==========================================
    
    /**
     * Calculate quantum cores based on current progress
     */
    function calculateQuantumCores(totalResources: ResourceAmounts, unlockedNodes: Set<string>): number {
        const energyLog = Math.max(0, Math.log10(totalResources.energy + 1));
        const nodeBonus = unlockedNodes.size / 10;
        
        // Tier bonuses
        let tierBonus = 0;
        for (const nodeId of unlockedNodes) {
            const node = GameData.nodes[nodeId];
            if (node && node.tier >= 6) {
                tierBonus += (node.tier - 5) * 5;
            }
            if (node && node.id === 'universe_simulation') {
                tierBonus += 20;
            }
        }
        
        // Core multiplier from upgrades
        const multiplier = prestigeBonuses.value.coreMultiplier;
        
        return Math.floor((energyLog + nodeBonus + tierBonus) * multiplier);
    }

    /**
     * Get accumulated bonuses from all purchased upgrades
     */
    function getAccumulatedBonuses(): ExtendedPrestigeBonuses {
        const bonuses: ExtendedPrestigeBonuses = {
            startingEnergy: 0,
            startingAutomation: { energy: 0, data: 0, bandwidth: 0 },
            startingNodes: new Set(['old_shed']),
            costMultiplier: 1,
            automationMultiplier: 1,
            bonusEnergyPerClick: 0,
            coreMultiplier: 1,
            tierCostMultipliers: {},
            clickPower: 1,
            automation: 1,
            costReduction: 0,
            dataCapacity: 1,
            specialEffects: {}
        };
        
        for (const upgradeId of prestigeState.upgrades) {
            const upgrade = prestigeUpgrades[upgradeId];
            if (!upgrade) continue;
            
            const e = upgrade.effect;
            if (e.startingEnergy) bonuses.startingEnergy += e.startingEnergy;
            if (e.costMultiplier) bonuses.costMultiplier *= e.costMultiplier;
            if (e.automationMultiplier) bonuses.automationMultiplier *= e.automationMultiplier;
            if (e.bonusEnergyPerClick) bonuses.bonusEnergyPerClick += e.bonusEnergyPerClick;
            if (e.coreMultiplier) bonuses.coreMultiplier *= e.coreMultiplier;
            
            if (e.startingNodes) {
                e.startingNodes.forEach((nodeId: string) => bonuses.startingNodes.add(nodeId));
            }
            
            if (e.startingAutomation) {
                Object.entries(e.startingAutomation).forEach(([resource, value]) => {
                    bonuses.startingAutomation[resource] += value as number;
                });
            }
            
            if (e.tierCostMultipliers) {
                Object.entries(e.tierCostMultipliers).forEach(([tier, mult]) => {
                    const t = parseInt(tier);
                    bonuses.tierCostMultipliers[t] = (bonuses.tierCostMultipliers[t] || 1) * (mult as number);
                });
            }
            
            // Handle special upgrades
            if (e.startAllTier) {
                (Object.values(GameData.nodes) as Node[]).forEach((node) => {
                    if (node.tier === e.startAllTier) {
                        bonuses.startingNodes.add(node.id);
                    }
                });
            }
            
            if (e.randomStartingNodes) {
                bonuses.randomStartingNodes = e.randomStartingNodes;
            }
        }
        
        return bonuses;
    }

    /**
     * Purchase an upgrade with quantum cores
     */
    function purchaseUpgrade(upgradeId: string): boolean {
        const upgrade = prestigeUpgrades[upgradeId];
        if (!upgrade) return false;
        
        // Check if already purchased
        if (prestigeState.upgrades.has(upgradeId)) return false;
        
        // Check requirements
        const requirementsMet = upgrade.requires.every((reqId: string) => 
            prestigeState.upgrades.has(reqId)
        );
        if (!requirementsMet) return false;
        
        // Check cost
        if (prestigeState.quantumCores < upgrade.cost) return false;
        
        // Deduct cost
        prestigeState.quantumCores -= upgrade.cost;
        
        // Add upgrade
        const newUpgrades = new Set(prestigeState.upgrades);
        newUpgrades.add(upgradeId);
        prestigeState.upgrades = newUpgrades;
        
        return true;
    }

    /**
     * Toggle ascension panel visibility
     */
    function toggleAscensionPanel(): void {
        showAscensionPanel.value = !showAscensionPanel.value;
    }

    /**
     * Reset run start time
     */
    function resetRunTimer(): void {
        prestigeState.statistics.runStartTime = Date.now();
    }

    // ==========================================
    // RETURN
    // ==========================================
    return {
        // State
        prestigeState,
        showAscensionPanel,
        
        // Computed
        prestigeBonuses,
        
        // Methods
        calculateQuantumCores,
        getAccumulatedBonuses,
        purchaseUpgrade,
        toggleAscensionPanel,
        resetRunTimer
    };
}
