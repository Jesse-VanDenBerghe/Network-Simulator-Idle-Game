// Notification Preview Component
// ================================
// Renders notification using game's .notification CSS classes

const { ref, watch, computed } = Vue;

const NotificationPreview = {
    name: 'NotificationPreview',
    props: {
        entry: {
            type: Object,
            default: null
        },
        direction: {
            type: String,
            default: 'forward' // 'forward' or 'backward'
        }
    },
    setup(props) {
        const transitionName = ref('slide-up');

        watch(() => props.direction, (dir) => {
            transitionName.value = dir === 'backward' ? 'slide-down' : 'slide-up';
        });

        // Use entry.id as key to trigger transition on change
        const entryKey = computed(() => props.entry?.id || 'empty');

        return { transitionName, entryKey };
    },
    template: `
        <div class="preview-section">
            <transition :name="transitionName" mode="out-in">
                <div v-if="entry" :key="entryKey" class="notification" :class="entry.type">
                    {{ entry.message }}
                </div>
                <div v-else key="empty" class="empty-state">
                    Select a narration file to preview
                </div>
            </transition>
        </div>
    `
};

export { NotificationPreview };
