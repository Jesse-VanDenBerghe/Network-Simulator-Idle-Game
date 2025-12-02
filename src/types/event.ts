// Event Bus Type Definitions
// ===========================

import type { Node } from './node';
import type { NotificationDisplay } from './notification';

/**
 * Node unlocked event payload
 */
export interface NodeUnlockedEvent {
    nodeId: string;
    node: Node;
    level: number;
}

/**
 * Node level reached event payload
 */
export interface NodeLevelReachedEvent {
    nodeId: string;
    level: number;
}

/**
 * Branch unlocked event payload
 */
export interface BranchUnlockedEvent {
    branch: string;
}

/**
 * Feature unlocked event payload
 */
export interface FeatureUnlockedEvent {
    feature: string;
}

/**
 * Tier reached event payload
 */
export interface TierReachedEvent {
    tier: number;
}

/**
 * Resource changed event payload
 */
export interface ResourceChangedEvent {
    resource: 'energy' | 'data';
    amount: number;
    previousAmount: number;
}

/**
 * Notification shown event payload
 */
export interface NotificationShownEvent {
    notification: NotificationDisplay;
}

/**
 * Ascension event payload
 */
export interface AscensionEvent {
    coresEarned: number;
    totalCores: number;
    ascensionCount: number;
}

/**
 * Game loaded event payload
 */
export interface GameLoadedEvent {
    saveExists: boolean;
    offlineSeconds?: number;
}

/**
 * Crank clicked event payload
 */
export interface CrankClickedEvent {
    energy: number;
    isBroken: boolean;
}

/**
 * Map of all event names to their payload types
 * Used for type-safe event bus
 */
export interface EventMap {
    // Node events
    nodeUnlocked: NodeUnlockedEvent;
    nodeLevelReached: NodeLevelReachedEvent;
    
    // Branch/feature events
    branchUnlocked: BranchUnlockedEvent;
    featureUnlocked: FeatureUnlockedEvent;
    tierReached: TierReachedEvent;
    
    // Resource events
    resourceChanged: ResourceChangedEvent;
    
    // Notification events
    notificationShown: NotificationShownEvent;
    notificationDismissed: { id: string };
    
    // Progression events
    ascension: AscensionEvent;
    gameLoaded: GameLoadedEvent;
    
    // Interaction events
    crankClicked: CrankClickedEvent;
    
    // System events
    gameTick: { deltaTime: number };
    saveGame: { manual: boolean };
}

/**
 * Event handler callback type
 */
export type EventHandler<K extends keyof EventMap> = (data: EventMap[K]) => void;

/**
 * Event bus interface
 */
export interface EventBus {
    on<K extends keyof EventMap>(eventName: K, callback: EventHandler<K>): () => void;
    emit<K extends keyof EventMap>(eventName: K, data: EventMap[K]): void;
    once<K extends keyof EventMap>(eventName: K, callback: EventHandler<K>): () => void;
}
