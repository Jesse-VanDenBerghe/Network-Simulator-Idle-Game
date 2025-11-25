// usePrestigeState Composable
// =============================
// Manages prestige state: quantum cores, upgrades, ascension

const { ref, reactive, computed } = Vue;

export function usePrestigeState() {
    // ==========================================
    // STATE
    // ==========================================
    const prestigeState = reactive({
        ascensionCount: 0,
        quantumCores: 0,
        totalCoresEarned: 0,
        upgrades: new Set(),
        statistics: {
            fastestClear: null,
            totalNodesEverUnlocked: 0,
            totalEnergyEverEarned: 0,
            runStartTime: Date.now()
        }
    });
    
    const showAscensionPanel = ref(false);

    // ==========================================
    // COMPUTED
    // ==========================================
    const prestigeBonuses = computed(() => getAccumulatedBonuses());

    // ==========================================
    // METHODS
    // ==========================================
    
    /**
     * Calculate quantum cores based on current progress
     */
    function calculateQuantumCores(totalResources, unlockedNodes) {
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
    function getAccumulatedBonuses() {
        const bonuses = {
            startingEnergy: 0,
            startingAutomation: { energy: 0, data: 0, bandwidth: 0 },
            startingNodes: new Set(['core']),
            costMultiplier: 1,
            automationMultiplier: 1,
            bonusEnergyPerClick: 0,
            coreMultiplier: 1,
            tierCostMultipliers: {}
        };
        
        for (const upgradeId of prestigeState.upgrades) {
            const upgrade = PrestigeData.upgrades[upgradeId];
            if (!upgrade) continue;
            
            const e = upgrade.effect;
            if (e.startingEnergy) bonuses.startingEnergy += e.startingEnergy;
            if (e.costMultiplier) bonuses.costMultiplier *= e.costMultiplier;
            if (e.automationMultiplier) bonuses.automationMultiplier *= e.automationMultiplier;
            if (e.bonusEnergyPerClick) bonuses.bonusEnergyPerClick += e.bonusEnergyPerClick;
            if (e.coreMultiplier) bonuses.coreMultiplier *= e.coreMultiplier;
            
            if (e.startingNodes) {
                e.startingNodes.forEach(nodeId => bonuses.startingNodes.add(nodeId));
            }
            
            if (e.startingAutomation) {
                Object.entries(e.startingAutomation).forEach(([resource, value]) => {
                    bonuses.startingAutomation[resource] += value;
                });
            }
            
            if (e.tierCostMultipliers) {
                Object.entries(e.tierCostMultipliers).forEach(([tier, mult]) => {
                    const t = parseInt(tier);
                    bonuses.tierCostMultipliers[t] = (bonuses.tierCostMultipliers[t] || 1) * mult;
                });
            }
            
            // Handle special upgrades
            if (e.startAllTier) {
                Object.values(GameData.nodes).forEach(node => {
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
    function purchaseUpgrade(upgradeId) {
        const upgrade = PrestigeData.upgrades[upgradeId];
        if (!upgrade) return false;
        
        // Check if already purchased
        if (prestigeState.upgrades.has(upgradeId)) return false;
        
        // Check requirements
        const requirementsMet = upgrade.requires.every(reqId => 
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
    function toggleAscensionPanel() {
        showAscensionPanel.value = !showAscensionPanel.value;
    }

    /**
     * Reset run start time
     */
    function resetRunTimer() {
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
