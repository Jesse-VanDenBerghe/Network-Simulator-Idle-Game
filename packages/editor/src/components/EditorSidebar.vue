<script setup lang="ts">
import { useNodeGraphManager } from '@/composables/useNodeGraphManager';
import { BRANCHES, type BranchId } from '@network-simulator/shared';


const {
    totalNodeCount,
    filteredNodes,
    branchCounts,
    filterBranch
} = useNodeGraphManager();


function setBranchFilter(branch: BranchId | null) {
    filterBranch.value = branch;
}

</script>

<template>
    <aside class="sidebar">
        <section class="sidebar-section">
            <h3>Node Statistics</h3>
            <div class="stat-item">
                <span class="stat-label">Total Nodes:</span>
                <span class="stat-value">{{ totalNodeCount }}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Visible:</span>
                <span class="stat-value">{{ filteredNodes.length }}</span>
            </div>
        </section>

        <section class="sidebar-section">
            <h3>Branch Filters</h3>
            <div class="filter-buttons">
                <button
                    :class="['filter-btn', { active: filterBranch === null }]"
                    @click="setBranchFilter(null)"
                >
                    All ({{ totalNodeCount }})
                </button>

                <button
                    v-for="branch in BRANCHES"
                    :key="branch.id"
                    :class="['filter-btn', { active: filterBranch === branch.id }]"
                    :style="filterBranch === branch.id ? {
                        background: branch.color,
                        borderColor: branch.color
                    } : {}"
                    @click="setBranchFilter(branch.id)"
                >
                    {{ branch.icon }} {{ branch.label }} ({{ branchCounts[branch.id] }})
                </button>
            </div>
        </section>


    </aside>
</template>

<style scoped>
.sidebar {
    width: 280px;
    background: #242424;
    border-right: 2px solid #3a3a3a;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
}

.sidebar-section {
    background: #2a2a2a;
    border-radius: 8px;
    padding: 1rem;
}

.sidebar-section h3 {
    margin: 0 0 1rem 0;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #4a9eff;
    border-bottom: 1px solid #3a3a3a;
    padding-bottom: 0.5rem;
}

.filter-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.filter-btn {
    padding: 0.75rem 1rem;
    background: #333;
    border: 2px solid #444;
    border-radius: 6px;
    color: #ccc;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.2s;
    text-align: left;
}

.filter-btn:hover {
    background: #3a3a3a;
    border-color: #555;
}

.filter-btn.active {
    background: #4a9eff;
    border-color: #4a9eff;
    color: #fff;
}

.stat-item {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid #333;
}

.stat-item:last-child {
    border-bottom: none;
}

.stat-label {
    color: #aaa;
    font-size: 0.9rem;
}

.stat-value {
    color: #4a9eff;
    font-weight: 600;
}
</style>