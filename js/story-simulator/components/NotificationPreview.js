// Notification Preview Component
// ================================
// Renders notification using game's .notification CSS classes

const NotificationPreview = {
    name: 'NotificationPreview',
    props: {
        entry: {
            type: Object,
            default: null
        }
    },
    template: `
        <div class="preview-section">
            <div v-if="entry" class="notification" :class="entry.type">
                {{ entry.message }}
            </div>
            <div v-else class="empty-state">
                Select a narration file to preview
            </div>
        </div>
    `
};

export { NotificationPreview };
