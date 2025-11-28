// Story Simulator App
// ====================
// Main Vue app for story simulator - preview narrations

import { useStoryPlayback, getFileList } from './useStoryPlayback.js';
import { FileSelector } from './components/FileSelector.js';
import { EntryList } from './components/EntryList.js';
import { NotificationPreview } from './components/NotificationPreview.js';
import { MetadataPanel } from './components/MetadataPanel.js';
import { PlaybackControls } from './components/PlaybackControls.js';

const { createApp, ref, onMounted, onUnmounted } = Vue;

const app = createApp({
    components: {
        FileSelector,
        EntryList,
        NotificationPreview,
        MetadataPanel,
        PlaybackControls
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
            loadFile
        } = useStoryPlayback();

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

        // Load file list on mount
        onMounted(async () => {
            fileList.value = await getFileList();
            if (fileList.value.length > 0) {
                selectedFile.value = fileList.value[0].filename;
                await loadFile(selectedFile.value);
            }
            window.addEventListener('keydown', handleKeydown);
        });

        onUnmounted(() => {
            window.removeEventListener('keydown', handleKeydown);
        });

        // Handle file change
        async function onFileChange(filename) {
            selectedFile.value = filename;
            await loadFile(filename);
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
            setSpeed
        };
    },

    template: `
        <div class="story-simulator">
            <!-- Left Panel -->
            <div class="left-panel">
                <div class="left-panel-header">
                    <h1>📖 Story Simulator</h1>
                    
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
