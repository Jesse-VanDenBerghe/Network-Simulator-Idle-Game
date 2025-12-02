// useNodeManagement Composable
// ==============================
// Manages node operations: unlocking, affordability checks, applying effects

import { computed, type ComputedRef } from 'vue';
import type { Node, NodeEffects } from '@/types/node';
import type { ResourceAmounts } from '@/types/game';
import type { UseGameStateReturn } from './useGameState';
import type { UsePrestigeStateReturn } from './usePrestigeState';
import type { EventMap } from '@/types/event';

// TODO: Import from @/core/gameData once migrated in Phase 7
declare const GameData: any;

/**
 * Computed values from unlocked nodes
 */
interface ComputedNodeValues {
    energyPerClick: number;
    dataPerClick: number;
    dataMultiplier: number;
    allRatesMultiplier: number;
}

/**
 * Resource generation rates
 */
interface ResourceRates {
    energy: number;
    data: number;
    energyPerClick: number;
}

/**
 * Event bus interface (minimal typing)
 */
interface EventBus {
    on<K extends keyof EventMap>(eventName: K, callback: (data: EventMap[K]) => void): () => void;
    emit<K extends keyof EventMap>(eventName: K, data: EventMap[K]): void;
}

/**
 * Unlock result
 */
interface UnlockResult {
    node: Node;
    newLevel: number;
}

/**
 * Return type for useNodeManagement composable
 */
export interface UseNodeManagementReturn {
    // Computed
    computedValues: ComputedRef<ComputedNodeValues>;
    resourceRates: ComputedRef<ResourceRates>;
    dataPerClickDisplay: ComputedRef<number>;
    selectedNode: ComputedRef<Node | null>;
    isSelectedNodeUnlocked: ComputedRef<boolean>;
    isSelectedNodeAvailable: ComputedRef<boolean>;
    canAffordSelectedNode: ComputedRef<boolean>;
    isTierLocked: ComputedRef<boolean>;
    tierGateRequirement: ComputedRef<null>;
    
    // Methods
    checkAffordability: (node: Node | null, level?: number | null) => boolean;
    generateEnergy: () => void;
    processData: () => void;
    unlockNode: (nodeId: string) => UnlockResult | false;
    applyNodeEffects: (node: Node, isUpgrade?: boolean, newLevel?: number) => void;
    applyStartingBonuses: () => void;
    getNodeLevel: (nodeId: string) => number;
    getNodeMaxLevel: (node: Node) => number;
    canUpgradeNode: (node: Node | null) => boolean;
}

export function useNodeManagement(
    gameState: UseGameStateReturn,
    prestigeState: UsePrestigeStateReturn,
    eventBus: EventBus,
    nodes: Record<string, Node>
): UseNodeManagementReturn {
    // ==========================================
    // COMPUTED
    // ==========================================
    const computedValues = computed<ComputedNodeValues>(() => {
        const values: ComputedNodeValues = {
            energyPerClick: 0,
            dataPerClick: 1,
            dataMultiplier: 1,
            allRatesMultiplier: 1
        };

        // Apply prestige bonuses
        const bonuses = prestigeState.prestigeBonuses.value;
        values.energyPerClick += bonuses.bonusEnergyPerClick;

        gameState.unlockedNodes.value.forEach(nodeId => {
            const node = nodes[nodeId];
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

    const resourceRates = computed<ResourceRates>(() => {
        const bonuses = prestigeState.prestigeBonuses.value;
        return {
            energy: gameState.automations.energy * computedValues.value.allRatesMultiplier * bonuses.automationMultiplier,
            data: gameState.automations.data * computedValues.value.allRatesMultiplier * computedValues.value.dataMultiplier * bonuses.automationMultiplier,
            energyPerClick: computedValues.value.energyPerClick
        };
    });

    const dataPerClickDisplay = computed<number>(() => {
        return Math.floor(computedValues.value.dataPerClick * computedValues.value.dataMultiplier);
    });

    const selectedNode = computed<Node | null>(() => {
        return gameState.selectedNodeId.value ? nodes[gameState.selectedNodeId.value] : null;
    });

    const isSelectedNodeUnlocked = computed<boolean>(() => {
        return gameState.selectedNodeId.value ? gameState.unlockedNodes.value.has(gameState.selectedNodeId.value) : false;
    });

    const isSelectedNodeAvailable = computed<boolean>(() => {
        if (!selectedNode.value || isSelectedNodeUnlocked.value) return false;
        
        // Check requirements
        if (!checkRequirements(selectedNode.value)) return false;

        // Check tier gate
        return GameData.isTierUnlocked(selectedNode.value.tier, gameState.unlockedNodes.value);
    });

    const canAffordSelectedNode = computed<boolean>(() => {
        return checkAffordability(selectedNode.value);
    });

    const isTierLocked = computed<boolean>(() => {
        if (!selectedNode.value) return false;
        return !GameData.isTierUnlocked(selectedNode.value.tier, gameState.unlockedNodes.value);
    });

    const tierGateRequirement = computed<null>(() => {
        return null;
    });

    // ==========================================
    // METHODS
    // ==========================================
    
    /**
     * Get current level of a node (0 = locked)
     */
    function getNodeLevel(nodeId: string): number {
        return gameState.nodeLevels[nodeId] || 0;
    }

    /**
     * Check if all requirements for a node are met
     * Supports both string requirements ('node_id') and object requirements ({ id: 'node_id', level: 5 })
     */
    function checkRequirements(node: Node): boolean {
        if (!node?.requires || !Array.isArray(node.requires)) return true;
        
        return node.requires.every(req => {
            if (typeof req === 'string') {
                // Simple requirement: just check if unlocked
                return gameState.unlockedNodes.value.has(req);
            } else if (req && typeof req === 'object' && 'id' in req) {
                // Object requirement: check id and level
                const reqId = req.id;
                const reqLevel = req.level || 1;
                if (!gameState.unlockedNodes.value.has(reqId)) return false;
                return getNodeLevel(reqId) >= reqLevel;
            } else {
                // Malformed requirement - log and skip
                console.warn('Invalid requirement format:', req);
                return false;
            }
        });
    }

    /**
     * Get max level for a node (default 1)
     */
    function getNodeMaxLevel(node: Node): number {
        return node?.maxLevel || 1;
    }

    /**
     * Check if a node can be upgraded (has more levels available)
     */
    function canUpgradeNode(node: Node | null): boolean {
        if (!node) return false;
        const currentLevel = getNodeLevel(node.id);
        const maxLevel = getNodeMaxLevel(node);
        return currentLevel > 0 && currentLevel < maxLevel;
    }

    /**
     * Check if a node is affordable at a given level
     */
    function checkAffordability(node: Node | null, level: number | null = null): boolean {
        if (!node) return false;
        const currentLevel = level !== null ? level : getNodeLevel(node.id);
        const scaledCost = GameData.getScaledNodeCost(node, {
            ascensionCount: prestigeState.prestigeState.ascensionCount,
            prestigeBonuses: prestigeState.prestigeBonuses.value,
            currentLevel
        });
        for (const [resource, amount] of Object.entries(scaledCost)) {
            if (gameState.resources[resource as keyof ResourceAmounts] < (amount as number)) return false;
        }
        return true;
    }

    /**
     * Generate energy (manual click)
     */
    function generateEnergy(): void {
        const amount = computedValues.value.energyPerClick;
        gameState.resources.energy += amount;
        gameState.totalResources.energy += amount;
    }

    /**
     * Process data (manual action)
     */
    function processData(): void {
        if (!gameState.canProcessData.value) return;
        // Don't process if at capacity
        if (gameState.resources.data >= gameState.maxDataCapacity.value) return;
        gameState.resources.energy -= 5;
        const dataGain = Math.floor(computedValues.value.dataPerClick * computedValues.value.dataMultiplier);
        gameState.resources.data += dataGain;
        gameState.totalResources.data += dataGain;
        // Cap at max capacity
        if (gameState.resources.data > gameState.maxDataCapacity.value) {
            gameState.resources.data = gameState.maxDataCapacity.value;
        }
    }

    /**
     * Unlock or upgrade a node
     */
    function unlockNode(nodeId: string): UnlockResult | false {
        const node = nodes[nodeId];
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

        const scaledCost = GameData.getScaledNodeCost(node, {
            ascensionCount: prestigeState.prestigeState.ascensionCount,
            prestigeBonuses: prestigeState.prestigeBonuses.value,
            currentLevel
        });

        // Deduct costs
        for (const [resource, amount] of Object.entries(scaledCost)) {
            gameState.resources[resource as keyof ResourceAmounts] -= (amount as number);
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

        // Emit event for listeners (gameLoop, etc.)
        eventBus.emit('nodeUnlocked', { 
            nodeId,
            node, 
            level: currentLevel + 1
        });

        // Return node and new level for caller to handle effects like toast/narration
        return { node, newLevel: currentLevel + 1 };
    }

    /**
     * Effect handlers - each handler is testable & reusable
     * Each handler applies one effect type to gameState
     */
    const EffectRegistry = {
        automation: (effects: NodeEffects) => {
            if (effects.automation) {
                gameState.automations[effects.automation.resource] += effects.automation.rate;
            }
        },

        unlockBranch: (effects: NodeEffects) => {
            if (effects.unlockBranch) {
                gameState.unlockBranch(effects.unlockBranch);
                eventBus.emit('branchUnlocked', { branch: effects.unlockBranch });
            }
        },

        unlockDataProcessing: (effects: NodeEffects) => {
            if (effects.unlockDataProcessing) {
                gameState.unlockFeature('dataProcessing');
                eventBus.emit('featureUnlocked', { feature: 'dataProcessing' });
            }
        },

        unlockDataGeneration: (effects: NodeEffects) => {
            if (effects.unlockDataGeneration) {
                gameState.dataGeneration.active = true;
            }
        },

        dataGenSpeedMultiplier: (effects: NodeEffects) => {
            if (effects.dataGenSpeedMultiplier) {
                gameState.dataGeneration.interval /= effects.dataGenSpeedMultiplier;
            }
        },

        dataGenAmountBonus: (effects: NodeEffects) => {
            if (effects.dataGenAmountBonus) {
                gameState.dataGeneration.bitsPerTick += effects.dataGenAmountBonus;
            }
        },

        maxDataCapacityBonus: (effects: NodeEffects) => {
            if (effects.maxDataCapacityBonus) {
                gameState.dataGeneration.capacityBonus += effects.maxDataCapacityBonus;
            }
        },

        maxDataCapacityMultiplier: (effects: NodeEffects & { maxDataCapacityMultiplier?: number }) => {
            if (effects.maxDataCapacityMultiplier) {
                gameState.dataGeneration.capacityBonus *= effects.maxDataCapacityMultiplier;
            }
        },

        instantUnlock: (effects: NodeEffects & { instantUnlock?: boolean }) => {
            if (effects.instantUnlock) {
                const lockedAvailableNodes = Object.values(nodes).filter(n =>
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
        },

        breakCrank: (effects: NodeEffects) => {
            if (effects.breakCrank) {
                gameState.isCrankBroken.value = true;
            }
        },

        automateCrank: (effects: NodeEffects) => {
            if (effects.automateCrank) {
                gameState.isCrankBroken.value = false; // Repairs the crank
                gameState.isCrankAutomated.value = true;
            }
        },

        unlockEnergyGeneration: (effects: NodeEffects & { unlockEnergyGeneration?: boolean; energyGenRate?: number; energyGenInterval?: number }) => {
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
    };

    /**
     * Apply node effects via registry
     * @param node - The node object
     * @param isUpgrade - True if this is a level upgrade, not initial unlock
     * @param newLevel - The new level of the node
     */
    function applyNodeEffects(node: Node, isUpgrade: boolean = false, newLevel: number = 1): void {
        const effects = node.effects;

        // Apply all effects from registry (automation applies always, others only on first unlock)
        EffectRegistry.automation(effects);

        if (!isUpgrade) {
            EffectRegistry.unlockBranch(effects);
            EffectRegistry.unlockDataProcessing(effects);
            EffectRegistry.unlockDataGeneration(effects);
            EffectRegistry.dataGenSpeedMultiplier(effects);
            EffectRegistry.dataGenAmountBonus(effects);
            EffectRegistry.maxDataCapacityBonus(effects);
            EffectRegistry.instantUnlock(effects);
            EffectRegistry.breakCrank(effects);
            EffectRegistry.automateCrank(effects);
            EffectRegistry.unlockEnergyGeneration(effects);
        } else {
            // On upgrade, still apply bonus effects
            EffectRegistry.dataGenSpeedMultiplier(effects);
            EffectRegistry.dataGenAmountBonus(effects);
            EffectRegistry.maxDataCapacityBonus(effects);
        }

        // Apply level-specific effects (only triggers at that exact level)
        if (effects.levelEffects && effects.levelEffects[newLevel]) {
            applyEffectSet(effects.levelEffects[newLevel]);
        }
    }

    /**
     * Apply a set of effects using all effect handlers
     * @param effectSet - The effect set object containing effect properties
     */
    function applyEffectSet(effectSet: any): void {
        Object.values(EffectRegistry).forEach(handler => handler(effectSet));
    }

    /**
     * Apply starting bonuses from prestige upgrades (called on new game/ascension)
     */
    function applyStartingBonuses(): void {
        const bonuses = prestigeState.getAccumulatedBonuses();
        
        // Starting resources
        gameState.resources.energy = bonuses.startingEnergy || 0;
        gameState.totalResources.energy = bonuses.startingEnergy || 0;
        
        // Starting automation
        Object.entries(bonuses.startingAutomation).forEach(([resource, rate]) => {
            gameState.automations[resource as keyof ResourceAmounts] = rate;
        });
        
        // Starting nodes
        const newUnlocked = new Set(bonuses.startingNodes);
        
        // Handle random starting nodes
        if (bonuses.randomStartingNodes) {
            const { tier, count } = bonuses.randomStartingNodes;
            const tierNodes = Object.values(nodes).filter(n => 
                n.tier === tier && !newUnlocked.has(n.id)
            );
            const shuffled = tierNodes.sort(() => Math.random() - 0.5);
            shuffled.slice(0, count).forEach(node => newUnlocked.add(node.id));
        }
        
        gameState.unlockedNodes.value = newUnlocked;
        
        // Apply effects from starting nodes
        newUnlocked.forEach(nodeId => {
            const node = nodes[nodeId];
            if (node && node.id !== 'old_shed') {
                applyNodeEffects(node);
            }
        });
        
        // Emit updated rates after applying bonuses
        eventBus.emit('resourceRatesChanged', resourceRates.value);
    }

    // ==========================================
    // EVENT SUBSCRIPTIONS
    // ==========================================
    
    // Handle unlock requests from gameLoop
    eventBus.on('requestUnlockNode', ({ nodeId }) => {
        unlockNode(nodeId);
        // nodeUnlocked event is already emitted in unlockNode()
    });
    
    // Handle rate requests
    eventBus.on('requestResourceRates', () => {
        eventBus.emit('resourceRatesChanged', resourceRates.value);
    });
    
    // Handle starting bonus requests (for ascension)
    eventBus.on('requestStartingBonuses', () => {
        applyStartingBonuses();
    });

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
