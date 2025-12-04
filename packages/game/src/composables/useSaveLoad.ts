// useSaveLoad Composable
// =======================
// Handles saving and loading game and prestige data
// Uses event bus for decoupled communication

import { MAX_OFFLINE_TIME_S } from '@network-simulator/shared/data/constants';
import { NotificationType } from '@network-simulator/shared/data/notifications/constants';
import type { UseGameStateReturn } from './useGameState';
import type { UsePrestigeStateReturn } from './usePrestigeState';
import type { EventMap } from '@network-simulator/shared/types/event';
import GameData from '@/core/gameData';

/**
 * Event bus interface (minimal typing)
 */
interface EventBus {
    on<K extends keyof EventMap>(eventName: K, callback: (data: EventMap[K]) => void): () => void;
    emit<K extends keyof EventMap>(eventName: K, data: EventMap[K]): void;
}

/**
 * Save data structure
 */
interface SaveData {
    resources: Record<string, number>;
    totalResources: Record<string, number>;
    automations: Record<string, number>;
    unlockedNodes: string[];
    nodeLevels: Record<string, number>;
    unlockedBranches: string[];
    unlockedFeatures: string[];
    dataGeneration: any;
    isCrankBroken: boolean;
    isCrankAutomated: boolean;
    lastUpdate: number;
}

/**
 * Prestige save data structure
 */
interface PrestigeSaveData {
    ascensionCount: number;
    quantumCores: number;
    totalCoresEarned: number;
    upgrades: string[];
    statistics: any;
}

/**
 * Return type for useSaveLoad composable
 */
export interface UseSaveLoadReturn {
    saveGame: () => void;
    loadGame: () => void;
    savePrestige: () => void;
    loadPrestige: () => void;
    resetGame: () => void;
}

export function useSaveLoad(
    gameState: UseGameStateReturn,
    prestigeState: UsePrestigeStateReturn,
    eventBus: EventBus
): UseSaveLoadReturn {
    /**
     * Calculate resource rates explicitly from saved state data
     * Prevents race condition with computed values not yet updated
     */
    function calculateRatesFromSavedState(data: SaveData): { energy: number; data: number } {
        let allRatesMultiplier = 1;
        let dataMultiplier = 1;
        
        const unlockedNodes = data.unlockedNodes || [];
        const nodeLevels = data.nodeLevels || {};
        
        unlockedNodes.forEach(nodeId => {
            const node = GameData.nodes[nodeId];
            if (!node?.effects) return;
            
            const level = nodeLevels[nodeId] || 1;
            
            if (node.effects.allRatesMultiplier) {
                allRatesMultiplier *= Math.pow(node.effects.allRatesMultiplier, level);
            }
            if (node.effects.dataMultiplier) {
                dataMultiplier *= Math.pow(node.effects.dataMultiplier, level);
            }
        });
        
        const baseEnergy = data.automations?.energy || 0;
        const baseData = data.automations?.data || 0;
        
        // Note: prestige bonuses already applied to automations values when saved
        return {
            energy: baseEnergy * allRatesMultiplier,
            data: baseData * allRatesMultiplier * dataMultiplier
        };
    }

    // Track last saved state hash to avoid unnecessary saves
    let lastSaveHash: string | null = null;

    /**
     * Generate a simple hash of key game state values
     */
    function hashGameState(): string {
        return JSON.stringify({
            energy: Math.floor(gameState.resources.energy),
            data: Math.floor(gameState.resources.data),
            unlockedCount: gameState.unlockedNodes.value.size,
            nodeLevels: Object.values(gameState.nodeLevels).reduce((a, b) => a + b, 0)
        });
    }

    /**
     * Save game state to localStorage (only if changed)
     */
    function saveGame(): void {
        const currentHash = hashGameState();
        if (currentHash === lastSaveHash) {
            return; // No changes since last save
        }
        
        const saveData: SaveData = {
            resources: { ...gameState.resources },
            totalResources: { ...gameState.totalResources },
            automations: { ...gameState.automations },
            unlockedNodes: Array.from(gameState.unlockedNodes.value),
            nodeLevels: { ...gameState.nodeLevels },
            unlockedBranches: Array.from(gameState.unlockedBranches.value),
            unlockedFeatures: Array.from(gameState.unlockedFeatures.value),
            dataGeneration: { ...gameState.dataGeneration },
            isCrankBroken: gameState.isCrankBroken.value,
            isCrankAutomated: gameState.isCrankAutomated.value,
            lastUpdate: Date.now()
        };
        try {
            localStorage.setItem('networkSimulatorSave', JSON.stringify(saveData));
            lastSaveHash = currentHash;
        } catch (e: any) {
            if (e.name === 'QuotaExceededError') {
                console.error('Storage quota exceeded - save failed');
                eventBus.emit('showNotification', { 
                    message: 'Storage full! Save failed.', 
                    type: NotificationType.ERROR,
                    duration: 5000
                });
            } else {
                console.error('Save failed:', e);
            }
        }
    }

    /**
     * Load game state from localStorage
     */
    function loadGame(): void {
        const saveData = localStorage.getItem('networkSimulatorSave');
        if (!saveData) {
            // No game save, request starting bonuses via event
            eventBus.emit('requestStartingBonuses', undefined);
            eventBus.emit('gameLoaded', { saveExists: false });
            return;
        }

        try {
            const data: SaveData = JSON.parse(saveData);

            // Restore resources
            if (data.resources) {
                Object.assign(gameState.resources, data.resources);
            }
            if (data.totalResources) {
                Object.assign(gameState.totalResources, data.totalResources);
            }
            if (data.automations) {
                Object.assign(gameState.automations, data.automations);
            }
            if (data.unlockedNodes) {
                gameState.unlockedNodes.value = new Set(data.unlockedNodes);
            }
            if (data.nodeLevels) {
                Object.assign(gameState.nodeLevels, data.nodeLevels);
            }
            if (data.unlockedBranches) {
                gameState.unlockedBranches.value = new Set(data.unlockedBranches);
            }
            if (data.unlockedFeatures) {
                gameState.unlockedFeatures.value = new Set(data.unlockedFeatures);
            }
            if (data.dataGeneration) {
                Object.assign(gameState.dataGeneration, data.dataGeneration);
            }
            if (data.isCrankBroken !== undefined) {
                gameState.isCrankBroken.value = data.isCrankBroken;
            }
            if (data.isCrankAutomated !== undefined) {
                gameState.isCrankAutomated.value = data.isCrankAutomated;
            }

            // Notify that game is loaded (so rates can be calculated)
            eventBus.emit('gameLoaded', { saveExists: true });

            // Calculate offline progress using explicit rate calculation from saved state
            const offlineTime = (Date.now() - (data.lastUpdate || Date.now())) / 1000;
            if (offlineTime > 0 && offlineTime < MAX_OFFLINE_TIME_S) {
                // Calculate rates explicitly from saved state - don't rely on computed values
                const rates = calculateRatesFromSavedState(data);
                gameState.resources.energy += rates.energy * offlineTime;
                gameState.resources.data += rates.data * offlineTime;

                if (offlineTime > 60) {
                    eventBus.emit('showNotification', {
                        message: 'Welcome back! Earned resources while away.',
                        type: NotificationType.INFO,
                        duration: 5000
                    });
                    eventBus.emit('offlineReturn', { offlineSeconds: offlineTime });
                }
            }
        } catch (e) {
            console.error('Failed to load save:', e);
        }
    }

    /**
     * Save prestige state to localStorage
     */
    function savePrestige(): void {
        const prestigeData: PrestigeSaveData = {
            ascensionCount: prestigeState.prestigeState.ascensionCount,
            quantumCores: prestigeState.prestigeState.quantumCores,
            totalCoresEarned: prestigeState.prestigeState.totalCoresEarned,
            upgrades: Array.from(prestigeState.prestigeState.upgrades),
            statistics: { ...prestigeState.prestigeState.statistics }
        };
        try {
            localStorage.setItem('networkSimulatorPrestige', JSON.stringify(prestigeData));
        } catch (e: any) {
            if (e.name === 'QuotaExceededError') {
                console.error('Storage quota exceeded - prestige save failed');
                eventBus.emit('showNotification', { 
                    message: 'Storage full! Prestige save failed.', 
                    type: NotificationType.ERROR,
                    duration: 5000
                });
            } else {
                console.error('Prestige save failed:', e);
            }
        }
    }

    /**
     * Load prestige state from localStorage
     */
    function loadPrestige(): void {
        const prestigeData = localStorage.getItem('networkSimulatorPrestige');
        if (!prestigeData) return;

        try {
            const data: PrestigeSaveData = JSON.parse(prestigeData);
            
            prestigeState.prestigeState.ascensionCount = data.ascensionCount || 0;
            prestigeState.prestigeState.quantumCores = data.quantumCores || 0;
            prestigeState.prestigeState.totalCoresEarned = data.totalCoresEarned || 0;
            prestigeState.prestigeState.upgrades = new Set(data.upgrades || []);
            
            if (data.statistics) {
                Object.assign(prestigeState.prestigeState.statistics, data.statistics);
                // Reset run start time
                prestigeState.prestigeState.statistics.runStartTime = Date.now();
            }
        } catch (e) {
            console.error('Failed to load prestige:', e);
        }
    }

    /**
     * Reset all game data (for debugging)
     */
    function resetGame(): void {
        if (confirm('Are you sure you want to reset all progress?')) {
            localStorage.removeItem('networkSimulatorSave');
            location.reload();
        }
    }

    // ==========================================
    // EVENT SUBSCRIPTIONS
    // ==========================================
    
    eventBus.on('requestSaveGame', () => {
        saveGame();
    });
    
    eventBus.on('requestLoadGame', () => {
        loadGame();
    });
    
    eventBus.on('requestSavePrestige', () => {
        savePrestige();
    });
    
    eventBus.on('requestLoadPrestige', () => {
        loadPrestige();
    });

    return {
        saveGame,
        loadGame,
        savePrestige,
        loadPrestige,
        resetGame
    };
}
