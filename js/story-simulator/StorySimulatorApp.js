// Story Simulator App
// ====================
// Main Vue app for story simulator - preview and edit narrations

import { useStoryPlayback, getFileList } from './useStoryPlayback.js';
import { useGitHub } from './useGitHub.js';
import { useEditor } from './useEditor.js';
import { FileSelector } from './components/FileSelector.js';
import { EntryList } from './components/EntryList.js';
import { NotificationPreview } from './components/NotificationPreview.js';
import { MetadataPanel } from './components/MetadataPanel.js';
import { PlaybackControls } from './components/PlaybackControls.js';
import { GitHubSettings } from './components/GitHubSettings.js';
import { EntryEditor } from './components/EntryEditor.js';
import { PRModal } from './components/PRModal.js';

const { createApp, ref, computed, onMounted, onUnmounted, watch } = Vue;

const app = createApp({
    components: {
        FileSelector,
        EntryList,
        NotificationPreview,
        MetadataPanel,
        PlaybackControls,
        GitHubSettings,
        EntryEditor,
        PRModal
    },
    setup() {
        const {
            state,
            currentEntry,
            totalEntries,
            hasNext,
            hasPrev,
            play,
            pause,
            skip,
            reset,
            goTo,
            setSpeed,
            loadFile,
            loadEntries
        } = useStoryPlayback();

        // GitHub integration
        const github = useGitHub();
        const useGitHubSource = ref(false);

        // Editor integration
        const editor = useEditor();

        const fileList = ref([]);
        const selectedFile = ref(null);

        // PR Modal state
        const showPRModal = ref(false);
        const prLoading = ref(false);
        const prError = ref(null);
        const prConflicts = ref([]);
        const createdPR = ref(null);

        // Computed: entries to display (editor entries in edit mode, playback otherwise)
        const displayEntries = computed(() => {
            if (editor.editMode.value && useGitHubSource.value) {
                return editor.entries.value;
            }
            return state.entries;
        });

        // Computed: current index (editor selected in edit mode)
        const displayIndex = computed(() => {
            if (editor.editMode.value && useGitHubSource.value) {
                return editor.selectedIndex.value;
            }
            return state.currentIndex;
        });

        // Computed: current entry for preview
        const displayEntry = computed(() => {
            if (editor.editMode.value && useGitHubSource.value) {
                return editor.selectedEntry.value;
            }
            return currentEntry.value;
        });

        // Computed: set of modified entry IDs for current file
        const modifiedEntryIds = computed(() => {
            // Depend on entries to trigger reactivity on changes
            const currentEntries = editor.entries.value;
            
            if (!editor.editMode.value || !editor.currentFile.value) {
                return new Set();
            }
            const filename = editor.currentFile.value.filename;
            const fileData = editor.getFileData(filename);
            if (!fileData) return new Set();
            
            const origMap = new Map(fileData.originalEntries.map(e => [e.id, JSON.stringify(e)]));
            const modified = new Set();
            
            for (const entry of currentEntries) {
                const origStr = origMap.get(entry.id);
                if (!origStr || origStr !== JSON.stringify(entry)) {
                    modified.add(entry.id);
                }
            }
            return modified;
        });

        // Keyboard navigation
        function handleKeydown(e) {
            if (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    if (editor.editMode.value) {
                        if (editor.selectedIndex.value < editor.entries.value.length - 1) {
                            editor.selectEntry(editor.selectedIndex.value + 1);
                        }
                    } else if (hasNext.value) {
                        goTo(state.currentIndex + 1);
                    }
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    if (editor.editMode.value) {
                        if (editor.selectedIndex.value > 0) {
                            editor.selectEntry(editor.selectedIndex.value - 1);
                        }
                    } else if (hasPrev.value) {
                        goTo(state.currentIndex - 1);
                    }
                    break;
            }
        }

        // Load files from local (static imports)
        async function loadLocalFiles() {
            fileList.value = await getFileList();
            if (fileList.value.length > 0) {
                selectedFile.value = fileList.value[0].filename;
                await loadFile(selectedFile.value);
            }
        }

        // Load files from GitHub
        async function loadGitHubFiles() {
            try {
                const files = await github.listFiles('js/data/notifications/narration');
                const results = [];

                for (const file of files) {
                    try {
                        const data = await github.readFile(file.path);
                        const fileData = {
                            filename: file.name,
                            path: file.path,
                            sha: data.sha,
                            label: file.name.replace('.js', ''),
                            count: data.entries.length,
                            entries: data.entries
                        };
                        results.push(fileData);
                        
                        // Load into editor
                        editor.loadFile(fileData);
                    } catch (e) {
                        console.warn(`Failed to load ${file.name}:`, e);
                        results.push({
                            filename: file.name,
                            path: file.path,
                            label: file.name.replace('.js', ''),
                            count: 0,
                            entries: []
                        });
                    }
                }

                fileList.value = results;

                if (results.length > 0) {
                    selectedFile.value = results[0].filename;
                    loadEntries(results[0].entries);
                }
            } catch (e) {
                console.error('Failed to load GitHub files:', e);
            }
        }

        // Watch for GitHub connection changes
        watch(() => github.isConnected.value, async (connected) => {
            if (connected) {
                useGitHubSource.value = true;
                await loadGitHubFiles();
            } else {
                useGitHubSource.value = false;
                editor.setEditMode(false);
                await loadLocalFiles();
            }
        });

        // Unsaved changes warning
        function handleBeforeUnload(e) {
            if (editor.hasDirtyFiles.value) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return e.returnValue;
            }
        }

        // Load file list on mount
        onMounted(async () => {
            if (github.isConnected.value) {
                useGitHubSource.value = true;
                await loadGitHubFiles();
            } else {
                await loadLocalFiles();
            }
            window.addEventListener('keydown', handleKeydown);
            window.addEventListener('beforeunload', handleBeforeUnload);
        });

        onUnmounted(() => {
            window.removeEventListener('keydown', handleKeydown);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        });

        // Handle file change
        async function onFileChange(filename) {
            selectedFile.value = filename;

            if (useGitHubSource.value) {
                const fileData = fileList.value.find(f => f.filename === filename);
                if (fileData && fileData.entries) {
                    loadEntries(fileData.entries);
                    editor.switchFile(filename);
                }
            } else {
                await loadFile(filename);
            }
        }

        // Handle entry selection
        function onSelectEntry(index) {
            if (editor.editMode.value) {
                editor.selectEntry(index);
            } else {
                goTo(index);
            }
        }

        // Editor actions
        function handleUpdateEntry(index, path, value) {
            editor.modifyEntry(index, path, value);
        }

        function handleAddEntry(afterIndex) {
            editor.addEntry(afterIndex);
        }

        function handleDeleteEntry(index) {
            if (confirm('Delete this entry?')) {
                editor.deleteEntry(index);
            }
        }

        function handleDuplicateEntry(index) {
            editor.duplicateEntry(index);
        }

        function handleRevertEntry(index) {
            if (confirm('Revert this entry to original?')) {
                editor.revertEntry(index);
            }
        }

        function handleMoveUp(index) {
            editor.moveUp(index);
        }

        function handleMoveDown(index) {
            editor.moveDown(index);
        }

        function handleReorder(fromIndex, toIndex) {
            editor.reorderEntry(fromIndex, toIndex);
        }

        function handleRevertAll() {
            if (confirm('Revert all changes?')) {
                editor.revertAll();
            }
        }

        // Toggle edit mode
        function toggleEditMode() {
            editor.setEditMode(!editor.editMode.value);
        }

        // GitHub actions
        async function handleConnect() {
            await github.connect();
        }

        function handleDisconnect() {
            github.disconnect();
        }

        // PR Modal actions
        function openPRModal() {
            prError.value = null;
            prConflicts.value = [];
            createdPR.value = null;
            showPRModal.value = true;
        }

        function closePRModal() {
            showPRModal.value = false;
            prError.value = null;
            prConflicts.value = [];
            // If PR was created, reload files to update SHAs
            if (createdPR.value) {
                createdPR.value = null;
                loadGitHubFiles();
            }
        }

        async function checkConflicts() {
            prConflicts.value = [];
            const dirty = editor.dirtyFiles.value;
            
            for (const file of dirty) {
                try {
                    const hasConflict = await github.hasFileChanged(file.path, file.sha);
                    prConflicts.value.push({ filename: file.filename, hasConflict });
                } catch (e) {
                    console.warn(`Failed to check ${file.filename}:`, e);
                    prConflicts.value.push({ filename: file.filename, hasConflict: false });
                }
            }
        }

        async function handleCreatePR({ branchName, title, description }) {
            prLoading.value = true;
            prError.value = null;

            try {
                // 1. Create branch
                await github.createBranch(branchName);

                // 2. Commit each dirty file
                const dirty = editor.dirtyFiles.value;
                for (const file of dirty) {
                    const content = editor.serializeEntriesToJS(file.filename, file.entries);
                    const message = `Update ${file.filename}`;
                    const result = await github.updateFile(
                        file.path,
                        content,
                        message,
                        branchName,
                        file.sha
                    );
                    // Update SHA in editor
                    editor.markFileSaved(file.filename, result.sha);
                }

                // 3. Create PR
                const pr = await github.createPullRequest({
                    title,
                    body: description,
                    head: branchName,
                    base: github.baseBranch.value
                });

                createdPR.value = pr;
            } catch (e) {
                console.error('Failed to create PR:', e);
                prError.value = e.message || 'Failed to create pull request';
            } finally {
                prLoading.value = false;
            }
        }

        return {
            state,
            currentEntry,
            totalEntries,
            hasNext,
            fileList,
            selectedFile,
            onFileChange,
            onSelectEntry,
            play,
            pause,
            skip,
            reset,
            goTo,
            setSpeed,
            // GitHub
            github,
            useGitHubSource,
            handleConnect,
            handleDisconnect,
            // Editor
            editor,
            displayEntries,
            displayIndex,
            displayEntry,
            modifiedEntryIds,
            toggleEditMode,
            handleUpdateEntry,
            handleAddEntry,
            handleDeleteEntry,
            handleDuplicateEntry,
            handleRevertEntry,
            handleMoveUp,
            handleMoveDown,
            handleReorder,
            handleRevertAll,
            // PR Modal
            showPRModal,
            prLoading,
            prError,
            prConflicts,
            createdPR,
            openPRModal,
            closePRModal,
            checkConflicts,
            handleCreatePR
        };
    },

    template: `
        <div class="story-simulator">
            <!-- Left Panel -->
            <div class="left-panel">
                <div class="left-panel-header">
                    <h1>📖 Story Simulator</h1>
                    
                    <!-- GitHub Settings -->
                    <GitHubSettings
                        :token="github.token.value"
                        :owner="github.owner.value"
                        :repo="github.repo.value"
                        :base-branch="github.baseBranch.value"
                        :branches="github.branches.value"
                        :is-connected="github.isConnected.value"
                        :is-loading="github.isLoading.value"
                        :error="github.error.value"
                        @update:token="github.setToken"
                        @update:owner="github.setOwner"
                        @update:repo="github.setRepo"
                        @update:base-branch="github.setBaseBranch"
                        @connect="handleConnect"
                        @disconnect="handleDisconnect"
                    />
                    
                    <!-- File Selector -->
                    <FileSelector 
                        :files="fileList" 
                        :model-value="selectedFile"
                        @update:model-value="onFileChange"
                    />

                    <!-- Mode Toggle & Toolbar -->
                    <div class="mode-toolbar">
                        <button 
                            v-if="useGitHubSource"
                            class="mode-toggle-btn"
                            :class="{ active: editor.editMode.value }"
                            @click="toggleEditMode"
                        >
                            {{ editor.editMode.value ? '📝 Editing' : '▶️ Playback' }}
                        </button>
                        
                        <template v-if="editor.editMode.value && editor.hasDirtyFiles.value">
                            <span class="dirty-indicator">
                                {{ editor.dirtyFiles.value.length }} file(s) modified
                            </span>
                            <button class="revert-btn" @click="handleRevertAll">
                                ↩ Revert
                            </button>
                            <button class="create-pr-btn" @click="openPRModal">
                                📤 Create PR
                            </button>
                        </template>
                    </div>

                    <!-- Playback Controls (non-edit mode) -->
                    <PlaybackControls
                        v-if="!editor.editMode.value"
                        :is-playing="state.isPlaying"
                        :has-next="hasNext"
                        :speed="state.speed"
                        :current-index="state.currentIndex"
                        :total-entries="totalEntries"
                        @play="play"
                        @pause="pause"
                        @skip="skip"
                        @reset="reset"
                        @set-speed="setSpeed"
                    />
                </div>

                <!-- Entry List -->
                <EntryList 
                    :entries="displayEntries" 
                    :current-index="displayIndex"
                    :edit-mode="editor.editMode.value"
                    :modified-ids="modifiedEntryIds"
                    @select="onSelectEntry"
                    @add="handleAddEntry"
                    @move-up="handleMoveUp"
                    @move-down="handleMoveDown"
                    @reorder="handleReorder"
                    @delete="handleDeleteEntry"
                />
            </div>

            <!-- Right Panel -->
            <div class="right-panel">
                <!-- Preview -->
                <NotificationPreview :entry="displayEntry" :direction="state.direction" />

                <!-- Entry Editor (edit mode) or Metadata (playback mode) -->
                <EntryEditor
                    v-if="editor.editMode.value"
                    :entry="editor.selectedEntry.value"
                    :index="editor.selectedIndex.value"
                    :is-modified="modifiedEntryIds.has(editor.selectedEntry.value?.id)"
                    :all-entry-ids="displayEntries.map(e => e.id)"
                    @update="handleUpdateEntry"
                    @delete="handleDeleteEntry"
                    @duplicate="handleDuplicateEntry"
                    @revert="handleRevertEntry"
                />
                <MetadataPanel v-else :entry="displayEntry" />
            </div>

            <!-- PR Modal -->
            <PRModal
                :show="showPRModal"
                :dirty-files="editor.dirtyFiles.value"
                :is-loading="prLoading"
                :error="prError"
                :conflicts="prConflicts"
                :created-p-r="createdPR"
                @close="closePRModal"
                @submit="handleCreatePR"
                @check-conflicts="checkConflicts"
            />
        </div>
    `
});

app.mount('#app');
