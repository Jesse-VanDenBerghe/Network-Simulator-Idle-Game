// NotificationHistoryPanel Component - Shows past notifications
const NotificationHistoryPanel = {
    name: 'NotificationHistoryPanel',
    props: {
        show: { type: Boolean, required: true },
        history: { type: Array, required: true },
        narrateOnlyFilter: { type: Boolean, required: true }
    },
    emits: ['close', 'update:narrateOnlyFilter'],
    computed: {
        filteredHistory() {
            const filtered = !this.narrateOnlyFilter ? this.history : this.history.filter(n => n.type === 'narration');
            return [...filtered].reverse();
        }
    },
    watch: {
        show(newVal) {
            if (newVal) {
                this.$nextTick(() => {
                    const panelBody = document.querySelector('#notification-history-panel .panel-body');
                    if (panelBody) {
                        panelBody.scrollTop = panelBody.scrollHeight;
                    }
                });
            }
        }
    },
    methods: {
        formatTime(timestamp) {
            const date = new Date(timestamp);
            return date.toLocaleString();
        },
        getTypeIcon(type) {
            switch (type) {
                case 'narration': return '📖';
                case 'success': return '✓';
                case 'error': return '✗';
                case 'prestige': return '🌌';
                default: return 'ℹ';
            }
        }
    },
    template: `
        <div v-if="show" id="notification-history-panel">
            <div class="panel-content">
                <div class="panel-header">
                    <h2>📜 Notification History</h2>
                    <button class="close-button" @click="$emit('close')">×</button>
                </div>
                <div class="panel-controls">
                    <label class="filter-toggle">
                        <input 
                            type="checkbox" 
                            :checked="narrateOnlyFilter" 
                            @change="$emit('update:narrateOnlyFilter', $event.target.checked)"
                        >
                        <span>Narration only</span>
                    </label>
                </div>
                <div class="panel-body">
                    <div v-if="filteredHistory.length === 0" class="empty-state">
                        No notifications yet
                    </div>
                    <div 
                        v-for="notification in filteredHistory" 
                        :key="notification.id"
                        class="history-item"
                        :class="notification.type"
                    >
                        <span class="history-icon">{{ getTypeIcon(notification.type) }}</span>
                        <div class="history-content">
                            <span class="history-message" style="white-space: pre-line">{{ notification.message }}</span>
                            <span class="history-time">{{ formatTime(notification.timestamp) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
};
