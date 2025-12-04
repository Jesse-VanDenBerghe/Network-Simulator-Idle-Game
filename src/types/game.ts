// Game State Type Definitions
// ============================

/**
 * Resource identifier type
 */
export type ResourceId = 'energy' | 'data';

/**
 * Resource definition with display properties
 */
export interface Resource {
    id: ResourceId;
    name: string;
    icon: string;
    color: string;
}

/**
 * Resource amounts (dynamic values)
 */
export interface ResourceAmounts {
    energy: number;
    data: number;
    [key: string]: number;
}

/**
 * Automation rates per resource
 */
export interface AutomationRates {
    energy: number;
    data: number;
    [key: string]: number;
}

/**
 * Data generation state
 */
export interface DataGeneration {
    active: boolean;
    progress: number; // 0-100%
    interval: number; // milliseconds
    bitsPerTick: number;
    energyCost: number;
    baseCapacity: number;
    capacityBonus: number;
}

/**
 * Energy generation state
 */
export interface EnergyGeneration {
    active: boolean;
    progress: number; // 0-100%
    interval: number; // milliseconds
    energyPerTick: number;
}

/**
 * Game statistics tracking
 */
export interface GameStatistics {
    nodesUnlocked: number;
    totalEnergyGenerated: number;
    totalDataProcessed: number;
    cranksPerformed: number;
    highestTier: number;
}

/**
 * Main game state
 */
export interface GameState {
    resources: ResourceAmounts;
    totalResources: ResourceAmounts;
    automations: AutomationRates;
    unlockedNodes: Set<string>;
    nodeLevels: Record<string, number>;
    unlockedBranches: Set<string>;
    unlockedFeatures: Set<string>;
    selectedNodeId: string | null;
    lastUnlockedNodeId: string | null;
    dataGeneration: DataGeneration;
    energyGeneration: EnergyGeneration;
    isCrankBroken: boolean;
    isCrankAutomated: boolean;
}

/**
 * Prestige statistics
 */
export interface PrestigeStatistics {
    fastestClear: number | null;
    totalNodesEverUnlocked: number;
    totalEnergyEverEarned: number;
    runStartTime: number;
}

/**
 * Prestige state
 */
export interface PrestigeState {
    ascensionCount: number;
    quantumCores: number;
    totalCoresEarned: number;
    upgrades: Set<string>;
    statistics: PrestigeStatistics;
}

/**
 * Prestige bonus multipliers
 */
export interface PrestigeBonuses {
    clickPower: number;
    automation: number;
    costReduction: number;
    dataCapacity: number;
    specialEffects: Record<string, boolean>;
}

/**
 * Serializable save state (no Sets/Maps)
 */
export interface SaveState {
    version: string;
    timestamp: number;
    resources: ResourceAmounts;
    totalResources: ResourceAmounts;
    automations: AutomationRates;
    unlockedNodes: string[];
    nodeLevels: Record<string, number>;
    unlockedBranches: string[];
    unlockedFeatures: string[];
    selectedNodeId: string | null;
    lastUnlockedNodeId: string | null;
    dataGeneration: DataGeneration;
    energyGeneration: EnergyGeneration;
    isCrankBroken: boolean;
    isCrankAutomated: boolean;
    prestigeState: {
        ascensionCount: number;
        quantumCores: number;
        totalCoresEarned: number;
        upgrades: string[];
        statistics: PrestigeStatistics;
    };
}
