// Playback Controls Component
// ============================
// Play/Pause/Skip/Reset buttons + speed selector (1x/2x/4x)

const PlaybackControls = {
    name: 'PlaybackControls',
    props: {
        isPlaying: {
            type: Boolean,
            default: false
        },
        hasNext: {
            type: Boolean,
            default: false
        },
        speed: {
            type: Number,
            default: 1
        },
        currentIndex: {
            type: Number,
            default: 0
        },
        totalEntries: {
            type: Number,
            default: 0
        }
    },
    emits: ['play', 'pause', 'skip', 'reset', 'set-speed'],
    computed: {
        progress() {
            return this.totalEntries > 0 ? (this.currentIndex + 1) / this.totalEntries : 0;
        }
    },
    methods: {
        togglePlay() {
            this.$emit(this.isPlaying ? 'pause' : 'play');
        }
    },
    template: `
        <div class="playback-section">
            <!-- Controls -->
            <div class="playback-controls">
                <div class="control-buttons">
                    <button @click="togglePlay" :title="isPlaying ? 'Pause' : 'Play'">
                        {{ isPlaying ? '⏸' : '▶' }}
                    </button>
                    <button @click="$emit('skip')" :disabled="!hasNext" title="Skip">⏭</button>
                    <button @click="$emit('reset')" title="Reset">↻</button>
                </div>
                
                <div class="speed-selector">
                    Speed:
                    <button v-for="s in [1, 2, 4]" :key="s" 
                            @click="$emit('set-speed', s)"
                            :class="{ active: speed === s }">
                        {{ s }}x
                    </button>
                </div>
            </div>

            <!-- Progress -->
            <div class="progress-section">
                <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: (progress * 100) + '%' }"></div>
                </div>
                <span class="progress-text">{{ currentIndex + 1 }} / {{ totalEntries }}</span>
            </div>
        </div>
    `
};

export { PlaybackControls };
