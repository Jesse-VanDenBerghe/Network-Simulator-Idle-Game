// Story Playback Composable
// ==========================
// Manages playback state and controls for story simulator

const { reactive, computed, watch } = Vue;

// Registry of available narration files
const NARRATION_FILES = [
    { filename: 'mainStory.js', label: 'Main Story', exportName: 'mainStoryNarrations' },
    { filename: 'energySide.js', label: 'Energy Side', exportName: 'energySideNarrations' },
    { filename: 'computerSide.js', label: 'Computer Side', exportName: 'computerSideNarrations' }
];

/**
 * Load a narration file dynamically
 * @param {string} filename 
 * @returns {Promise<{filename, label, entries}>}
 */
async function loadNarrationFile(filename) {
    const file = NARRATION_FILES.find(f => f.filename === filename);
    if (!file) throw new Error(`Unknown narration file: ${filename}`);
    
    const module = await import(`../data/notifications/narration/${filename}`);
    return {
        filename,
        label: file.label,
        entries: module[file.exportName] || []
    };
}

/**
 * Get file list with counts
 * @returns {Promise<Array<{filename, label, count}>>}
 */
async function getFileList() {
    const results = [];
    for (const file of NARRATION_FILES) {
        try {
            const data = await loadNarrationFile(file.filename);
            results.push({
                filename: file.filename,
                label: file.label,
                count: data.entries.length
            });
        } catch (e) {
            console.warn(`Failed to load ${file.filename}:`, e);
            results.push({
                filename: file.filename,
                label: file.label,
                count: 0
            });
        }
    }
    return results;
}

/**
 * Story playback composable
 */
function useStoryPlayback() {
    const state = reactive({
        entries: [],
        currentIndex: 0,
        isPlaying: false,
        speed: 1,
        currentFile: null
    });

    let playbackTimer = null;

    // Computed
    const currentEntry = computed(() => state.entries[state.currentIndex] || null);
    const totalEntries = computed(() => state.entries.length);
    const hasNext = computed(() => state.currentIndex < state.entries.length - 1);
    const hasPrev = computed(() => state.currentIndex > 0);
    const progress = computed(() => totalEntries.value > 0 ? (state.currentIndex + 1) / totalEntries.value : 0);

    // Clear timer helper
    function clearTimer() {
        if (playbackTimer) {
            clearTimeout(playbackTimer);
            playbackTimer = null;
        }
    }

    // Schedule next entry in auto-play mode
    function scheduleNext() {
        clearTimer();
        if (!state.isPlaying || !hasNext.value) {
            state.isPlaying = false;
            return;
        }

        const entry = currentEntry.value;
        const duration = (entry?.duration || 5000) / state.speed;

        playbackTimer = setTimeout(() => {
            if (hasNext.value) {
                state.currentIndex++;
                scheduleNext();
            } else {
                state.isPlaying = false;
            }
        }, duration);
    }

    // Controls
    function play() {
        if (state.entries.length === 0) return;
        state.isPlaying = true;
        scheduleNext();
    }

    function pause() {
        state.isPlaying = false;
        clearTimer();
    }

    function skip() {
        if (hasNext.value) {
            state.currentIndex++;
            if (state.isPlaying) {
                scheduleNext();
            }
        }
    }

    function reset() {
        pause();
        state.currentIndex = 0;
    }

    function goTo(index) {
        if (index >= 0 && index < state.entries.length) {
            state.currentIndex = index;
            if (state.isPlaying) {
                scheduleNext();
            }
        }
    }

    function setSpeed(speed) {
        state.speed = speed;
        if (state.isPlaying) {
            scheduleNext(); // Restart timer with new speed
        }
    }

    async function loadFile(filename) {
        pause();
        const data = await loadNarrationFile(filename);
        state.entries = data.entries;
        state.currentFile = filename;
        state.currentIndex = 0;
    }

    return {
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
        loadFile,
        getFileList
    };
}

export { useStoryPlayback, getFileList, NARRATION_FILES };
