// Story Simulator App
// ====================
// Main Vue app for story simulator - preview narrations

import { useStoryPlayback, getFileList } from './useStoryPlayback.js';
import { useGitHub } from './useGitHub.js';
import { FileSelector } from './components/FileSelector.js';
import { EntryList } from './components/EntryList.js';
import { NotificationPreview } from './components/NotificationPreview.js';
import { MetadataPanel } from './components/MetadataPanel.js';
import { PlaybackControls } from './components/PlaybackControls.js';
import { GitHubSettings } from './components/GitHubSettings.js';

const { createApp, ref, onMounted, onUnmounted, watch } = Vue;

const app = createApp({
    components: {
        FileSelector,
        EntryList,
        NotificationPreview,
        MetadataPanel,
        PlaybackControls,
        GitHubSettings
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

        const fileList = ref([]);
        const selectedFile = ref(null);

        // Keyboard navigation
        function handleKeydown(e) {
            if (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') return;
            
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    if (hasNext.value) goTo(state.currentIndex + 1);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    if (hasPrev.value) goTo(state.currentIndex - 1);
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
                        results.push({
                            filename: file.name,
                            path: file.path,
                            sha: data.sha,
                            label: file.name.replace('.js', ''),
                            count: data.entries.length,
                            entries: data.entries
                        });
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
                    // Load entries directly from cached data
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
                await loadLocalFiles();
            }
        });

        // Load file list on mount
        onMounted(async () => {
            // If already connected (from localStorage), use GitHub
            if (github.isConnected.value) {
                useGitHubSource.value = true;
                await loadGitHubFiles();
            } else {
                await loadLocalFiles();
            }
            window.addEventListener('keydown', handleKeydown);
        });

        onUnmounted(() => {
            window.removeEventListener('keydown', handleKeydown);
        });

        // Handle file change
        async function onFileChange(filename) {
            selectedFile.value = filename;

            if (useGitHubSource.value) {
                // Find cached file data
                const fileData = fileList.value.find(f => f.filename === filename);
                if (fileData && fileData.entries) {
                    loadEntries(fileData.entries);
                }
            } else {
                await loadFile(filename);
            }
        }

        // GitHub actions
        async function handleConnect() {
            await github.connect();
        }

        function handleDisconnect() {
            github.disconnect();
        }

        return {
            state,
            currentEntry,
            totalEntries,
            hasNext,
            fileList,
            selectedFile,
            onFileChange,
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
            handleDisconnect
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

                    <!-- Playback Controls -->
                    <PlaybackControls
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
                    :entries="state.entries" 
                    :current-index="state.currentIndex"
                    @select="goTo"
                />
            </div>

            <!-- Right Panel -->
            <div class="right-panel">
                <!-- Preview -->
                <NotificationPreview :entry="currentEntry" :direction="state.direction" />

                <!-- Metadata -->
                <MetadataPanel :entry="currentEntry" />
            </div>
        </div>
    `
});

app.mount('#app');
