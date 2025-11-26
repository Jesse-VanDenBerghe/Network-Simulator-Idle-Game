// NotificationToast Component - Toast notifications
const NotificationToast = {
    name: 'NotificationToast',
    props: {
        notifications: { type: Array, required: true }
    },
    methods: {
        getStyle(notification) {
            const duration = notification.duration || 10000;
            const fadeStart = (duration - 300) / 1000;
            return {
                animationDuration: `0.3s, 0.3s`,
                animationDelay: `0s, ${fadeStart}s`
            };
        }
    },
    template: `
        <div id="notifications">
            <transition-group name="notification">
                <div 
                    v-for="notification in notifications"
                    :key="notification.id"
                    class="notification"
                    :class="notification.type"
                    :style="getStyle(notification)"
                >
                    {{ notification.message }}
                </div>
            </transition-group>
        </div>
    `
};
