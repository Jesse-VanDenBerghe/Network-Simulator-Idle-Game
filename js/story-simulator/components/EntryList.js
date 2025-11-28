// Entry List Component
// =====================
// Scrollable list of narration entries with edit actions and drag-reorder

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
        },
        editMode: {
            type: Boolean,
            default: false
        },
        modifiedIds: {
            type: Set,
            default: () => new Set()
        }
    },
    emits: ['select', 'add', 'moveUp', 'moveDown', 'delete', 'reorder'],
    setup(props, { emit }) {
        const listRef = ref(null);
        const draggedIndex = ref(null);
        const dragOverIndex = ref(null);

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

        // Drag handlers
        function onDragStart(e, index) {
            if (!props.editMode) return;
            draggedIndex.value = index;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', index);
            // Add dragging class after a tick for visual feedback
            requestAnimationFrame(() => {
                e.target.classList.add('dragging');
            });
        }

        function onDragEnd(e) {
            e.target.classList.remove('dragging');
            draggedIndex.value = null;
            dragOverIndex.value = null;
        }

        function onDragOver(e, index) {
            if (!props.editMode || draggedIndex.value === null) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            dragOverIndex.value = index;
        }

        function onDragLeave(e) {
            // Only clear if leaving the item entirely
            if (!e.currentTarget.contains(e.relatedTarget)) {
                dragOverIndex.value = null;
            }
        }

        function onDrop(e, targetIndex) {
            e.preventDefault();
            const fromIndex = draggedIndex.value;
            
            if (fromIndex !== null && fromIndex !== targetIndex) {
                emit('reorder', fromIndex, targetIndex);
            }
            
            draggedIndex.value = null;
            dragOverIndex.value = null;
        }

        return { 
            listRef, 
            draggedIndex, 
            dragOverIndex,
            onDragStart,
            onDragEnd,
            onDragOver,
            onDragLeave,
            onDrop
        };
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
        },
        isModified(entry) {
            return this.modifiedIds.has(entry.id);
        },
        getDragClass(index) {
            if (!this.editMode) return '';
            if (this.draggedIndex === index) return 'drag-source';
            if (this.dragOverIndex === index) return 'drag-over';
            return '';
        }
    },
    template: `
        <div class="entry-list-container">
            <!-- Add Entry button (edit mode) -->
            <div v-if="editMode" class="entry-list-header">
                <button class="btn-add-entry" @click="$emit('add', -1)">
                    + New Entry
                </button>
            </div>
            
            <div class="entry-list" ref="listRef">
                <div v-for="(entry, i) in entries" :key="entry.id"
                     class="entry-item"
                     :class="[{ 
                         current: i === currentIndex, 
                         played: !editMode && i < currentIndex,
                         modified: isModified(entry)
                     }, getDragClass(i)]"
                     :draggable="editMode"
                     @click="$emit('select', i)"
                     @dragstart="onDragStart($event, i)"
                     @dragend="onDragEnd"
                     @dragover="onDragOver($event, i)"
                     @dragleave="onDragLeave"
                     @drop="onDrop($event, i)">
                    
                    <!-- Drag handle (edit mode) -->
                    <span v-if="editMode" class="drag-handle" title="Drag to reorder">⋮⋮</span>
                    
                    <!-- Edit mode: action buttons -->
                    <div v-if="editMode" class="entry-actions">
                        <button 
                            class="btn-mini" 
                            @click.stop="$emit('moveUp', i)"
                            :disabled="i === 0"
                            title="Move up"
                        >↑</button>
                        <button 
                            class="btn-mini" 
                            @click.stop="$emit('moveDown', i)"
                            :disabled="i === entries.length - 1"
                            title="Move down"
                        >↓</button>
                        <button 
                            class="btn-mini btn-insert" 
                            @click.stop="$emit('add', i)"
                            title="Insert after"
                        >+</button>
                    </div>
                    
                    <span class="entry-index">{{ i + 1 }}.</span>
                    <span class="entry-id">{{ entry.id }}</span>
                    
                    <!-- Modified indicator -->
                    <span v-if="isModified(entry)" class="entry-modified" title="Modified">●</span>
                    
                    <!-- Playback status (non-edit mode) -->
                    <span v-if="!editMode" class="entry-status">
                        <span v-if="i < currentIndex">✓</span>
                        <span v-else-if="i === currentIndex">▶</span>
                    </span>
                    
                    <span class="entry-type">{{ getTypeIcon(entry.type) }}</span>
                    
                    <!-- Delete button (edit mode) -->
                    <button 
                        v-if="editMode"
                        class="btn-mini btn-delete" 
                        @click.stop="$emit('delete', i)"
                        title="Delete"
                    >×</button>
                </div>
            </div>
            
            <div class="legend">
                Legend: 📖=narration 💻=terminal ℹ️=info 💡=hint 🏆=achievement
                <span v-if="editMode"> | ●=modified | ⋮⋮=drag</span>
            </div>
        </div>
    `
};

export { EntryList };
