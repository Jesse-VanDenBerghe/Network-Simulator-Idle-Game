// Node System Type Definitions
// =============================

import type { ResourceAmounts } from './game';

/**
 * Branch identifiers
 */
export type BranchId = 'energy' | 'computer';

/**
 *  Branch metadata display
 */
export interface BranchMetadata {
    id: BranchId;
    label: string;
    icon: string;
    color: string;
}

export const BRANCHES: readonly BranchMetadata[] = [
    { id: 'energy', label: 'Energy', icon: '⚡', color: '#f59e0b' },
    { id: 'computer', label: 'Computer', icon: '💻', color: '#3b82f6' }
] as const;

/**
 * Node tier (0-8, affects cost scaling)
 */
export type NodeTier = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/**
 * Node cost definition
 */
export interface NodeCost {
    energy?: number;
    data?: number;
}

/**
 * Automation effect configuration
 */
export interface AutomationEffect {
    resource: 'energy' | 'data';
    rate: number; // units per second
}

/**
 * Narration effect (deprecated - use notification system)
 */
export interface NarrationEffect {
    text: string;
    duration: number;
}

/**
 * Level-specific effects for multi-level nodes
 */
export interface LevelEffect {
    breakCrank?: boolean;
    automateCrank?: boolean;
    unlockFeature?: string;
    [key: string]: any;
}

/**
 * Node effects that apply when unlocked
 */
export interface NodeEffects {
    automation?: AutomationEffect;
    energyPerClick?: number;
    dataPerClick?: number;
    dataMultiplier?: number;
    allRatesMultiplier?: number;
    dataCapacityBonus?: number;
    maxDataCapacityBonus?: number;
    dataGenerationRate?: number;
    energyGenerationRate?: number;
    dataGenSpeedMultiplier?: number;
    dataGenAmountBonus?: number;
    unlockBranch?: BranchId;
    unlockFeature?: string;
    unlockDataGeneration?: boolean;
    unlockDataProcessing?: boolean;
    breakCrank?: boolean;
    automateCrank?: boolean;
    description?: string;
    narrate?: NarrationEffect; // Deprecated
    levelEffects?: Record<number, LevelEffect>;
}

/**
 * Node requirement (simple or leveled)
 */
export type NodeRequirement = string | { id: string; level: number };

/**
 * Core node definition
 */
export interface Node {
    id: string;
    name: string;
    icon: string;
    tier: NodeTier;
    branch: BranchId | null; // null for core starting node
    description?: string;
    requires: NodeRequirement[];
    cost: NodeCost;
    effects: NodeEffects;
    maxLevel?: number; // If >1, node can be upgraded
    costScaling?: number; // Multiplier for each level (default 1.5)
    isTierGate?: boolean; // Tier gate nodes visible even if branch not unlocked
    x?: number; // Layout position (computed)
    y?: number; // Layout position (computed)
}

/**
 * Branch metadata
 */
export interface Branch {
    id: BranchId;
    name: string;
    icon: string;
    color: string;
    description: string;
}

/**
 * Node affordability check result
 */
export interface AffordabilityCheck {
    canAfford: boolean;
    missingResources?: Partial<ResourceAmounts>;
}

/**
 * Node unlock result
 */
export interface UnlockResult {
    success: boolean;
    nodeId: string;
    level: number;
    effects?: NodeEffects;
    error?: string;
}

/**
 * Node collection indexed by ID
 */
export type NodeCollection = Record<string, Node>;

/**
 * Branch collection indexed by ID
 */
export type BranchCollection = Record<BranchId, Branch>;
