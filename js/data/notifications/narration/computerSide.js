// Computer Branch Side Stories
// =============================
// Side narrations for computer branch

import { NotificationType } from '../constants.js';
import { NotificationDurations } from '../constants.js';
import { TriggerType } from '../types.js';

export const computerSideNarrations = [
    // usb_stick unlock
    {
        id: 'usb_stick_unlock',
        type: NotificationType.NARRATION,
        trigger: {
            type: TriggerType.ON_NODE_UNLOCKED,
            nodeId: 'usb_stick'
        },
        message: 'You plug in the USB stick. The computer recognizes it immediately, expanding its available storage. You can now store much more data than before!',
        duration: NotificationDurations.NARRATION_MEDIUM,
        persistAcrossAscension: false,
        priority: 5
    },
    // overclock level 2
    {
        id: 'overclock_level2',
        type: NotificationType.NARRATION,
        trigger: {
            type: TriggerType.ON_NODE_LEVEL_REACHED,
            nodeId: 'overclock',
            level: 2
        },
        message: 'You carefully adjust the system settings to overclock the CPU. The computer hums louder as it works harder, but data generation speeds up noticeably.',
        duration: NotificationDurations.NARRATION_MEDIUM,
        persistAcrossAscension: false,
        priority: 5
    },
    // overclock level 5
    {
        id: 'overclock_level5',
        type: NotificationType.NARRATION,
        trigger: {
            type: TriggerType.ON_NODE_LEVEL_REACHED,
            nodeId: 'overclock',
            level: 5
        },
        message: 'The overclocking is really paying off now! The computer is pushing its limits, and data is flowing in at an impressive rate.',
        duration: NotificationDurations.NARRATION_MEDIUM,
        persistAcrossAscension: false,
        priority: 5
    },
    // overclock level 10 (max)
    {
        id: 'overclock_level10',
        type: NotificationType.NARRATION,
        trigger: {
            type: TriggerType.ON_NODE_LEVEL_REACHED,
            nodeId: 'overclock',
            level: 10
        },
        message: 'As you see steam start to rise from the computer, you realize you might have pushed it a bit too far. I guess this is the most this old CPU can handle!',
        duration: NotificationDurations.NARRATION_MEDIUM,
        persistAcrossAscension: false,
        priority: 5
    }
];
