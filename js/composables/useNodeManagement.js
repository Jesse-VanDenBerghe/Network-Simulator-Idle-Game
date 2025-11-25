// useNodeManagement Composable
// ==============================
// Manages node operations: unlocking, affordability checks, applying effects

const { computed } = Vue;

export function useNodeManagement(gameState, prestigeState) {
    // ==========================================
    // COMPUTED
    // ==========================================
    const computedValues = computed(() => {
        let values = {
            energyPerClick: 1,
            dataPerClick: 1,
            dataMultiplier: 1,
            allRatesMultiplier: 1
        };

        // Apply prestige bonuses
        const bonuses = prestigeState.prestigeBonuses.value;
        values.energyPerClick += bonuses.bonusEnergyPerClick;

        gameState.unlockedNodes.value.forEach(nodeId => {
            const node = GameData.nodes[nodeId];
            if (!node) return;

            if (node.effects.energyPerClick) {
                values.energyPerClick += node.effects.energyPerClick;
            }
            if (node.effects.dataPerClick) {
                values.dataPerClick += node.effects.dataPerClick;
            }
            if (node.effects.dataMultiplier) {
                values.dataMultiplier *= node.effects.dataMultiplier;
            }
            if (node.effects.allRatesMultiplier) {
                values.allRatesMultiplier *= node.effects.allRatesMultiplier;
            }
        });

        return values;
    });

    const resourceRates = computed(() => {
        const bonuses = prestigeState.prestigeBonuses.value;
        return {
            energy: gameState.automations.energy * computedValues.value.allRatesMultiplier * bonuses.automationMultiplier,
            data: gameState.automations.data * computedValues.value.allRatesMultiplier * computedValues.value.dataMultiplier * bonuses.automationMultiplier,
            bandwidth: gameState.automations.bandwidth * computedValues.value.allRatesMultiplier * bonuses.automationMultiplier
        };
    });

    const dataPerClickDisplay = computed(() => {
        return Math.floor(computedValues.value.dataPerClick * computedValues.value.dataMultiplier);
    });

    const selectedNode = computed(() => {
        return gameState.selectedNodeId.value ? GameData.nodes[gameState.selectedNodeId.value] : null;
    });

    const isSelectedNodeUnlocked = computed(() => {
        return gameState.selectedNodeId.value ? gameState.unlockedNodes.value.has(gameState.selectedNodeId.value) : false;
    });

    const isSelectedNodeAvailable = computed(() => {
        if (!selectedNode.value || isSelectedNodeUnlocked.value) return false;
        
        // Check requirements
        const requirementsMet = selectedNode.value.requires.every(reqId => 
            gameState.unlockedNodes.value.has(reqId)
        );
        if (!requirementsMet) return false;

        // Check tier gate
        return GameData.isTierUnlocked(selectedNode.value.tier, gameState.unlockedNodes.value);
    });

    const canAffordSelectedNode = computed(() => {
        return checkAffordability(selectedNode.value);
    });

    const isTierLocked = computed(() => {
        if (!selectedNode.value) return false;
        return !GameData.isTierUnlocked(selectedNode.value.tier, gameState.unlockedNodes.value);
    });

    const tierGateRequirement = computed(() => {
        if (!selectedNode.value) return null;
        const gate = GameData.TIER_GATES[selectedNode.value.tier];
        if (!gate) return null;
        
        const count = GameData.countUnlockedInTier(gate.requiredTier, gameState.unlockedNodes.value);
        return {
            ...gate,
            currentCount: count,
            remaining: Math.max(0, gate.requiredCount - count)
        };
    });

    // ==========================================
    // METHODS
    // ==========================================
    
    /**
     * Check if a node is affordable
     */
    function checkAffordability(node) {
        if (!node) return false;
        const scaledCost = GameData.getScaledNodeCost(
            node,
            prestigeState.prestigeState.ascensionCount,
            prestigeState.prestigeBonuses.value
        );
        for (const [resource, amount] of Object.entries(scaledCost)) {
            if (gameState.resources[resource] < amount) return false;
        }
        return true;
    }

    /**
     * Generate energy (manual click)
     */
    function generateEnergy() {
        const amount = computedValues.value.energyPerClick;
        gameState.resources.energy += amount;
        gameState.totalResources.energy += amount;
    }

    /**
     * Process data (manual action)
     */
    function processData() {
        if (!gameState.canProcessData.value) return;
        gameState.resources.energy -= 5;
        const dataGain = Math.floor(computedValues.value.dataPerClick * computedValues.value.dataMultiplier);
        gameState.resources.data += dataGain;
        gameState.totalResources.data += dataGain;
    }

    /**
     * Unlock a node
     */
    function unlockNode(nodeId) {
        const node = GameData.nodes[nodeId];
        if (!node) return false;

        // Check requirements
        const requirementsMet = node.requires.every(reqId => 
            gameState.unlockedNodes.value.has(reqId)
        );
        if (!requirementsMet) return false;

        // Check tier gate
        if (!GameData.isTierUnlocked(node.tier, gameState.unlockedNodes.value)) return false;

        // Check cost
        if (!checkAffordability(node)) return false;

        const scaledCost = GameData.getScaledNodeCost(
            node,
            prestigeState.prestigeState.ascensionCount,
            prestigeState.prestigeBonuses.value
        );

        // Deduct costs
        for (const [resource, amount] of Object.entries(scaledCost)) {
            gameState.resources[resource] -= amount;
        }

        // Add to unlocked nodes (need to create new Set for reactivity)
        const newUnlocked = new Set(gameState.unlockedNodes.value);
        newUnlocked.add(nodeId);
        gameState.unlockedNodes.value = newUnlocked;

        // Apply effects
        applyNodeEffects(node);

        return true;
    }

    /**
     * Apply node effects (automation, unlocks, etc.)
     */
    function applyNodeEffects(node) {
        const effects = node.effects;

        // Add automation
        if (effects.automation) {
            gameState.automations[effects.automation.resource] += effects.automation.rate;
        }

        // Instant unlock (Zero Day effect)
        if (effects.instantUnlock) {
            const lockedAvailableNodes = Object.values(GameData.nodes).filter(n =>
                !gameState.unlockedNodes.value.has(n.id) &&
                n.requires.every(reqId => gameState.unlockedNodes.value.has(reqId))
            );
            if (lockedAvailableNodes.length > 0) {
                const randomNode = lockedAvailableNodes[Math.floor(Math.random() * lockedAvailableNodes.length)];
                const newUnlocked = new Set(gameState.unlockedNodes.value);
                newUnlocked.add(randomNode.id);
                gameState.unlockedNodes.value = newUnlocked;
                applyNodeEffects(randomNode);
            }
        }
    }

    /**
     * Apply starting bonuses from prestige upgrades
     */
    function applyStartingBonuses() {
        const bonuses = prestigeState.getAccumulatedBonuses();
        
        // Starting resources
        gameState.resources.energy = bonuses.startingEnergy || 0;
        gameState.totalResources.energy = bonuses.startingEnergy || 0;
        
        // Starting automation
        Object.entries(bonuses.startingAutomation).forEach(([resource, rate]) => {
            gameState.automations[resource] = rate;
        });
        
        // Starting nodes
        const newUnlocked = new Set(bonuses.startingNodes);
        
        // Handle random starting nodes
        if (bonuses.randomStartingNodes) {
            const { tier, count } = bonuses.randomStartingNodes;
            const tierNodes = Object.values(GameData.nodes).filter(n => 
                n.tier === tier && !newUnlocked.has(n.id)
            );
            const shuffled = tierNodes.sort(() => Math.random() - 0.5);
            shuffled.slice(0, count).forEach(node => newUnlocked.add(node.id));
        }
        
        gameState.unlockedNodes.value = newUnlocked;
        
        // Apply effects from starting nodes
        newUnlocked.forEach(nodeId => {
            const node = GameData.nodes[nodeId];
            if (node && node.id !== 'core') {
                applyNodeEffects(node);
            }
        });
    }

    // ==========================================
    // RETURN
    // ==========================================
    return {
        // Computed
        computedValues,
        resourceRates,
        dataPerClickDisplay,
        selectedNode,
        isSelectedNodeUnlocked,
        isSelectedNodeAvailable,
        canAffordSelectedNode,
        isTierLocked,
        tierGateRequirement,
        
        // Methods
        checkAffordability,
        generateEnergy,
        processData,
        unlockNode,
        applyNodeEffects,
        applyStartingBonuses
    };
}
