// Story Simulator App
// ====================
// Main Vue app for story simulator - preview narrations

import { useStoryPlayback, getFileList } from './useStoryPlayback.js';

const { createApp, ref, computed, onMounted } = Vue;

const app = createApp({
    setup() {
        const {
            state,
            currentEntry,
            totalEntries,
            hasNext,
            hasPrev,
            progress,
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

        // Load file list on mount
        onMounted(async () => {
            fileList.value = await getFileList();
            if (fileList.value.length > 0) {
                selectedFile.value = fileList.value[0].filename;
                await loadFile(selectedFile.value);
            }
        });

        // Handle file change
        async function onFileChange(event) {
            const filename = event.target.value;
            selectedFile.value = filename;
            await loadFile(filename);
        }

        // Toggle play/pause
        function togglePlay() {
            if (state.isPlaying) {
                pause();
            } else {
                play();
            }
        }

        // Type icon helper
        function getTypeIcon(type) {
            const icons = {
                narration: '📖',
                terminal: '💻',
                info: 'ℹ️',
                hint: '💡',
                achievement: '🏆'
            };
            return icons[type] || '📝';
        }

        // Format trigger for display
        function formatTrigger(trigger) {
            if (!trigger) return 'None';
            const parts = [`type: ${trigger.type}`];
            if (trigger.nodeId) parts.push(`nodeId: ${trigger.nodeId}`);
            if (trigger.resource) parts.push(`resource: ${trigger.resource}`);
            if (trigger.threshold) parts.push(`threshold: ${trigger.threshold}`);
            if (trigger.level) parts.push(`level: ${trigger.level}`);
            if (trigger.branch) parts.push(`branch: ${trigger.branch}`);
            return parts.join('\n  ');
        }

        return {
            state,
            currentEntry,
            totalEntries,
            progress,
            hasNext,
            hasPrev,
            fileList,
            selectedFile,
            onFileChange,
            togglePlay,
            play,
            pause,
            skip,
            reset,
            goTo,
            setSpeed,
            getTypeIcon,
            formatTrigger
        };
    },

    template: `
        <div class="story-simulator">
            <!-- Left Panel -->
            <div class="left-panel">
                <div class="left-panel-header">
                    <h1>📖 Story Simulator</h1>
                    
                    <!-- File Selector -->
                    <div class="file-selector">
                        <label>Select File:</label>
                        <select :value="selectedFile" @change="onFileChange">
                            <option v-for="file in fileList" :key="file.filename" :value="file.filename">
                                {{ file.label }} ({{ file.count }})
                            </option>
                        </select>
                    </div>

                    <!-- Playback Controls -->
                    <div class="playback-controls">
                        <div class="control-buttons">
                            <button @click="togglePlay" :title="state.isPlaying ? 'Pause' : 'Play'">
                                {{ state.isPlaying ? '⏸' : '▶' }}
                            </button>
                            <button @click="skip" :disabled="!hasNext" title="Skip">⏭</button>
                            <button @click="reset" title="Reset">↻</button>
                        </div>
                        
                        <div class="speed-selector">
                            Speed:
                            <button v-for="s in [1, 2, 4]" :key="s" 
                                    @click="setSpeed(s)"
                                    :class="{ active: state.speed === s }">
                                {{ s }}x
                            </button>
                        </div>
                    </div>

                    <!-- Progress -->
                    <div class="progress-section">
                        <div class="progress-bar">
                            <div class="progress-fill" :style="{ width: (progress * 100) + '%' }"></div>
                        </div>
                        <span class="progress-text">{{ state.currentIndex + 1 }} / {{ totalEntries }}</span>
                    </div>
                </div>

                <!-- Entry List -->
                <div class="entry-list-container">
                    <div class="entry-list">
                        <div v-for="(entry, i) in state.entries" :key="entry.id"
                             class="entry-item"
                             :class="{ current: i === state.currentIndex, played: i < state.currentIndex }"
                             @click="goTo(i)">
                            <span class="entry-index">{{ i + 1 }}.</span>
                            <span class="entry-id">{{ entry.id }}</span>
                            <span class="entry-status">
                                <span v-if="i < state.currentIndex">✓</span>
                                <span v-else-if="i === state.currentIndex">▶</span>
                            </span>
                            <span class="entry-type">{{ getTypeIcon(entry.type) }}</span>
                        </div>
                    </div>
                    
                    <div class="legend">
                        Legend: 📖=narration 💻=terminal ℹ️=info 💡=hint 🏆=achievement
                    </div>
                </div>
            </div>

            <!-- Right Panel -->
            <div class="right-panel">
                <!-- Preview -->
                <div class="preview-section">
                    <div v-if="currentEntry" class="notification" :class="currentEntry.type">
                        {{ currentEntry.message }}
                    </div>
                    <div v-else class="empty-state">
                        Select a narration file to preview
                    </div>
                </div>

                <!-- Metadata -->
                <div class="metadata-section" v-if="currentEntry">
                    <h3>METADATA</h3>
                    <pre class="metadata-content">id: {{ currentEntry.id }}
type: {{ currentEntry.type }}
duration: {{ currentEntry.duration }}ms
delay: {{ currentEntry.delay || 0 }}
priority: {{ currentEntry.priority || 'default' }}
persistAcrossAscension: {{ currentEntry.persistAcrossAscension || false }}
trigger:
  {{ formatTrigger(currentEntry.trigger) }}</pre>
                </div>
            </div>
        </div>
    `
});

app.mount('#app');
