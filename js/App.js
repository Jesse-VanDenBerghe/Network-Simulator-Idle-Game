// Main Vue Application
const { createApp, ref, reactive, computed, onMounted, onUnmounted, watch } = Vue;

const App = {
    name: 'App',
    components: {
        ResourceBar,
        Sidebar,
        SkillTree,
        InfoPanel,
        NotificationToast
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
        // COMPUTED VALUES
        // ==========================================
        const computedValues = computed(() => {
            let values = {
                energyPerClick: 1,
                dataPerClick: 1,
                dataMultiplier: 1,
                allRatesMultiplier: 1
            };

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

        const resourceRates = computed(() => ({
            energy: automations.energy * computedValues.value.allRatesMultiplier,
            data: automations.data * computedValues.value.allRatesMultiplier * computedValues.value.dataMultiplier,
            bandwidth: automations.bandwidth * computedValues.value.allRatesMultiplier
        }));

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
            if (!selectedNode.value) return false;
            const scaledCost = GameData.getScaledNodeCost(selectedNode.value);
            for (const [resource, amount] of Object.entries(scaledCost)) {
                if (resources[resource] < amount) return false;
            }
            return true;
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

            const scaledCost = GameData.getScaledNodeCost(node);

            // Check cost
            for (const [resource, amount] of Object.entries(scaledCost)) {
                if (resources[resource] < amount) return;
            }

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
            if (!saveData) return;

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
            loadGame();
            gameLoopInterval = setInterval(gameLoop, 100);
            saveInterval = setInterval(saveGame, 30000);
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

            // Methods
            generateEnergy,
            processData,
            selectNode,
            unlockNode,
            resetGame,

            // Data
            nodes: GameData.nodes
        };
    },
    template: `
        <div id="game-container">
            <header id="header">
                <h1>Network Simulator</h1>
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
                    @generate-energy="generateEnergy"
                    @process-data="processData"
                />

                <SkillTree
                    :nodes="nodes"
                    :unlocked-nodes="unlockedNodes"
                    :selected-node-id="selectedNodeId"
                    :resources="resources"
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
                    @unlock="unlockNode"
                />
            </main>

            <NotificationToast :notifications="notifications" />
        </div>
    `
};

// Create and mount the app
createApp(App).mount('#app');
