// Network Simulator - Incremental Skill Tree Game
// ================================================

// Game State
const gameState = {
    resources: {
        energy: 0,
        data: 0,
        bandwidth: 0
    },
    resourceRates: {
        energy: 0,
        data: 0,
        bandwidth: 0
    },
    totalResources: {
        energy: 0,
        data: 0,
        bandwidth: 0
    },
    unlockedNodes: new Set(['core']),
    automations: {},
    selectedNode: null,
    lastUpdate: Date.now()
};

// Node Definitions
const nodes = {
    // Tier 0 - Core (Starting node)
    core: {
        id: 'core',
        name: 'Core System',
        icon: '🔮',
        tier: 0,
        x: 700,
        y: 300,
        description: 'The central hub of your network. Everything begins here.',
        requires: [],
        cost: {},
        effects: {
            description: 'Starting node - unlocked by default'
        }
    },

    // Tier 1 - Basic unlocks
    energy_boost: {
        id: 'energy_boost',
        name: 'Energy Boost',
        icon: '⚡',
        tier: 1,
        x: 550,
        y: 200,
        description: 'Increases manual energy generation.',
        requires: ['core'],
        cost: { energy: 10 },
        effects: {
            energyPerClick: 1,
            description: '+1 Energy per click'
        }
    },

    data_processing: {
        id: 'data_processing',
        name: 'Data Processing',
        icon: '📊',
        tier: 1,
        x: 850,
        y: 200,
        description: 'Unlocks the ability to process data.',
        requires: ['core'],
        cost: { energy: 25 },
        effects: {
            unlockDataProcessing: true,
            description: 'Unlock Data Processing button'
        }
    },

    network_basics: {
        id: 'network_basics',
        name: 'Network Basics',
        icon: '🌐',
        tier: 1,
        x: 700,
        y: 450,
        description: 'Learn the fundamentals of networking.',
        requires: ['core'],
        cost: { energy: 20 },
        effects: {
            description: 'Required for advanced networking nodes'
        }
    },

    // Tier 2 - Intermediate unlocks
    generator_mk1: {
        id: 'generator_mk1',
        name: 'Generator Mk1',
        icon: '🔋',
        tier: 2,
        x: 400,
        y: 150,
        description: 'Basic energy generator. Produces energy automatically.',
        requires: ['energy_boost'],
        cost: { energy: 50, data: 5 },
        effects: {
            automation: { resource: 'energy', rate: 1 },
            description: '+1 Energy/second (passive)'
        }
    },

    efficiency_1: {
        id: 'efficiency_1',
        name: 'Efficiency I',
        icon: '📈',
        tier: 2,
        x: 550,
        y: 80,
        description: 'Improves energy generation efficiency.',
        requires: ['energy_boost'],
        cost: { energy: 75 },
        effects: {
            energyPerClick: 2,
            description: '+2 Energy per click'
        }
    },

    data_storage: {
        id: 'data_storage',
        name: 'Data Storage',
        icon: '💾',
        tier: 2,
        x: 850,
        y: 80,
        description: 'Store and accumulate more data.',
        requires: ['data_processing'],
        cost: { energy: 40, data: 10 },
        effects: {
            dataPerClick: 1,
            description: '+1 Data per process'
        }
    },

    data_miner: {
        id: 'data_miner',
        name: 'Data Miner',
        icon: '⛏️',
        tier: 2,
        x: 1000,
        y: 150,
        description: 'Automatically mines data from the network.',
        requires: ['data_processing'],
        cost: { energy: 100, data: 15 },
        effects: {
            automation: { resource: 'data', rate: 0.5 },
            description: '+0.5 Data/second (passive)'
        }
    },

    router: {
        id: 'router',
        name: 'Router',
        icon: '📡',
        tier: 2,
        x: 600,
        y: 550,
        description: 'Routes data more efficiently through your network.',
        requires: ['network_basics'],
        cost: { energy: 60, data: 20 },
        effects: {
            dataMultiplier: 1.5,
            description: '1.5x Data processing'
        }
    },

    firewall: {
        id: 'firewall',
        name: 'Firewall',
        icon: '🛡️',
        tier: 2,
        x: 800,
        y: 550,
        description: 'Protects your network and improves stability.',
        requires: ['network_basics'],
        cost: { energy: 80, data: 25 },
        effects: {
            description: 'Required for security branch'
        }
    },

    // Tier 3 - Advanced unlocks
    generator_mk2: {
        id: 'generator_mk2',
        name: 'Generator Mk2',
        icon: '🔌',
        tier: 3,
        x: 300,
        y: 50,
        description: 'Advanced generator with improved output.',
        requires: ['generator_mk1'],
        cost: { energy: 200, data: 30 },
        effects: {
            automation: { resource: 'energy', rate: 3 },
            description: '+3 Energy/second (passive)'
        }
    },

    overclocking: {
        id: 'overclocking',
        name: 'Overclocking',
        icon: '🚀',
        tier: 3,
        x: 450,
        y: 0,
        description: 'Push your systems beyond their limits.',
        requires: ['efficiency_1', 'generator_mk1'],
        cost: { energy: 300, data: 50 },
        effects: {
            energyPerClick: 5,
            description: '+5 Energy per click'
        }
    },

    parallel_processing: {
        id: 'parallel_processing',
        name: 'Parallel Process',
        icon: '🔀',
        tier: 3,
        x: 950,
        y: 0,
        description: 'Process multiple data streams simultaneously.',
        requires: ['data_storage', 'data_miner'],
        cost: { energy: 250, data: 75 },
        effects: {
            dataPerClick: 3,
            dataMultiplier: 2,
            description: '+3 Data per process, 2x multiplier'
        }
    },

    bandwidth_unlock: {
        id: 'bandwidth_unlock',
        name: 'Bandwidth',
        icon: '📶',
        tier: 3,
        x: 700,
        y: 650,
        description: 'Unlocks bandwidth as a new resource.',
        requires: ['router', 'firewall'],
        cost: { energy: 500, data: 100 },
        effects: {
            unlockBandwidth: true,
            description: 'Unlock Bandwidth resource'
        }
    },

    encryption: {
        id: 'encryption',
        name: 'Encryption',
        icon: '🔐',
        tier: 3,
        x: 900,
        y: 650,
        description: 'Secure data transmission protocols.',
        requires: ['firewall'],
        cost: { energy: 400, data: 80 },
        effects: {
            description: 'Required for advanced security'
        }
    },

    // Tier 4 - Expert unlocks
    fusion_core: {
        id: 'fusion_core',
        name: 'Fusion Core',
        icon: '☢️',
        tier: 4,
        x: 200,
        y: 0,
        description: 'Massive energy production facility.',
        requires: ['generator_mk2'],
        cost: { energy: 1000, data: 200, bandwidth: 50 },
        effects: {
            automation: { resource: 'energy', rate: 10 },
            description: '+10 Energy/second (passive)'
        }
    },

    quantum_processor: {
        id: 'quantum_processor',
        name: 'Quantum CPU',
        icon: '💠',
        tier: 4,
        x: 1100,
        y: 0,
        description: 'Quantum computing capabilities.',
        requires: ['parallel_processing'],
        cost: { energy: 800, data: 300, bandwidth: 75 },
        effects: {
            automation: { resource: 'data', rate: 5 },
            dataMultiplier: 3,
            description: '+5 Data/s, 3x multiplier'
        }
    },

    neural_network: {
        id: 'neural_network',
        name: 'Neural Network',
        icon: '🧠',
        tier: 4,
        x: 700,
        y: 800,
        description: 'AI-powered automation system.',
        requires: ['bandwidth_unlock'],
        cost: { energy: 1500, data: 500, bandwidth: 100 },
        effects: {
            automation: { resource: 'bandwidth', rate: 1 },
            allRatesMultiplier: 1.5,
            description: '+1 Bandwidth/s, 1.5x all rates'
        }
    },

    zero_day: {
        id: 'zero_day',
        name: 'Zero Day',
        icon: '💀',
        tier: 4,
        x: 1000,
        y: 750,
        description: 'Exploit unknown vulnerabilities.',
        requires: ['encryption'],
        cost: { energy: 2000, data: 400, bandwidth: 150 },
        effects: {
            instantUnlock: true,
            description: 'Instantly unlock one random locked node'
        }
    }
};

// Computed game values
let computedValues = {
    energyPerClick: 1,
    dataPerClick: 1,
    dataMultiplier: 1,
    allRatesMultiplier: 1
};

// Initialize game
function init() {
    loadGame();
    recalculateValues();
    renderSkillTree();
    updateUI();
    setupEventListeners();
    startGameLoop();
    
    // Center view on core node
    centerOnNode('core');
}

// Render the skill tree
function renderSkillTree() {
    const nodesContainer = document.getElementById('nodes');
    const connectionsContainer = document.getElementById('connections');
    
    nodesContainer.innerHTML = '';
    connectionsContainer.innerHTML = '';
    
    // Draw connections first
    Object.values(nodes).forEach(node => {
        node.requires.forEach(reqId => {
            const reqNode = nodes[reqId];
            if (reqNode) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', reqNode.x + 40);
                line.setAttribute('y1', reqNode.y + 40);
                line.setAttribute('x2', node.x + 40);
                line.setAttribute('y2', node.y + 40);
                
                if (gameState.unlockedNodes.has(reqId) && gameState.unlockedNodes.has(node.id)) {
                    line.classList.add('unlocked');
                }
                
                connectionsContainer.appendChild(line);
            }
        });
    });
    
    // Draw nodes
    Object.values(nodes).forEach(node => {
        const nodeEl = document.createElement('div');
        nodeEl.className = `node tier-${node.tier}`;
        nodeEl.dataset.nodeId = node.id;
        nodeEl.style.left = `${node.x}px`;
        nodeEl.style.top = `${node.y}px`;
        
        // Determine node state
        const isUnlocked = gameState.unlockedNodes.has(node.id);
        const isAvailable = !isUnlocked && canUnlock(node);
        
        if (isUnlocked) {
            nodeEl.classList.add('unlocked');
        } else if (isAvailable) {
            nodeEl.classList.add('available');
        } else {
            nodeEl.classList.add('locked');
        }
        
        nodeEl.innerHTML = `
            <span class="node-icon">${node.icon}</span>
            <span class="node-name">${node.name}</span>
        `;
        
        nodeEl.addEventListener('click', () => selectNode(node.id));
        
        nodesContainer.appendChild(nodeEl);
    });
}

// Check if a node can be unlocked
function canUnlock(node) {
    // Check if all required nodes are unlocked
    const requirementsMet = node.requires.every(reqId => gameState.unlockedNodes.has(reqId));
    if (!requirementsMet) return false;
    
    return true;
}

// Check if player can afford a node
function canAfford(node) {
    for (const [resource, amount] of Object.entries(node.cost)) {
        if (gameState.resources[resource] < amount) return false;
    }
    return true;
}

// Select a node
function selectNode(nodeId) {
    gameState.selectedNode = nodeId;
    
    // Update visual selection
    document.querySelectorAll('.node').forEach(el => el.classList.remove('selected'));
    document.querySelector(`[data-node-id="${nodeId}"]`)?.classList.add('selected');
    
    // Update info panel
    updateInfoPanel(nodeId);
}

// Update the info panel
function updateInfoPanel(nodeId) {
    const node = nodes[nodeId];
    const details = document.getElementById('node-details');
    const isUnlocked = gameState.unlockedNodes.has(nodeId);
    const isAvailable = canUnlock(node);
    const affordable = canAfford(node);
    
    let costHTML = '';
    if (Object.keys(node.cost).length > 0) {
        costHTML = `
            <div class="node-info-section">
                <h3>Cost</h3>
                <ul class="cost-list">
                    ${Object.entries(node.cost).map(([resource, amount]) => {
                        const hasEnough = gameState.resources[resource] >= amount;
                        return `<li>
                            <span>${resource.charAt(0).toUpperCase() + resource.slice(1)}</span>
                            <span class="${hasEnough ? 'affordable' : 'not-affordable'}">${formatNumber(gameState.resources[resource])} / ${formatNumber(amount)}</span>
                        </li>`;
                    }).join('')}
                </ul>
            </div>
        `;
    }
    
    let requiresHTML = '';
    if (node.requires.length > 0) {
        requiresHTML = `
            <div class="node-info-section">
                <h3>Requires</h3>
                <ul class="cost-list">
                    ${node.requires.map(reqId => {
                        const reqNode = nodes[reqId];
                        const hasReq = gameState.unlockedNodes.has(reqId);
                        return `<li>
                            <span>${reqNode.icon} ${reqNode.name}</span>
                            <span class="${hasReq ? 'affordable' : 'not-affordable'}">${hasReq ? '✓' : '✗'}</span>
                        </li>`;
                    }).join('')}
                </ul>
            </div>
        `;
    }
    
    let actionHTML = '';
    if (isUnlocked) {
        actionHTML = '<div class="unlocked-badge">✓ Unlocked</div>';
    } else if (isAvailable) {
        actionHTML = `<button class="unlock-btn" ${affordable ? '' : 'disabled'} onclick="unlockNode('${nodeId}')">
            ${affordable ? 'Unlock' : 'Cannot Afford'}
        </button>`;
    } else {
        actionHTML = '<button class="unlock-btn" disabled>Requirements Not Met</button>';
    }
    
    details.innerHTML = `
        <div class="node-info-header">
            <span class="node-info-icon">${node.icon}</span>
            <div>
                <div class="node-info-title">${node.name}</div>
                <div class="node-info-tier">Tier ${node.tier}</div>
            </div>
        </div>
        <div class="node-info-section">
            <h3>Description</h3>
            <p>${node.description}</p>
        </div>
        <div class="node-info-section">
            <h3>Effects</h3>
            <p>${node.effects.description}</p>
        </div>
        ${requiresHTML}
        ${costHTML}
        ${actionHTML}
    `;
}

// Unlock a node
function unlockNode(nodeId) {
    const node = nodes[nodeId];
    
    if (!canUnlock(node) || !canAfford(node)) return;
    
    // Deduct costs
    for (const [resource, amount] of Object.entries(node.cost)) {
        gameState.resources[resource] -= amount;
    }
    
    // Add to unlocked nodes
    gameState.unlockedNodes.add(nodeId);
    
    // Apply effects
    applyNodeEffects(node);
    
    // Recalculate values
    recalculateValues();
    
    // Update UI
    renderSkillTree();
    updateUI();
    updateInfoPanel(nodeId);
    
    // Show notification
    showNotification(`${node.icon} ${node.name} unlocked!`, 'success');
    
    // Save game
    saveGame();
}

// Apply node effects
function applyNodeEffects(node) {
    const effects = node.effects;
    
    // Unlock data processing
    if (effects.unlockDataProcessing) {
        document.getElementById('process-data').classList.remove('locked');
        document.getElementById('process-data').disabled = false;
    }
    
    // Unlock bandwidth
    if (effects.unlockBandwidth) {
        document.getElementById('bandwidth-container').classList.remove('hidden');
    }
    
    // Add automation
    if (effects.automation) {
        if (!gameState.automations[effects.automation.resource]) {
            gameState.automations[effects.automation.resource] = 0;
        }
        gameState.automations[effects.automation.resource] += effects.automation.rate;
        updateAutomationsUI();
    }
    
    // Instant unlock (Zero Day effect)
    if (effects.instantUnlock) {
        const lockedAvailableNodes = Object.values(nodes).filter(n => 
            !gameState.unlockedNodes.has(n.id) && canUnlock(n)
        );
        if (lockedAvailableNodes.length > 0) {
            const randomNode = lockedAvailableNodes[Math.floor(Math.random() * lockedAvailableNodes.length)];
            gameState.unlockedNodes.add(randomNode.id);
            applyNodeEffects(randomNode);
            showNotification(`${randomNode.icon} ${randomNode.name} instantly unlocked!`, 'info');
        }
    }
}

// Recalculate computed values based on unlocked nodes
function recalculateValues() {
    computedValues = {
        energyPerClick: 1,
        dataPerClick: 1,
        dataMultiplier: 1,
        allRatesMultiplier: 1
    };
    
    gameState.unlockedNodes.forEach(nodeId => {
        const node = nodes[nodeId];
        if (!node) return;
        
        if (node.effects.energyPerClick) {
            computedValues.energyPerClick += node.effects.energyPerClick;
        }
        if (node.effects.dataPerClick) {
            computedValues.dataPerClick += node.effects.dataPerClick;
        }
        if (node.effects.dataMultiplier) {
            computedValues.dataMultiplier *= node.effects.dataMultiplier;
        }
        if (node.effects.allRatesMultiplier) {
            computedValues.allRatesMultiplier *= node.effects.allRatesMultiplier;
        }
    });
    
    // Calculate resource rates
    gameState.resourceRates.energy = (gameState.automations.energy || 0) * computedValues.allRatesMultiplier;
    gameState.resourceRates.data = (gameState.automations.data || 0) * computedValues.allRatesMultiplier * computedValues.dataMultiplier;
    gameState.resourceRates.bandwidth = (gameState.automations.bandwidth || 0) * computedValues.allRatesMultiplier;
}

// Update automations UI
function updateAutomationsUI() {
    const container = document.getElementById('automations');
    const list = document.getElementById('automation-list');
    
    if (Object.keys(gameState.automations).length === 0) {
        container.classList.add('hidden');
        return;
    }
    
    container.classList.remove('hidden');
    list.innerHTML = '';
    
    for (const [resource, rate] of Object.entries(gameState.automations)) {
        if (rate > 0) {
            const item = document.createElement('div');
            item.className = 'automation-item active';
            
            const effectiveRate = resource === 'data' 
                ? rate * computedValues.allRatesMultiplier * computedValues.dataMultiplier
                : rate * computedValues.allRatesMultiplier;
            
            item.innerHTML = `
                <div class="automation-header">
                    <span class="automation-name">${resource.charAt(0).toUpperCase() + resource.slice(1)} Gen</span>
                </div>
                <div class="automation-output">+${formatNumber(effectiveRate)}/second</div>
            `;
            list.appendChild(item);
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    // Generate energy button
    document.getElementById('generate-energy').addEventListener('click', () => {
        gameState.resources.energy += computedValues.energyPerClick;
        gameState.totalResources.energy += computedValues.energyPerClick;
        updateUI();
    });
    
    // Process data button
    document.getElementById('process-data').addEventListener('click', () => {
        if (gameState.resources.energy >= 5) {
            gameState.resources.energy -= 5;
            const dataGain = Math.floor(computedValues.dataPerClick * computedValues.dataMultiplier);
            gameState.resources.data += dataGain;
            gameState.totalResources.data += dataGain;
            updateUI();
        }
    });
    
    // Update button text
    const energyBtn = document.getElementById('generate-energy');
    energyBtn.querySelector('.btn-value').textContent = `+${computedValues.energyPerClick}`;
}

// Game loop
function startGameLoop() {
    setInterval(() => {
        const now = Date.now();
        const delta = (now - gameState.lastUpdate) / 1000;
        gameState.lastUpdate = now;
        
        // Apply automation rates
        gameState.resources.energy += gameState.resourceRates.energy * delta;
        gameState.resources.data += gameState.resourceRates.data * delta;
        gameState.resources.bandwidth += gameState.resourceRates.bandwidth * delta;
        
        gameState.totalResources.energy += gameState.resourceRates.energy * delta;
        gameState.totalResources.data += gameState.resourceRates.data * delta;
        gameState.totalResources.bandwidth += gameState.resourceRates.bandwidth * delta;
        
        updateUI();
        
        // Update info panel if a node is selected
        if (gameState.selectedNode) {
            updateInfoPanel(gameState.selectedNode);
        }
        
        // Check for newly available nodes
        renderSkillTree();
    }, 100);
    
    // Auto-save every 30 seconds
    setInterval(saveGame, 30000);
}

// Update UI elements
function updateUI() {
    document.getElementById('energy-count').textContent = formatNumber(Math.floor(gameState.resources.energy));
    document.getElementById('data-count').textContent = formatNumber(Math.floor(gameState.resources.data));
    document.getElementById('bandwidth-count').textContent = formatNumber(Math.floor(gameState.resources.bandwidth));
    
    document.getElementById('energy-rate').textContent = `(+${formatNumber(gameState.resourceRates.energy)}/s)`;
    document.getElementById('data-rate').textContent = `(+${formatNumber(gameState.resourceRates.data)}/s)`;
    document.getElementById('bandwidth-rate').textContent = `(+${formatNumber(gameState.resourceRates.bandwidth)}/s)`;
    
    document.getElementById('nodes-unlocked').textContent = gameState.unlockedNodes.size;
    document.getElementById('total-energy').textContent = formatNumber(Math.floor(gameState.totalResources.energy));
    document.getElementById('total-data').textContent = formatNumber(Math.floor(gameState.totalResources.data));
    
    // Update button values
    document.querySelector('#generate-energy .btn-value').textContent = `+${computedValues.energyPerClick}`;
    
    const dataBtn = document.getElementById('process-data');
    const dataGain = Math.floor(computedValues.dataPerClick * computedValues.dataMultiplier);
    dataBtn.querySelector('.btn-value').textContent = `+${dataGain} (costs 5⚡)`;
    dataBtn.disabled = dataBtn.classList.contains('locked') || gameState.resources.energy < 5;
}

// Format large numbers
function formatNumber(num) {
    if (num < 1000) return Math.floor(num).toString();
    if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
    if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
    return (num / 1000000000).toFixed(1) + 'B';
}

// Center view on a node
function centerOnNode(nodeId) {
    const node = nodes[nodeId];
    const container = document.getElementById('skill-tree-container');
    
    container.scrollLeft = node.x - container.clientWidth / 2 + 40;
    container.scrollTop = node.y - container.clientHeight / 2 + 40;
}

// Show notification
function showNotification(message, type = 'info') {
    const container = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Save game
function saveGame() {
    const saveData = {
        resources: gameState.resources,
        totalResources: gameState.totalResources,
        unlockedNodes: Array.from(gameState.unlockedNodes),
        automations: gameState.automations,
        lastUpdate: Date.now()
    };
    localStorage.setItem('networkSimulatorSave', JSON.stringify(saveData));
}

// Load game
function loadGame() {
    const saveData = localStorage.getItem('networkSimulatorSave');
    if (saveData) {
        const data = JSON.parse(saveData);
        gameState.resources = data.resources || gameState.resources;
        gameState.totalResources = data.totalResources || gameState.totalResources;
        gameState.unlockedNodes = new Set(data.unlockedNodes || ['core']);
        gameState.automations = data.automations || {};
        
        // Calculate offline progress
        const offlineTime = (Date.now() - (data.lastUpdate || Date.now())) / 1000;
        if (offlineTime > 0 && offlineTime < 86400) { // Max 24 hours offline
            recalculateValues();
            gameState.resources.energy += gameState.resourceRates.energy * offlineTime;
            gameState.resources.data += gameState.resourceRates.data * offlineTime;
            gameState.resources.bandwidth += gameState.resourceRates.bandwidth * offlineTime;
            
            if (offlineTime > 60) {
                showNotification(`Welcome back! Earned resources while away.`, 'info');
            }
        }
        
        // Re-apply effects for unlocked nodes
        gameState.unlockedNodes.forEach(nodeId => {
            const node = nodes[nodeId];
            if (node && node.effects.unlockDataProcessing) {
                document.getElementById('process-data').classList.remove('locked');
                document.getElementById('process-data').disabled = false;
            }
            if (node && node.effects.unlockBandwidth) {
                document.getElementById('bandwidth-container').classList.remove('hidden');
            }
        });
        
        updateAutomationsUI();
    }
}

// Reset game (for testing)
function resetGame() {
    if (confirm('Are you sure you want to reset all progress?')) {
        localStorage.removeItem('networkSimulatorSave');
        location.reload();
    }
}

// Start the game
document.addEventListener('DOMContentLoaded', init);
