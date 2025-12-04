// Node Utilities
// ===============

import type { Node, NodeRequirement, NodeCost } from '@/types/node';
import { TIER_COST_MULTIPLIERS, COST_SHIFT_FOR_RESOURCE } from '@/data/constants';
import { ASCENSION_COST_MULTIPLIER } from '@/data/config';

/**
 * Extract node ID from requirement (handles both string and object forms)
 */
function getReqId(req: NodeRequirement): string {
    return typeof req === 'string' ? req : req.id;
}

export function isNodeDefined(node: Node | undefined): boolean {
    return node !== undefined && node.id !== '' && node.x !== undefined && node.y !== undefined;
}

/**
 * Check if a single requirement is met
 */
export function checkRequirementMet(
    req: NodeRequirement,
    unlockedNodes: Set<string>,
    nodeLevels: Record<string, number>
): boolean {
    const id = getReqId(req);
    if (!unlockedNodes.has(id)) return false;
    if (typeof req === 'string') return true;
    const nodeLevel = nodeLevels?.[id] || 1;
    return nodeLevel >= (req.level || 1);
}

/**
 * Get tier multiplier for a resource, shifted by COST_SHIFT_FOR_RESOURCE
 * e.g. data at tier 3 with shift 2 => uses multiplier for tier 1
 */
function getTierMultiplierForResource(tier: number, resource: string): number {
    const shift = (COST_SHIFT_FOR_RESOURCE as Record<string, number>)[resource] || 0;
    const effectiveTier = Math.max(0, tier - shift);
    return TIER_COST_MULTIPLIERS[effectiveTier] || 1;
}

/**
 * Options for cost scaling calculation
 */
export interface ScaledCostOptions {
    ascensionCount?: number;
    prestigeBonuses?: {
        costMultiplier?: number;
        tierCostMultipliers?: Record<number, number>;
    } | null;
    currentLevel?: number;
}

/**
 * Get the cost of a node scaled by its tier multiplier, ascension count, prestige bonuses, and level
 */
export function getScaledNodeCost(node: Node, options: ScaledCostOptions = {}): NodeCost {
    const { ascensionCount = 0, prestigeBonuses = null, currentLevel = 0 } = options;
    const baseCost = node.cost;
    
    // Ascension scaling: each ascension increases costs by ASCENSION_COST_MULTIPLIER (compounds)
    const ascensionMultiplier = Math.pow(ASCENSION_COST_MULTIPLIER, ascensionCount);
    
    // Level scaling: apply costScaling multiplier for each level above 0
    const costScaling = node.costScaling || 1;
    const levelMultiplier = currentLevel > 0 ? Math.pow(costScaling, currentLevel) : 1;
    
    // Prestige cost reduction
    let costReduction = 1;
    if (prestigeBonuses) {
        // Apply general cost multiplier
        if (prestigeBonuses.costMultiplier) {
            costReduction *= prestigeBonuses.costMultiplier;
        }
        // Apply tier-specific cost multipliers
        if (prestigeBonuses.tierCostMultipliers && prestigeBonuses.tierCostMultipliers[node.tier]) {
            costReduction *= prestigeBonuses.tierCostMultipliers[node.tier];
        }
    }
    
    const scaled: NodeCost = {};
    for (const [resource, amount] of Object.entries(baseCost)) {
        const tierMultiplier = getTierMultiplierForResource(node.tier, resource);
        const finalCost = amount * tierMultiplier * ascensionMultiplier * levelMultiplier * costReduction;
        scaled[resource as keyof NodeCost] = Math.floor(finalCost);
    }
    return scaled;
}

/**
 * Count how many nodes of a specific tier are unlocked
 */
export function countUnlockedInTier(
    tier: number,
    unlockedNodeIds: Set<string>,
    nodesData: Record<string, Node>
): number {
    let count = 0;
    unlockedNodeIds.forEach(id => {
        const node = nodesData[id];
        if (node && node.tier === tier) {
            count++;
        }
    });
    return count;
}

/**
 * Check if a tier is unlocked (always returns true now - tier gates removed)
 */
export function isTierUnlocked(): boolean {
    return true;
}

/**
 * Connection definition for rendering lines between nodes
 */
export interface NodeConnection {
    from: string;
    to: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

/**
 * Get all connections between nodes for rendering
 */
export function getConnections(nodesData: Record<string, Node>): NodeConnection[] {
    const connections: NodeConnection[] = [];
    Object.values(nodesData).forEach(node => {
        node.requires.forEach(req => {
            const reqId = getReqId(req);
            const reqNode = nodesData[reqId];
            if (reqNode) {
                // Skip connections from tier gates to nodes in a different branch
                // This prevents visual connections between unlocking gates and newly unlocked branches
                if (reqNode.isTierGate && node.branch !== reqNode.branch) {
                    return; // Skip this connection
                }
                
                connections.push({
                    from: reqId,
                    to: node.id,
                    x1: (reqNode.x || 0) + 40,
                    y1: (reqNode.y || 0) + 40,
                    x2: (node.x || 0) + 40,
                    y2: (node.y || 0) + 40
                });
            }
        });
    });
    return connections;
}
