// useSaveLoad Composable
// =======================
// Handles saving and loading game and prestige data

export function useSaveLoad(gameState, prestigeState, nodeManagement) {
    /**
     * Save game state to localStorage
     */
    function saveGame() {
        const saveData = {
            resources: { ...gameState.resources },
            totalResources: { ...gameState.totalResources },
            automations: { ...gameState.automations },
            unlockedNodes: Array.from(gameState.unlockedNodes.value),
            lastUpdate: Date.now()
        };
        localStorage.setItem('networkSimulatorSave', JSON.stringify(saveData));
    }

    /**
     * Load game state from localStorage
     */
    function loadGame() {
        const saveData = localStorage.getItem('networkSimulatorSave');
        if (!saveData) {
            // No game save, but apply prestige bonuses if any
            nodeManagement.applyStartingBonuses();
            return;
        }

        try {
            const data = JSON.parse(saveData);

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

            // Calculate offline progress
            const offlineTime = (Date.now() - (data.lastUpdate || Date.now())) / 1000;
            if (offlineTime > 0 && offlineTime < 86400) {
                // Recalculate rates with current unlocks
                const rates = nodeManagement.resourceRates.value;
                gameState.resources.energy += rates.energy * offlineTime;
                gameState.resources.data += rates.data * offlineTime;
                gameState.resources.bandwidth += rates.bandwidth * offlineTime;

                if (offlineTime > 60) {
                    return 'Welcome back! Earned resources while away.';
                }
            }
        } catch (e) {
            console.error('Failed to load save:', e);
        }
        
        return null;
    }

    /**
     * Save prestige state to localStorage
     */
    function savePrestige() {
        const prestigeData = {
            ascensionCount: prestigeState.prestigeState.ascensionCount,
            quantumCores: prestigeState.prestigeState.quantumCores,
            totalCoresEarned: prestigeState.prestigeState.totalCoresEarned,
            upgrades: Array.from(prestigeState.prestigeState.upgrades),
            statistics: { ...prestigeState.prestigeState.statistics }
        };
        localStorage.setItem('networkSimulatorPrestige', JSON.stringify(prestigeData));
    }

    /**
     * Load prestige state from localStorage
     */
    function loadPrestige() {
        const prestigeData = localStorage.getItem('networkSimulatorPrestige');
        if (!prestigeData) return;

        try {
            const data = JSON.parse(prestigeData);
            
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
    function resetGame() {
        if (confirm('Are you sure you want to reset all progress?')) {
            localStorage.removeItem('networkSimulatorSave');
            location.reload();
        }
    }

    return {
        saveGame,
        loadGame,
        savePrestige,
        loadPrestige,
        resetGame
    };
}
