import { allNodes, BranchId, NodeTier, type Node } from "@network-simulator/shared";
import { computed, ComputedRef, reactive, ref, Ref } from "vue";

/**
 * Editor state for node graph management
 */
interface EditorState {
    selectedNodeId: string | null;
    filterBranch: BranchId | null;
    filterTier: NodeTier | null;
    searchQuery: string;
    isDirty: boolean;
}

export interface UseNodeGraphManagerReturn {
    // State
    nodes: ComputedRef<Map<string, Node>>;
    selectedNode: ComputedRef<Node | null>;
    filteredNodes: ComputedRef<Node[]>;
    modifiedNodeIds: Ref<Set<string>>;
    isDirty: ComputedRef<boolean>;

    // Filters
    filterBranch: Ref<BranchId | null>;
    filterTier: Ref<NodeTier | null>;
    searchQuery: Ref<string>;

    // Computed stats
    totalNodeCount: ComputedRef<number>;
    modifiedNodeCount: ComputedRef<number>;
    branchCounts: ComputedRef<Record<BranchId, number>>;

    // Methods
    selectNode: (nodeId: string | null) => void;
    updateNode: (nodeId: string, updatedData: Partial<Node>) => void;
    resetNode: (nodeId: string) => void;
    resetAllModifications: () => void;
    getNode: (nodeId: string) => Node | undefined;
}

export function useNodeGraphManager(): UseNodeGraphManagerReturn {
    //=== State ===//
    const originalNodes = new Map<string, Node>(
        Object.entries(allNodes).map(([id, node]) => [id, node])
    );

    const modifications = reactive<Map<string, Partial<Node>>>(new Map());

    const modifiedNodeIds = ref<Set<string>>(new Set());

    const editorState = reactive<EditorState>({
        selectedNodeId: null,
        filterBranch: null,
        filterTier: null,
        searchQuery: "",
        isDirty: false,
    });

    //=== Computed ===//
    const nodes = computed<Map<string, Node>>(() => {
        const merged = new Map<string, Node>();

        originalNodes.forEach((node, id) => {
            merged.set(id, node);
        });

        modifications.forEach((modData, id) => {
            const original = originalNodes.get(id);
            if (original) {
                merged.set(id, { ...original, ...modData });
            }
        });

        return merged;
    });

    const selectedNode = computed<Node | null>(() => {
        if (!editorState.selectedNodeId) return null;
        return nodes.value.get(editorState.selectedNodeId) ?? null;
    });

    const filteredNodes = computed<Node[]>(() => {
        let result = Array.from(nodes.value.values());

        if (editorState.filterBranch) {
            result = result.filter(
                (node) => node.branch === editorState.filterBranch
            );
        }

        if (editorState.filterTier !== null) {
            result = result.filter(
                (node) => node.tier === editorState.filterTier
            );
        }

        if (editorState.searchQuery.trim() !== "") {
            const query = editorState.searchQuery.toLowerCase();
            result = result.filter(
                (node) =>
                    node.id.toLowerCase().includes(query) ||
                    node.name.toLowerCase().includes(query) ||
                    node.description?.toLowerCase().includes(query)
            );
        }

        return result;
    });

    const totalNodeCount = computed<number>(() => nodes.value.size);

    const modifiedCount = computed<number>(() => modifiedNodeIds.value.size);

    const branchCounts = computed<Record<BranchId, number>>(() => {
        const counts = { energy: 0, computer: 0 } as Record<BranchId, number>;
        nodes.value.forEach((node) => {
            counts[node.branch as BranchId]++;
        });
        return counts;
    });

    const isDirty = computed<boolean>(() => modifiedNodeIds.value.size > 0);

    //=== Methods ===//
    function selectNode(nodeId: string | null): void {
        editorState.selectedNodeId = nodeId;
    }

    function updateNode(nodeId: string, updatedData: Partial<Node>): void {
        const existing = modifications.get(nodeId) ?? {};
        modifications.set(nodeId, { ...existing, ...updatedData });
        modifiedNodeIds.value.add(nodeId);
    }

    function resetNode(nodeId: string): void {
        modifications.delete(nodeId);
        modifiedNodeIds.value.delete(nodeId);
    }

    function resetAllModifications(): void {
        modifications.clear();
        modifiedNodeIds.value.clear();
    }

    function getNode(nodeId: string): Node | undefined {
        return nodes.value.get(nodeId);
    }

    return {
        // State
        nodes,
        selectedNode,
        filteredNodes,
        modifiedNodeIds,
        isDirty,

        // filters
        filterBranch: computed({
            get: () => editorState.filterBranch,
            set: (value) => (editorState.filterBranch = value),
        }),
        filterTier: computed({
            get: () => editorState.filterTier,
            set: (value) => (editorState.filterTier = value),
        }),
        searchQuery: computed({
            get: () => editorState.searchQuery,
            set: (value) => (editorState.searchQuery = value),
        }),

        // Computed stats
        totalNodeCount,
        modifiedNodeCount: modifiedCount,
        branchCounts,

        // Methods
        selectNode,
        updateNode,
        resetNode,
        resetAllModifications,
        getNode,
    };

}