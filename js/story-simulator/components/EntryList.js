// Entry List Component
// =====================
// Scrollable list of narration entries with click-to-select

const { watch, ref, nextTick } = Vue;

const EntryList = {
    name: 'EntryList',
    props: {
        entries: {
            type: Array,
            required: true
        },
        currentIndex: {
            type: Number,
            default: 0
        }
    },
    emits: ['select'],
    setup(props) {
        const listRef = ref(null);

        // Auto-scroll to current entry when index changes
        watch(() => props.currentIndex, async (newIndex) => {
            await nextTick();
            if (listRef.value) {
                const items = listRef.value.querySelectorAll('.entry-item');
                if (items[newIndex]) {
                    items[newIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }
        });

        return { listRef };
    },
    methods: {
        getTypeIcon(type) {
            const icons = {
                narration: '📖',
                terminal: '💻',
                info: 'ℹ️',
                hint: '💡',
                achievement: '🏆'
            };
            return icons[type] || '📝';
        }
    },
    template: `
        <div class="entry-list-container">
            <div class="entry-list" ref="listRef">
                <div v-for="(entry, i) in entries" :key="entry.id"
                     class="entry-item"
                     :class="{ current: i === currentIndex, played: i < currentIndex }"
                     @click="$emit('select', i)">
                    <span class="entry-index">{{ i + 1 }}.</span>
                    <span class="entry-id">{{ entry.id }}</span>
                    <span class="entry-status">
                        <span v-if="i < currentIndex">✓</span>
                        <span v-else-if="i === currentIndex">▶</span>
                    </span>
                    <span class="entry-type">{{ getTypeIcon(entry.type) }}</span>
                </div>
            </div>
            
            <div class="legend">
                Legend: 📖=narration 💻=terminal ℹ️=info 💡=hint 🏆=achievement
            </div>
        </div>
    `
};

export { EntryList };
