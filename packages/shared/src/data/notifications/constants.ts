// Notification constants
// ==========================

export enum NotificationType {
    INFO = 'info',
    ERROR = 'error',
    SUCCESS = 'success',
    NARRATION = 'narration',
    NODE_UNLOCK = 'node_unlock',
    HINT = 'hint',
    ACHIEVEMENT = 'achievement',
    TERMINAL = 'terminal'
}

export const DisabledNotificationTypes = new Set<NotificationType>([
    NotificationType.NODE_UNLOCK
]);

export const NotificationDurations = {
    NARRATION_SHORT: 6_000,
    NARRATION_MEDIUM: 10_000,
    NARRATION_LONG: 15_000,
    HINT_SHORT: 5_000,
    HINT_MEDIUM: 8_000
} as const;
