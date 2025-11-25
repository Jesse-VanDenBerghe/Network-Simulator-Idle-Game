// Main Vue Application
const { createApp, ref, reactive, computed, onMounted, onUnmounted, watch } = Vue;

const App = {
    name: 'App',
    components: {
        ResourceBar,
        Sidebar,
        SkillTree,
        InfoPanel,
        NotificationToast,
        AscensionPanel
    },
    setup() {
        // ==========================================
        // GAME STATE
        // ==========================================
        const resources = reactive({
            energy: 0,
            data: 0,
            bandwidth: 0
        });

        const totalResources = reactive({
            energy: 0,
            data: 0,
            bandwidth: 0
        });

        const automations = reactive({
            energy: 0,
            data: 0,
            bandwidth: 0
        });

        const unlockedNodes = ref(new Set(['core']));
        const selectedNodeId = ref(null);
        const notifications = ref([]);
        const lastUpdate = ref(Date.now());
        let notificationId = 0;
        let gameLoopInterval = null;
        let saveInterval = null;

        // ==========================================
        // PRESTIGE STATE
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
        // COMPUTED VALUES
        // ==========================================
        const prestigeBonuses = computed(() => getAccumulatedBonuses());

        const computedValues = computed(() => {
            let values = {
                energyPerClick: 1,
                dataPerClick: 1,
                dataMultiplier: 1,
                allRatesMultiplier: 1
            };

            // Apply prestige bonuses
            const bonuses = prestigeBonuses.value;
            values.energyPerClick += bonuses.bonusEnergyPerClick;

            unlockedNodes.value.forEach(nodeId => {
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
            const bonuses = prestigeBonuses.value;
            return {
                energy: automations.energy * computedValues.value.allRatesMultiplier * bonuses.automationMultiplier,
                data: automations.data * computedValues.value.allRatesMultiplier * computedValues.value.dataMultiplier * bonuses.automationMultiplier,
                bandwidth: automations.bandwidth * computedValues.value.allRatesMultiplier * bonuses.automationMultiplier
            };
        });

        const effectiveRates = computed(() => ({
            energy: resourceRates.value.energy,
            data: resourceRates.value.data,
            bandwidth: resourceRates.value.bandwidth
        }));

        const dataUnlocked = computed(() => {
            return unlockedNodes.value.has('data_processing');
        });

        const bandwidthUnlocked = computed(() => {
            return unlockedNodes.value.has('bandwidth_unlock');
        });

        const canProcessData = computed(() => {
            return dataUnlocked.value && resources.energy >= 5;
        });

        const selectedNode = computed(() => {
            return selectedNodeId.value ? GameData.nodes[selectedNodeId.value] : null;
        });

        const isSelectedNodeUnlocked = computed(() => {
            return selectedNodeId.value ? unlockedNodes.value.has(selectedNodeId.value) : false;
        });

        const isSelectedNodeAvailable = computed(() => {
            if (!selectedNode.value || isSelectedNodeUnlocked.value) return false;
            
            // Check requirements
            const requirementsMet = selectedNode.value.requires.every(reqId => unlockedNodes.value.has(reqId));
            if (!requirementsMet) return false;

            // Check tier gate
            return GameData.isTierUnlocked(selectedNode.value.tier, unlockedNodes.value);
        });

        const canAffordSelectedNode = computed(() => {
            return checkAffordability(selectedNode.value);
        });

        const isTierLocked = computed(() => {
            if (!selectedNode.value) return false;
            return !GameData.isTierUnlocked(selectedNode.value.tier, unlockedNodes.value);
        });

        const tierGateRequirement = computed(() => {
            if (!selectedNode.value) return null;
            const gate = GameData.TIER_GATES[selectedNode.value.tier];
            if (!gate) return null;
            
            const count = GameData.countUnlockedInTier(gate.requiredTier, unlockedNodes.value);
            return {
                ...gate,
                currentCount: count,
                remaining: Math.max(0, gate.requiredCount - count)
            };
        });

        const stats = computed(() => ({
            nodesUnlocked: unlockedNodes.value.size,
            totalEnergy: totalResources.energy,
            totalData: totalResources.data
        }));

        const dataPerClickDisplay = computed(() => {
            return Math.floor(computedValues.value.dataPerClick * computedValues.value.dataMultiplier);
        });

        const highestTierReached = computed(() => {
            let maxTier = 0;
            unlockedNodes.value.forEach(nodeId => {
                const node = GameData.nodes[nodeId];
                if (node && node.tier > maxTier) {
                    maxTier = node.tier;
                }
            });
            return maxTier;
        });

        const coresEarned = computed(() => calculateQuantumCores());

        // ==========================================
        // HELPER METHODS
        // ==========================================
        function checkAffordability(node) {
            if (!node) return false;
            const scaledCost = GameData.getScaledNodeCost(node, prestigeState.ascensionCount, prestigeBonuses.value);
            for (const [resource, amount] of Object.entries(scaledCost)) {
                if (resources[resource] < amount) return false;
            }
            return true;
        }

        // ==========================================
        // METHODS
        // ==========================================
        function generateEnergy() {
            const amount = computedValues.value.energyPerClick;
            resources.energy += amount;
            totalResources.energy += amount;
        }

        function processData() {
            if (!canProcessData.value) return;
            resources.energy -= 5;
            const dataGain = Math.floor(computedValues.value.dataPerClick * computedValues.value.dataMultiplier);
            resources.data += dataGain;
            totalResources.data += dataGain;
        }

        function selectNode(nodeId) {
            selectedNodeId.value = nodeId;
        }

        function unlockNode(nodeId) {
            const node = GameData.nodes[nodeId];
            if (!node) return;

            // Check requirements
            const requirementsMet = node.requires.every(reqId => unlockedNodes.value.has(reqId));
            if (!requirementsMet) return;

            // Check tier gate
            if (!GameData.isTierUnlocked(node.tier, unlockedNodes.value)) return;

            // Check cost
            if (!checkAffordability(node)) return;

            const scaledCost = GameData.getScaledNodeCost(node, prestigeState.ascensionCount, prestigeBonuses.value);

            // Deduct costs
            for (const [resource, amount] of Object.entries(scaledCost)) {
                resources[resource] -= amount;
            }

            // Add to unlocked nodes (need to create new Set for reactivity)
            const newUnlocked = new Set(unlockedNodes.value);
            newUnlocked.add(nodeId);
            unlockedNodes.value = newUnlocked;

            // Apply effects
            applyNodeEffects(node);

            // Show notification
            showNotification(`${node.icon} ${node.name} unlocked!`, 'success');

            // Save game
            saveGame();
        }

        function applyNodeEffects(node) {
            const effects = node.effects;

            // Add automation
            if (effects.automation) {
                automations[effects.automation.resource] += effects.automation.rate;
            }

            // Instant unlock (Zero Day effect)
            if (effects.instantUnlock) {
                const lockedAvailableNodes = Object.values(GameData.nodes).filter(n =>
                    !unlockedNodes.value.has(n.id) &&
                    n.requires.every(reqId => unlockedNodes.value.has(reqId))
                );
                if (lockedAvailableNodes.length > 0) {
                    const randomNode = lockedAvailableNodes[Math.floor(Math.random() * lockedAvailableNodes.length)];
                    const newUnlocked = new Set(unlockedNodes.value);
                    newUnlocked.add(randomNode.id);
                    unlockedNodes.value = newUnlocked;
                    applyNodeEffects(randomNode);
                    showNotification(`${randomNode.icon} ${randomNode.name} instantly unlocked!`, 'info');
                }
            }
        }

        function showNotification(message, type = 'info') {
            const id = ++notificationId;
            notifications.value.push({ id, message, type });
            setTimeout(() => {
                notifications.value = notifications.value.filter(n => n.id !== id);
            }, 3000);
        }

        // ==========================================
        // PRESTIGE METHODS
        // ==========================================
        function calculateQuantumCores() {
            const energyLog = Math.max(0, Math.log10(totalResources.energy + 1));
            const nodeBonus = unlockedNodes.value.size / 10;
            
            // Tier bonuses
            let tierBonus = 0;
            for (const nodeId of unlockedNodes.value) {
                const node = GameData.nodes[nodeId];
                if (node && node.tier >= 6) {
                    tierBonus += (node.tier - 5) * 5;
                }
                if (node && node.id === 'universe_simulation') {
                    tierBonus += 20;
                }
            }
            
            // Core multiplier from upgrades
            const bonuses = prestigeBonuses.value;
            const multiplier = bonuses.coreMultiplier;
            
            return Math.floor((energyLog + nodeBonus + tierBonus) * multiplier);
        }

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
                    // We'll apply this in applyStartingBonuses
                    bonuses.randomStartingNodes = e.randomStartingNodes;
                }
            }
            
            return bonuses;
        }

        function applyStartingBonuses() {
            const bonuses = getAccumulatedBonuses();
            
            // Starting resources
            resources.energy = bonuses.startingEnergy || 0;
            totalResources.energy = bonuses.startingEnergy || 0;
            
            // Starting automation
            Object.entries(bonuses.startingAutomation).forEach(([resource, rate]) => {
                automations[resource] = rate;
            });
            
            // Starting nodes
            const newUnlocked = new Set(bonuses.startingNodes);
            
            // Handle random starting nodes
            if (bonuses.randomStartingNodes) {
                const { tier, count } = bonuses.randomStartingNodes;
                const tierNodes = Object.values(GameData.nodes).filter(n => n.tier === tier && !newUnlocked.has(n.id));
                const shuffled = tierNodes.sort(() => Math.random() - 0.5);
                shuffled.slice(0, count).forEach(node => newUnlocked.add(node.id));
            }
            
            unlockedNodes.value = newUnlocked;
            
            // Apply effects from starting nodes
            newUnlocked.forEach(nodeId => {
                const node = GameData.nodes[nodeId];
                if (node && node.id !== 'core') {
                    applyNodeEffects(node);
                }
            });
        }

        function ascend() {
            const cores = calculateQuantumCores();
            if (cores < 1) {
                showNotification('Need at least 1 Quantum Core to ascend!', 'error');
                return;
            }
            
            // Award cores
            prestigeState.quantumCores += cores;
            prestigeState.totalCoresEarned += cores;
            prestigeState.ascensionCount++;
            
            // Update statistics
            prestigeState.statistics.totalNodesEverUnlocked += unlockedNodes.value.size;
            prestigeState.statistics.totalEnergyEverEarned += totalResources.energy;
            
            const runTime = Date.now() - prestigeState.statistics.runStartTime;
            if (!prestigeState.statistics.fastestClear || runTime < prestigeState.statistics.fastestClear) {
                prestigeState.statistics.fastestClear = runTime;
            }
            
            // Reset game state
            resetGameState();
            
            // Save prestige
            savePrestige();
            
            showNotification(`🌌 Ascended! +${cores} Quantum Core${cores !== 1 ? 's' : ''}`, 'prestige');
        }

        function resetGameState() {
            // Reset resources
            Object.keys(resources).forEach(k => resources[k] = 0);
            Object.keys(totalResources).forEach(k => totalResources[k] = 0);
            Object.keys(automations).forEach(k => automations[k] = 0);
            
            // Reset nodes (keep core)
            unlockedNodes.value = new Set(['core']);
            
            // Reset run timer
            prestigeState.statistics.runStartTime = Date.now();
            
            // Apply starting bonuses from upgrades
            applyStartingBonuses();
        }

        function purchaseUpgrade(upgradeId) {
            const upgrade = PrestigeData.upgrades[upgradeId];
            if (!upgrade) return;
            
            // Check if already purchased
            if (prestigeState.upgrades.has(upgradeId)) return;
            
            // Check requirements
            const requirementsMet = upgrade.requires.every(reqId => prestigeState.upgrades.has(reqId));
            if (!requirementsMet) return;
            
            // Check cost
            if (prestigeState.quantumCores < upgrade.cost) return;
            
            // Deduct cost
            prestigeState.quantumCores -= upgrade.cost;
            
            // Add upgrade
            const newUpgrades = new Set(prestigeState.upgrades);
            newUpgrades.add(upgradeId);
            prestigeState.upgrades = newUpgrades;
            
            // Save prestige
            savePrestige();
            
            showNotification(`✨ ${upgrade.name} purchased!`, 'success');
        }

        function toggleAscensionPanel() {
            showAscensionPanel.value = !showAscensionPanel.value;
        }

        // ==========================================
        // GAME LOOP
        // ==========================================
        function gameLoop() {
            const now = Date.now();
            const delta = (now - lastUpdate.value) / 1000;
            lastUpdate.value = now;

            // Apply automation rates
            resources.energy += resourceRates.value.energy * delta;
            resources.data += resourceRates.value.data * delta;
            resources.bandwidth += resourceRates.value.bandwidth * delta;

            totalResources.energy += resourceRates.value.energy * delta;
            totalResources.data += resourceRates.value.data * delta;
            totalResources.bandwidth += resourceRates.value.bandwidth * delta;
        }

        // ==========================================
        // SAVE / LOAD
        // ==========================================
        function saveGame() {
            const saveData = {
                resources: { ...resources },
                totalResources: { ...totalResources },
                automations: { ...automations },
                unlockedNodes: Array.from(unlockedNodes.value),
                lastUpdate: Date.now()
            };
            localStorage.setItem('networkSimulatorSave', JSON.stringify(saveData));
        }

        function loadGame() {
            const saveData = localStorage.getItem('networkSimulatorSave');
            if (!saveData) {
                // No game save, but apply prestige bonuses if any
                applyStartingBonuses();
                return;
            }

            try {
                const data = JSON.parse(saveData);

                // Restore resources
                if (data.resources) {
                    Object.assign(resources, data.resources);
                }
                if (data.totalResources) {
                    Object.assign(totalResources, data.totalResources);
                }
                if (data.automations) {
                    Object.assign(automations, data.automations);
                }
                if (data.unlockedNodes) {
                    unlockedNodes.value = new Set(data.unlockedNodes);
                }

                // Calculate offline progress
                const offlineTime = (Date.now() - (data.lastUpdate || Date.now())) / 1000;
                if (offlineTime > 0 && offlineTime < 86400) {
                    // Recalculate rates with current unlocks
                    const rates = resourceRates.value;
                    resources.energy += rates.energy * offlineTime;
                    resources.data += rates.data * offlineTime;
                    resources.bandwidth += rates.bandwidth * offlineTime;

                    if (offlineTime > 60) {
                        showNotification('Welcome back! Earned resources while away.', 'info');
                    }
                }
            } catch (e) {
                console.error('Failed to load save:', e);
            }
        }

        function savePrestige() {
            const prestigeData = {
                ascensionCount: prestigeState.ascensionCount,
                quantumCores: prestigeState.quantumCores,
                totalCoresEarned: prestigeState.totalCoresEarned,
                upgrades: Array.from(prestigeState.upgrades),
                statistics: { ...prestigeState.statistics }
            };
            localStorage.setItem('networkSimulatorPrestige', JSON.stringify(prestigeData));
        }

        function loadPrestige() {
            const prestigeData = localStorage.getItem('networkSimulatorPrestige');
            if (!prestigeData) return;

            try {
                const data = JSON.parse(prestigeData);
                
                prestigeState.ascensionCount = data.ascensionCount || 0;
                prestigeState.quantumCores = data.quantumCores || 0;
                prestigeState.totalCoresEarned = data.totalCoresEarned || 0;
                prestigeState.upgrades = new Set(data.upgrades || []);
                
                if (data.statistics) {
                    Object.assign(prestigeState.statistics, data.statistics);
                    // Reset run start time
                    prestigeState.statistics.runStartTime = Date.now();
                }
            } catch (e) {
                console.error('Failed to load prestige:', e);
            }
        }

        function resetGame() {
            if (confirm('Are you sure you want to reset all progress?')) {
                localStorage.removeItem('networkSimulatorSave');
                location.reload();
            }
        }

        // ==========================================
        // LIFECYCLE
        // ==========================================
        onMounted(() => {
            loadPrestige();
            loadGame();
            gameLoopInterval = setInterval(gameLoop, 100);
            saveInterval = setInterval(saveGame, 30000);
            setInterval(savePrestige, 30000);
        });

        onUnmounted(() => {
            if (gameLoopInterval) clearInterval(gameLoopInterval);
            if (saveInterval) clearInterval(saveInterval);
        });

        // ==========================================
        // EXPOSE TO TEMPLATE
        // ==========================================
        return {
            // State
            resources,
            automations,
            unlockedNodes,
            selectedNodeId,
            notifications,
            prestigeState,
            showAscensionPanel,

            // Computed
            computedValues,
            resourceRates,
            effectiveRates,
            dataUnlocked,
            bandwidthUnlocked,
            canProcessData,
            selectedNode,
            isSelectedNodeUnlocked,
            isSelectedNodeAvailable,
            canAffordSelectedNode,
            isTierLocked,
            tierGateRequirement,
            stats,
            dataPerClickDisplay,
            highestTierReached,
            coresEarned,

            // Methods
            generateEnergy,
            processData,
            selectNode,
            unlockNode,
            resetGame,
            ascend,
            purchaseUpgrade,
            toggleAscensionPanel,

            // Data
            nodes: GameData.nodes
        };
    },
    template: `
        <div id="game-container">
            <header id="header">
                <h1>Network Simulator</h1>
                <div class="prestige-header" v-if="prestigeState.ascensionCount > 0 || prestigeState.quantumCores > 0">
                    <button class="prestige-button" @click="toggleAscensionPanel" title="View Ascension Upgrades">
                        <span class="prestige-icon">💎</span>
                        <span class="prestige-value">{{ prestigeState.quantumCores }}</span>
                        <span class="prestige-label">Quantum Cores</span>
                        <span class="prestige-ascension">Ascension {{ prestigeState.ascensionCount }}</span>
                    </button>
                </div>
                <div id="resources">
                    <ResourceBar
                        icon="⚡"
                        name="Energy"
                        :amount="resources.energy"
                        :rate="resourceRates.energy"
                    />
                    <ResourceBar
                        icon="📊"
                        name="Data"
                        :amount="resources.data"
                        :rate="resourceRates.data"
                    />
                    <ResourceBar
                        icon="📡"
                        name="Bandwidth"
                        :amount="resources.bandwidth"
                        :rate="resourceRates.bandwidth"
                        :visible="bandwidthUnlocked"
                    />
                </div>
            </header>

            <main id="main-content">
                <Sidebar
                    :energy-per-click="computedValues.energyPerClick"
                    :data-per-click="dataPerClickDisplay"
                    :data-unlocked="dataUnlocked"
                    :can-process-data="canProcessData"
                    :automations="automations"
                    :effective-rates="effectiveRates"
                    :stats="stats"
                    :cores-earned="coresEarned"
                    :highest-tier-reached="highestTierReached"
                    @generate-energy="generateEnergy"
                    @process-data="processData"
                    @ascend="ascend"
                />

                <SkillTree
                    :nodes="nodes"
                    :unlocked-nodes="unlockedNodes"
                    :selected-node-id="selectedNodeId"
                    :resources="resources"
                    :ascension-count="prestigeState.ascensionCount"
                    :prestige-bonuses="prestigeBonuses"
                    @select-node="selectNode"
                />

                <InfoPanel
                    :node="selectedNode"
                    :is-unlocked="isSelectedNodeUnlocked"
                    :is-available="isSelectedNodeAvailable"
                    :is-tier-locked="isTierLocked"
                    :tier-gate="tierGateRequirement"
                    :can-afford="canAffordSelectedNode"
                    :resources="resources"
                    :unlocked-nodes="unlockedNodes"
                    :ascension-count="prestigeState.ascensionCount"
                    :prestige-bonuses="prestigeBonuses"
                    @unlock="unlockNode"
                />
            </main>

            <NotificationToast :notifications="notifications" />
            
            <AscensionPanel
                :visible="showAscensionPanel"
                :quantum-cores="prestigeState.quantumCores"
                :ascension-count="prestigeState.ascensionCount"
                :purchased-upgrades="prestigeState.upgrades"
                :statistics="prestigeState.statistics"
                :total-cores-earned="prestigeState.totalCoresEarned"
                @purchase-upgrade="purchaseUpgrade"
                @close="toggleAscensionPanel"
            />
        </div>
    `
};

// Create and mount the app
createApp(App).mount('#app');
