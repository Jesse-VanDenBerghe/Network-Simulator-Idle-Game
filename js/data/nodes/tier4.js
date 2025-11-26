// Tier 4 Nodes - All branches (4 each) + Research gate
// ======================================================

export const tier4Nodes = {
    // === POWER BRANCH (4 nodes) ===
    fusion_reactor: {
        id: 'fusion_reactor',
        name: 'Fusion Reactor',
        icon: '⚛️',
        tier: 4,
        branch: 'power',
        description: 'Advanced fusion energy generation.',
        requires: ['generator_mk2'],
        cost: { energy: 50, data: 20 },
        effects: {
            automation: { resource: 'energy', rate: 10 },
            description: '+10 Energy/second'
        }
    },

    // Placeholder power nodes (to be expanded)
    power_node_t4_2: {
        id: 'power_node_t4_2',
        name: 'Power Amplifier',
        icon: '📶',
        tier: 4,
        branch: 'power',
        requires: ['overclocking'],
        cost: { energy: 40, data: 15 },
        effects: { energyPerClick: 10, description: '+10 Energy per click' }
    },
    power_node_t4_3: {
        id: 'power_node_t4_3',
        name: 'Energy Grid',
        icon: '🔋',
        tier: 4,
        branch: 'power',
        requires: ['wind_turbine'],
        cost: { energy: 45, data: 18 },
        effects: { automation: { resource: 'energy', rate: 8 }, description: '+8 Energy/second' }
    },
    power_node_t4_4: {
        id: 'power_node_t4_4',
        name: 'Power Optimizer',
        icon: '⚡',
        tier: 4,
        branch: 'power',
        requires: ['generator_mk2'],
        cost: { energy: 48, data: 20 },
        effects: { allRatesMultiplier: 1.15, description: '1.15x all passive rates' }
    },

    // === PROCESSING BRANCH (4 nodes) ===
    ai_processor: {
        id: 'ai_processor',
        name: 'AI Processor',
        icon: '🤖',
        tier: 4,
        branch: 'processing',
        description: 'AI-powered data processing.',
        requires: ['parallel_processing'],
        cost: { energy: 60, data: 30 },
        effects: {
            dataMultiplier: 3,
            description: '3x Data gains'
        }
    },

    // Placeholder processing nodes
    processing_node_t4_2: {
        id: 'processing_node_t4_2',
        name: 'Data Accelerator',
        icon: '💨',
        tier: 4,
        branch: 'processing',
        requires: ['database'],
        cost: { energy: 55, data: 25 },
        effects: { automation: { resource: 'data', rate: 3 }, description: '+3 Data/second' }
    },
    processing_node_t4_3: {
        id: 'processing_node_t4_3',
        name: 'Cache System',
        icon: '📦',
        tier: 4,
        branch: 'processing',
        requires: ['compression'],
        cost: { energy: 50, data: 22 },
        effects: { dataPerClick: 5, description: '+5 Data per process' }
    },
    processing_node_t4_4: {
        id: 'processing_node_t4_4',
        name: 'Data Pipeline',
        icon: '🔄',
        tier: 4,
        branch: 'processing',
        requires: ['database'],
        cost: { energy: 58, data: 28 },
        effects: { dataMultiplier: 2.5, description: '2.5x Data gains' }
    },

    // === NETWORK BRANCH (4 nodes) ===
    cdn: {
        id: 'cdn',
        name: 'CDN',
        icon: '🌐',
        tier: 4,
        branch: 'network',
        description: 'Content delivery network.',
        requires: ['router'],
        cost: { energy: 50, data: 25 },
        effects: {
            automation: { resource: 'data', rate: 2 },
            description: '+2 Data/second'
        }
    },

    // Placeholder network nodes
    network_node_t4_2: {
        id: 'network_node_t4_2',
        name: 'Load Balancer',
        icon: '⚖️',
        tier: 4,
        branch: 'network',
        requires: ['network_switch'],
        cost: { energy: 48, data: 23 },
        effects: { dataMultiplier: 1.8, description: '1.8x Data processing' }
    },
    network_node_t4_3: {
        id: 'network_node_t4_3',
        name: 'Proxy Server',
        icon: '🔀',
        tier: 4,
        branch: 'network',
        requires: ['firewall'],
        cost: { energy: 52, data: 24 },
        effects: { automation: { resource: 'data', rate: 1.5 }, description: '+1.5 Data/second' }
    },
    network_node_t4_4: {
        id: 'network_node_t4_4',
        name: 'Network Fabric',
        icon: '🕸️',
        tier: 4,
        branch: 'network',
        requires: ['router'],
        cost: { energy: 55, data: 26 },
        effects: { allRatesMultiplier: 1.12, description: '1.12x all passive rates' }
    },

    // === RESEARCH BRANCH (4 nodes) ===
    optimization: {
        id: 'optimization',
        name: 'Optimization',
        icon: '⚙️',
        tier: 4,
        branch: 'research',
        requires: ['algorithms'],
        cost: { energy: 50, data: 22 },
        effects: { allRatesMultiplier: 1.2, description: '1.2x all passive rates' }
    },
    research_lab: {
        id: 'research_lab',
        name: 'Research Lab',
        icon: '🔬',
        tier: 4,
        branch: 'research',
        requires: ['algorithms'],
        cost: { energy: 48, data: 21 },
        effects: { energyPerClick: 8, description: '+8 Energy per click' }
    },
    innovation_hub: {
        id: 'innovation_hub',
        name: 'Innovation Hub',
        icon: '💡',
        tier: 4,
        branch: 'research',
        requires: ['optimization'],
        cost: { energy: 52, data: 24 },
        effects: { dataMultiplier: 2, description: '2x Data gains' }
    },
    quantum_lab: {
        id: 'quantum_lab',
        name: 'Quantum Lab',
        icon: '⚛️',
        tier: 4,
        branch: 'research',
        requires: ['research_lab'],
        cost: { energy: 55, data: 26 },
        effects: { allRatesMultiplier: 1.15, description: '1.15x all passive rates' }
    },

    // === SECURITY BRANCH TIER 4 (unlocks Security) ===
    encryption: {
        id: 'encryption',
        name: 'Encryption',
        icon: '🔐',
        tier: 4,
        branch: 'security',
        isTierGate: true,
        description: 'Secure data transmission and unlock Security branch.',
        requires: ['core'],
        cost: { energy: 500, data: 150 },
        effects: {
            description: 'Unlocks Security branch and Tier 5'
        }
    }
};
