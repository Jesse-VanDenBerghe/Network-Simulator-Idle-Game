// Editor Composable
// ==================
// CRUD operations and dirty tracking for narration entries

const { reactive, computed, readonly, toRefs } = Vue;

/**
 * Default entry template
 */
const DEFAULT_ENTRY = {
    id: '',
    type: 'narration',
    message: '',
    duration: 8000,
    priority: 5,
    persistAcrossAscension: false,
    trigger: {
        type: 'onNodeUnlocked',
        nodeId: ''
    }
};

/**
 * Editor composable for managing narration entries
 */
function useEditor() {
    const state = reactive({
        // Current file metadata
        currentFile: null,       // { filename, path, sha, label }
        
        // All loaded files with their entries
        files: {},               // { [filename]: { entries, originalEntries, sha, path, label } }
        
        // Currently selected entry index
        selectedIndex: -1,
        
        // Edit mode (vs playback mode)
        editMode: false
    });

    // Computed: current file's entries
    const entries = computed(() => {
        if (!state.currentFile) return [];
        return state.files[state.currentFile.filename]?.entries || [];
    });

    // Computed: currently selected entry
    const selectedEntry = computed(() => {
        if (state.selectedIndex < 0 || state.selectedIndex >= entries.value.length) {
            return null;
        }
        return entries.value[state.selectedIndex];
    });

    // Computed: is current file dirty?
    const isCurrentFileDirty = computed(() => {
        if (!state.currentFile) return false;
        const file = state.files[state.currentFile.filename];
        if (!file) return false;
        return JSON.stringify(file.entries) !== JSON.stringify(file.originalEntries);
    });

    // Computed: all dirty files
    const dirtyFiles = computed(() => {
        return Object.entries(state.files)
            .filter(([_, file]) => JSON.stringify(file.entries) !== JSON.stringify(file.originalEntries))
            .map(([filename, file]) => ({
                filename,
                path: file.path,
                sha: file.sha,
                entries: file.entries,
                originalEntries: file.originalEntries,
                changes: computeChanges(file.originalEntries, file.entries)
            }));
    });

    // Computed: has any dirty files?
    const hasDirtyFiles = computed(() => dirtyFiles.value.length > 0);

    // Computed: total change count
    const totalChanges = computed(() => {
        return dirtyFiles.value.reduce((sum, f) => {
            return sum + f.changes.added + f.changes.modified + f.changes.deleted;
        }, 0);
    });

    /**
     * Compute change stats between original and current entries
     */
    function computeChanges(original, current) {
        const origIds = new Set(original.map(e => e.id));
        const currIds = new Set(current.map(e => e.id));
        
        let added = 0, deleted = 0, modified = 0;
        
        // Added: in current but not original
        for (const id of currIds) {
            if (!origIds.has(id)) added++;
        }
        
        // Deleted: in original but not current
        for (const id of origIds) {
            if (!currIds.has(id)) deleted++;
        }
        
        // Modified: exists in both but different
        for (const curr of current) {
            if (origIds.has(curr.id)) {
                const orig = original.find(e => e.id === curr.id);
                if (JSON.stringify(orig) !== JSON.stringify(curr)) {
                    modified++;
                }
            }
        }
        
        return { added, deleted, modified };
    }

    /**
     * Load a file into the editor
     * @param {Object} fileData - { filename, path, sha, label, entries }
     */
    function loadFile(fileData) {
        const { filename, path, sha, label, entries } = fileData;
        
        // Store file data (deep clone entries)
        state.files[filename] = {
            entries: JSON.parse(JSON.stringify(entries)),
            originalEntries: JSON.parse(JSON.stringify(entries)),
            sha,
            path,
            label
        };
        
        // Set as current file
        state.currentFile = { filename, path, sha, label };
        state.selectedIndex = entries.length > 0 ? 0 : -1;
    }

    /**
     * Switch to a different loaded file
     * @param {string} filename
     */
    function switchFile(filename) {
        const file = state.files[filename];
        if (!file) return false;
        
        state.currentFile = {
            filename,
            path: file.path,
            sha: file.sha,
            label: file.label
        };
        state.selectedIndex = file.entries.length > 0 ? 0 : -1;
        return true;
    }

    /**
     * Select an entry by index
     * @param {number} index
     */
    function selectEntry(index) {
        if (index >= 0 && index < entries.value.length) {
            state.selectedIndex = index;
        }
    }

    /**
     * Modify an entry field
     * @param {number} index
     * @param {string} path - dot-notation path (e.g., 'trigger.nodeId')
     * @param {*} value
     */
    function modifyEntry(index, path, value) {
        if (!state.currentFile) return;
        const file = state.files[state.currentFile.filename];
        if (!file || index < 0 || index >= file.entries.length) return;
        
        const entry = file.entries[index];
        setNestedValue(entry, path, value);
    }

    /**
     * Update entire entry object
     * @param {number} index
     * @param {Object} updates - partial entry object to merge
     */
    function updateEntry(index, updates) {
        if (!state.currentFile) return;
        const file = state.files[state.currentFile.filename];
        if (!file || index < 0 || index >= file.entries.length) return;
        
        // Deep merge updates
        const entry = file.entries[index];
        Object.assign(entry, updates);
        
        // Handle nested trigger updates
        if (updates.trigger) {
            entry.trigger = { ...entry.trigger, ...updates.trigger };
        }
    }

    /**
     * Add a new entry
     * @param {number} afterIndex - insert after this index (-1 for start)
     * @returns {number} - index of new entry
     */
    function addEntry(afterIndex = -1) {
        if (!state.currentFile) return -1;
        const file = state.files[state.currentFile.filename];
        if (!file) return -1;
        
        // Generate unique ID
        const baseId = 'new_entry';
        let id = baseId;
        let counter = 1;
        const existingIds = new Set(file.entries.map(e => e.id));
        while (existingIds.has(id)) {
            id = `${baseId}_${counter++}`;
        }
        
        const newEntry = {
            ...JSON.parse(JSON.stringify(DEFAULT_ENTRY)),
            id
        };
        
        const insertIndex = afterIndex < 0 ? 0 : afterIndex + 1;
        file.entries.splice(insertIndex, 0, newEntry);
        state.selectedIndex = insertIndex;
        
        return insertIndex;
    }

    /**
     * Delete an entry
     * @param {number} index
     */
    function deleteEntry(index) {
        if (!state.currentFile) return;
        const file = state.files[state.currentFile.filename];
        if (!file || index < 0 || index >= file.entries.length) return;
        
        file.entries.splice(index, 1);
        
        // Adjust selection
        if (state.selectedIndex >= file.entries.length) {
            state.selectedIndex = file.entries.length - 1;
        }
    }

    /**
     * Duplicate an entry
     * @param {number} index
     * @returns {number} - index of duplicated entry
     */
    function duplicateEntry(index) {
        if (!state.currentFile) return -1;
        const file = state.files[state.currentFile.filename];
        if (!file || index < 0 || index >= file.entries.length) return -1;
        
        const original = file.entries[index];
        const existingIds = new Set(file.entries.map(e => e.id));
        
        // Generate unique ID with _copy suffix
        let newId = `${original.id}_copy`;
        let counter = 1;
        while (existingIds.has(newId)) {
            newId = `${original.id}_copy_${counter++}`;
        }
        
        const duplicate = {
            ...JSON.parse(JSON.stringify(original)),
            id: newId
        };
        
        // Insert after original
        file.entries.splice(index + 1, 0, duplicate);
        state.selectedIndex = index + 1;
        
        return index + 1;
    }

    /**
     * Move entry up
     * @param {number} index
     */
    function moveUp(index) {
        if (!state.currentFile) return;
        const file = state.files[state.currentFile.filename];
        if (!file || index <= 0 || index >= file.entries.length) return;
        
        [file.entries[index - 1], file.entries[index]] = 
            [file.entries[index], file.entries[index - 1]];
        
        state.selectedIndex = index - 1;
    }

    /**
     * Move entry down
     * @param {number} index
     */
    function moveDown(index) {
        if (!state.currentFile) return;
        const file = state.files[state.currentFile.filename];
        if (!file || index < 0 || index >= file.entries.length - 1) return;
        
        [file.entries[index], file.entries[index + 1]] = 
            [file.entries[index + 1], file.entries[index]];
        
        state.selectedIndex = index + 1;
    }

    /**
     * Reorder entry via drag-drop
     * @param {number} fromIndex - source index
     * @param {number} toIndex - target index
     */
    function reorderEntry(fromIndex, toIndex) {
        if (!state.currentFile) return;
        const file = state.files[state.currentFile.filename];
        if (!file) return;
        if (fromIndex < 0 || fromIndex >= file.entries.length) return;
        if (toIndex < 0 || toIndex >= file.entries.length) return;
        if (fromIndex === toIndex) return;
        
        const [item] = file.entries.splice(fromIndex, 1);
        file.entries.splice(toIndex, 0, item);
        
        state.selectedIndex = toIndex;
    }

    /**
     * Revert current file to original
     */
    function revertCurrentFile() {
        if (!state.currentFile) return;
        const file = state.files[state.currentFile.filename];
        if (!file) return;
        
        file.entries = JSON.parse(JSON.stringify(file.originalEntries));
        state.selectedIndex = file.entries.length > 0 ? 0 : -1;
    }

    /**
     * Revert a single entry to its original state
     * @param {number} index - index of entry to revert
     * @returns {boolean} - true if reverted, false if entry was new (deleted instead)
     */
    function revertEntry(index) {
        if (!state.currentFile) return false;
        const file = state.files[state.currentFile.filename];
        if (!file || index < 0 || index >= file.entries.length) return false;
        
        const entry = file.entries[index];
        
        // First try to find by current ID
        let originalEntry = file.originalEntries.find(e => e.id === entry.id);
        
        // If not found and index is within original bounds, 
        // check if original at same index was modified (ID changed)
        if (!originalEntry && index < file.originalEntries.length) {
            const origAtIndex = file.originalEntries[index];
            // Check if this original entry still exists elsewhere in current
            const origExistsElsewhere = file.entries.some((e, i) => i !== index && e.id === origAtIndex.id);
            if (!origExistsElsewhere) {
                // The original at this index was likely modified, use it
                originalEntry = origAtIndex;
            }
        }
        
        if (originalEntry) {
            // Entry existed originally - restore it
            file.entries[index] = JSON.parse(JSON.stringify(originalEntry));
            return true;
        } else {
            // Entry is truly new - delete it
            file.entries.splice(index, 1);
            if (state.selectedIndex >= file.entries.length) {
                state.selectedIndex = file.entries.length - 1;
            }
            return false;
        }
    }

    /**
     * Revert all files to original
     */
    function revertAll() {
        for (const filename of Object.keys(state.files)) {
            const file = state.files[filename];
            file.entries = JSON.parse(JSON.stringify(file.originalEntries));
        }
        
        if (state.currentFile) {
            const file = state.files[state.currentFile.filename];
            state.selectedIndex = file?.entries.length > 0 ? 0 : -1;
        }
    }

    /**
     * Update file SHA after successful save
     * @param {string} filename
     * @param {string} newSha
     */
    function markFileSaved(filename, newSha) {
        const file = state.files[filename];
        if (!file) return;
        
        file.sha = newSha;
        file.originalEntries = JSON.parse(JSON.stringify(file.entries));
        
        // Update current file ref if same file
        if (state.currentFile?.filename === filename) {
            state.currentFile.sha = newSha;
        }
    }

    /**
     * Toggle edit mode
     */
    function setEditMode(enabled) {
        state.editMode = enabled;
    }

    /**
     * Get all file data for saving
     * @returns {Array<{filename, path, sha, entries}>}
     */
    function getDirtyFilesForSave() {
        return dirtyFiles.value.map(f => ({
            filename: f.filename,
            path: f.path,
            sha: f.sha,
            entries: f.entries
        }));
    }

    /**
     * Get file data for a specific filename
     * @param {string} filename
     * @returns {Object|null}
     */
    function getFileData(filename) {
        return state.files[filename] || null;
    }

    /**
     * Serialize entries back to JS source code
     * @param {string} filename - the filename (used to derive export name)
     * @param {Array} entries - the entries array to serialize
     * @returns {string} - valid JS source code
     */
    function serializeEntriesToJS(filename, entries) {
        // Derive export name from filename: mainStory.js -> mainStoryNarrations
        const baseName = filename.replace('.js', '');
        const exportName = baseName + 'Narrations';
        
        // Build JS source with proper constants
        let output = `// ${formatExportLabel(baseName)} Narrations
// ${'='.repeat(formatExportLabel(baseName).length + 12)}
// Auto-generated by Story Editor

import { NotificationType } from '../constants.js';
import { NotificationDurations } from '../constants.js';
import { TriggerType, ComparisonOperator } from '../types.js';

export const ${exportName} = [\n`;

        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            output += serializeEntry(entry);
            if (i < entries.length - 1) {
                output += ',';
            }
            output += '\n';
        }

        output += '];\n';
        return output;
    }

    /**
     * Format base name for comment header
     */
    function formatExportLabel(baseName) {
        // camelCase -> Title Case: mainStory -> Main Story
        return baseName
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }

    /**
     * Serialize a single entry to JS source
     */
    function serializeEntry(entry) {
        const lines = ['    {'];
        
        // id
        lines.push(`        id: '${escapeString(entry.id)}',`);
        
        // type -> NotificationType constant
        lines.push(`        type: ${mapToNotificationType(entry.type)},`);
        
        // trigger
        lines.push('        trigger: {');
        lines.push(`            type: ${mapToTriggerType(entry.trigger?.type || 'onNodeUnlocked')}`);
        
        // Additional trigger fields based on type
        const triggerFields = serializeTriggerFields(entry.trigger);
        if (triggerFields) {
            lines[lines.length - 1] += ','; // add comma to type line
            lines.push(triggerFields);
        }
        lines.push('        },');
        
        // message
        lines.push(`        message: '${escapeString(entry.message)}',`);
        
        // duration -> try to map to constant
        lines.push(`        duration: ${mapToDurationConstant(entry.duration)},`);
        
        // persistAcrossAscension
        lines.push(`        persistAcrossAscension: ${entry.persistAcrossAscension || false},`);
        
        // priority
        lines.push(`        priority: ${entry.priority || 5}`);
        
        // delay (optional)
        if (entry.delay && entry.delay > 0) {
            lines[lines.length - 1] += ',';
            lines.push(`        delay: ${formatNumber(entry.delay)}`);
        }
        
        lines.push('    }');
        return lines.join('\n');
    }

    /**
     * Escape string for JS single-quoted string
     */
    function escapeString(str) {
        if (!str) return '';
        return str
            .replace(/\\/g, '\\\\')
            .replace(/'/g, "\\'")
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t');
    }

    /**
     * Map type value to NotificationType constant
     */
    function mapToNotificationType(type) {
        const map = {
            'info': 'NotificationType.INFO',
            'error': 'NotificationType.ERROR',
            'success': 'NotificationType.SUCCESS',
            'narration': 'NotificationType.NARRATION',
            'node_unlock': 'NotificationType.NODE_UNLOCK',
            'hint': 'NotificationType.HINT',
            'achievement': 'NotificationType.ACHIEVEMENT',
            'terminal': 'NotificationType.TERMINAL'
        };
        return map[type] || 'NotificationType.NARRATION';
    }

    /**
     * Map trigger type value to TriggerType constant
     */
    function mapToTriggerType(type) {
        const map = {
            'onFirstLaunch': 'TriggerType.ON_FIRST_LAUNCH',
            'onNodeUnlocked': 'TriggerType.ON_NODE_UNLOCKED',
            'onNodeLevelReached': 'TriggerType.ON_NODE_LEVEL_REACHED',
            'onResourceAmountReached': 'TriggerType.ON_RESOURCE_AMOUNT_REACHED',
            'onBranchUnlocked': 'TriggerType.ON_BRANCH_UNLOCKED',
            'onFeatureUnlocked': 'TriggerType.ON_FEATURE_UNLOCKED',
            'onTierReached': 'TriggerType.ON_TIER_REACHED',
            'onAscension': 'TriggerType.ON_ASCENSION',
            'onOfflineReturn': 'TriggerType.ON_OFFLINE_RETURN',
            'onIdleTime': 'TriggerType.ON_IDLE_TIME'
        };
        return map[type] || 'TriggerType.ON_NODE_UNLOCKED';
    }

    /**
     * Serialize trigger-specific fields (nodeId, level, etc.)
     */
    function serializeTriggerFields(trigger) {
        if (!trigger) return null;
        const parts = [];
        
        if (trigger.nodeId) {
            parts.push(`            nodeId: '${escapeString(trigger.nodeId)}'`);
        }
        if (trigger.level !== undefined) {
            parts.push(`            level: ${trigger.level}`);
        }
        if (trigger.resource) {
            parts.push(`            resource: '${escapeString(trigger.resource)}'`);
        }
        if (trigger.threshold !== undefined) {
            parts.push(`            threshold: ${trigger.threshold}`);
        }
        if (trigger.comparison) {
            parts.push(`            comparison: ${mapToComparisonOperator(trigger.comparison)}`);
        }
        if (trigger.branch) {
            parts.push(`            branch: '${escapeString(trigger.branch)}'`);
        }
        if (trigger.feature) {
            parts.push(`            feature: '${escapeString(trigger.feature)}'`);
        }
        if (trigger.tier !== undefined) {
            parts.push(`            tier: ${trigger.tier}`);
        }
        if (trigger.count !== undefined) {
            parts.push(`            count: ${trigger.count}`);
        }
        if (trigger.offlineSeconds !== undefined) {
            parts.push(`            offlineSeconds: ${trigger.offlineSeconds}`);
        }
        if (trigger.idleSeconds !== undefined) {
            parts.push(`            idleSeconds: ${trigger.idleSeconds}`);
        }
        
        return parts.length > 0 ? parts.join(',\n') : null;
    }

    /**
     * Map comparison operator to constant
     */
    function mapToComparisonOperator(op) {
        const map = {
            '>=': 'ComparisonOperator.GREATER_EQUAL',
            '<=': 'ComparisonOperator.LESS_EQUAL',
            '==': 'ComparisonOperator.EQUAL',
            '>': 'ComparisonOperator.GREATER',
            '<': 'ComparisonOperator.LESS'
        };
        return map[op] || 'ComparisonOperator.GREATER_EQUAL';
    }

    /**
     * Map duration value to constant if possible
     */
    function mapToDurationConstant(duration) {
        const map = {
            6000: 'NotificationDurations.NARRATION_SHORT',
            10000: 'NotificationDurations.NARRATION_MEDIUM',
            15000: 'NotificationDurations.NARRATION_LONG',
            5000: 'NotificationDurations.HINT_SHORT',
            8000: 'NotificationDurations.HINT_MEDIUM'
        };
        return map[duration] || formatNumber(duration);
    }

    /**
     * Format number with underscore separators for readability
     */
    function formatNumber(num) {
        if (num >= 1000) {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '_');
        }
        return num.toString();
    }

    // Helper: set nested object value by path
    function setNestedValue(obj, path, value) {
        const keys = path.split('.');
        let current = obj;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!(keys[i] in current)) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
    }

    return {
        // State
        ...toRefs(readonly(state)),
        
        // Computed
        entries,
        selectedEntry,
        isCurrentFileDirty,
        dirtyFiles,
        hasDirtyFiles,
        totalChanges,
        
        // File operations
        loadFile,
        switchFile,
        
        // Selection
        selectEntry,
        
        // Entry CRUD
        modifyEntry,
        updateEntry,
        addEntry,
        deleteEntry,
        duplicateEntry,
        
        // Reorder
        moveUp,
        moveDown,
        reorderEntry,
        
        // Revert
        revertEntry,
        revertCurrentFile,
        revertAll,
        
        // Save helpers
        markFileSaved,
        getDirtyFilesForSave,
        getFileData,
        serializeEntriesToJS,
        
        // Mode
        setEditMode
    };
}

export { useEditor, DEFAULT_ENTRY };
