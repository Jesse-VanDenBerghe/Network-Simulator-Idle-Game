// NotificationToast Component - Toast notifications
const NotificationToast = {
    name: 'NotificationToast',
    props: {
        notifications: { type: Array, required: true }
    },
    template: `
        <div id="notifications">
            <transition-group name="notification">
                <div 
                    v-for="notification in notifications"
                    :key="notification.id"
                    class="notification"
                    :class="notification.type"
                >
                    {{ notification.message }}
                </div>
            </transition-group>
        </div>
    `
};
