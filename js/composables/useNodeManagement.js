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
            energyPerClick: 0,
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

            // Get node level (default 1 for backward compatibility)
            const level = gameState.nodeLevels[nodeId] || 1;

            if (node.effects.energyPerClick) {
                values.energyPerClick += node.effects.energyPerClick * level;
            }
            if (node.effects.dataPerClick) {
                values.dataPerClick += node.effects.dataPerClick * level;
            }
            if (node.effects.dataMultiplier) {
                values.dataMultiplier *= Math.pow(node.effects.dataMultiplier, level);
            }
            if (node.effects.allRatesMultiplier) {
                values.allRatesMultiplier *= Math.pow(node.effects.allRatesMultiplier, level);
            }
        });

        return values;
    });

    const resourceRates = computed(() => {
        const bonuses = prestigeState.prestigeBonuses.value;
        return {
            energy: gameState.automations.energy * computedValues.value.allRatesMultiplier * bonuses.automationMultiplier,
            data: gameState.automations.data * computedValues.value.allRatesMultiplier * computedValues.value.dataMultiplier * bonuses.automationMultiplier
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
        if (!checkRequirements(selectedNode.value)) return false;

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
        return null;
    });

    // ==========================================
    // METHODS
    // ==========================================
    
    /**
     * Get current level of a node (0 = locked)
     */
    function getNodeLevel(nodeId) {
        return gameState.nodeLevels[nodeId] || 0;
    }

    /**
     * Check if all requirements for a node are met
     * Supports both string requirements ('node_id') and object requirements ({ id: 'node_id', level: 5 })
     */
    function checkRequirements(node) {
        return node.requires.every(req => {
            if (typeof req === 'string') {
                // Simple requirement: just check if unlocked
                return gameState.unlockedNodes.value.has(req);
            } else {
                // Object requirement: check id and level
                const reqId = req.id;
                const reqLevel = req.level || 1;
                if (!gameState.unlockedNodes.value.has(reqId)) return false;
                return getNodeLevel(reqId) >= reqLevel;
            }
        });
    }

    /**
     * Get max level for a node (default 1)
     */
    function getNodeMaxLevel(node) {
        return node?.maxLevel || 1;
    }

    /**
     * Check if a node can be upgraded (has more levels available)
     */
    function canUpgradeNode(node) {
        if (!node) return false;
        const currentLevel = getNodeLevel(node.id);
        const maxLevel = getNodeMaxLevel(node);
        return currentLevel > 0 && currentLevel < maxLevel;
    }

    /**
     * Check if a node is affordable at a given level
     */
    function checkAffordability(node, level = null) {
        if (!node) return false;
        const currentLevel = level !== null ? level : getNodeLevel(node.id);
        const scaledCost = GameData.getScaledNodeCost(
            node,
            prestigeState.prestigeState.ascensionCount,
            prestigeState.prestigeBonuses.value,
            currentLevel
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
     * Unlock or upgrade a node
     */
    function unlockNode(nodeId) {
        const node = GameData.nodes[nodeId];
        if (!node) return false;

        const currentLevel = getNodeLevel(nodeId);
        const maxLevel = getNodeMaxLevel(node);
        const isUpgrade = currentLevel > 0;

        // If already at max level, can't unlock/upgrade
        if (currentLevel >= maxLevel) return false;

        // For initial unlock, check requirements
        if (!isUpgrade) {
            if (!checkRequirements(node)) return false;

            // Check tier gate
            if (!GameData.isTierUnlocked(node.tier, gameState.unlockedNodes.value)) return false;
        }

        // Check cost
        if (!checkAffordability(node, currentLevel)) return false;

        const scaledCost = GameData.getScaledNodeCost(
            node,
            prestigeState.prestigeState.ascensionCount,
            prestigeState.prestigeBonuses.value,
            currentLevel
        );

        // Deduct costs
        for (const [resource, amount] of Object.entries(scaledCost)) {
            gameState.resources[resource] -= amount;
        }

        // Update level
        gameState.nodeLevels[nodeId] = currentLevel + 1;

        // Add to unlocked nodes if first unlock
        if (!isUpgrade) {
            const newUnlocked = new Set(gameState.unlockedNodes.value);
            newUnlocked.add(nodeId);
            gameState.unlockedNodes.value = newUnlocked;
        }

        // Apply effects
        applyNodeEffects(node, isUpgrade, currentLevel + 1);

        // Return node and new level for caller to handle effects like toast/narration
        return { node, newLevel: currentLevel + 1 };
    }

    /**
     * Apply node effects (automation, unlocks, etc.)
     * @param {Object} node - The node object
     * @param {boolean} isUpgrade - True if this is a level upgrade, not initial unlock
     * @param {number} newLevel - The new level of the node
     */
    function applyNodeEffects(node, isUpgrade = false, newLevel = 1) {
        const effects = node.effects;

        // Add automation (applied on each level)
        if (effects.automation) {
            gameState.automations[effects.automation.resource] += effects.automation.rate;
        }

        // These effects only apply on initial unlock
        if (!isUpgrade) {
            // Unlock branch
            if (effects.unlockBranch) {
                gameState.unlockBranch(effects.unlockBranch);
            }

            // Unlock features (data processing, etc.)
            if (effects.unlockDataProcessing) {
                gameState.unlockFeature('dataProcessing');
            }

            // Unlock data generation (auto-generates bits over time)
            if (effects.unlockDataGeneration) {
                gameState.dataGeneration.active = true;
            }

            // Data generation speed multiplier (reduces interval)
            if (effects.dataGenSpeedMultiplier) {
                gameState.dataGeneration.interval /= effects.dataGenSpeedMultiplier;
            }

            // Data generation amount bonus (adds to bitsPerTick)
            if (effects.dataGenAmountBonus) {
                gameState.dataGeneration.bitsPerTick += effects.dataGenAmountBonus;
            }

            // Instant unlock (Zero Day effect)
            if (effects.instantUnlock) {
                const lockedAvailableNodes = Object.values(GameData.nodes).filter(n =>
                    !gameState.unlockedNodes.value.has(n.id) &&
                    checkRequirements(n)
                );
                if (lockedAvailableNodes.length > 0) {
                    const randomNode = lockedAvailableNodes[Math.floor(Math.random() * lockedAvailableNodes.length)];
                    const newUnlocked = new Set(gameState.unlockedNodes.value);
                    newUnlocked.add(randomNode.id);
                    gameState.unlockedNodes.value = newUnlocked;
                    applyNodeEffects(randomNode);
                }
            }

            // Disable crank (manual energy button)
            if (effects.disableCrank) {
                gameState.crankDisabled.value = true;
            }

            // Unlock energy generation (auto-generates energy over time)
            if (effects.unlockEnergyGeneration) {
                gameState.energyGeneration.active = true;
                if (effects.energyGenRate) {
                    gameState.energyGeneration.energyPerTick = effects.energyGenRate;
                }
                if (effects.energyGenInterval) {
                    gameState.energyGeneration.interval = effects.energyGenInterval;
                }
            }
        }

        if (effects.dataGenAmountBonus) {
            gameState.dataGeneration.bitsPerTick += effects.dataGenAmountBonus;
        }

        // Apply level-specific effects
        if (effects.levelEffects && effects.levelEffects[newLevel]) {
            const levelEffect = effects.levelEffects[newLevel];
            
            if (levelEffect.disableCrank) {
                gameState.crankDisabled.value = true;
            }
            
            if (levelEffect.unlockEnergyGeneration) {
                gameState.energyGeneration.active = true;
                if (levelEffect.energyGenRate) {
                    gameState.energyGeneration.energyPerTick = levelEffect.energyGenRate;
                }
                if (levelEffect.energyGenInterval) {
                    gameState.energyGeneration.interval = levelEffect.energyGenInterval;
                }
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
            if (node && node.id !== 'old_shed') {
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
        applyStartingBonuses,
        getNodeLevel,
        getNodeMaxLevel,
        canUpgradeNode
    };
}
