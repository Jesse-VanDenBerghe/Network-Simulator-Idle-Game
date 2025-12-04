// Gameplay Hints
// ===============
// Helpful hints triggered by idle time, resource thresholds, etc.

import { NotificationType } from '../constants';
import { TriggerType } from '../../../types/notification';
import type { Notification } from '../../../types/notification';

export const gameplayHints: Notification[] = [
    // =====================
    // PROGRESSION HINTS
    // =====================
    {
        id: 'hint_tier_2_available',
        type: NotificationType.HINT,
        trigger: {
            type: TriggerType.ON_TIER_REACHED,
            tier: 2
        },
        message: 'Tier 2 nodes unlocked. Costs scale up, but rewards do too.',
        duration: 6000,
        persistAcrossAscension: false,
        priority: 4
    },
    {
        id: 'hint_computer_branch',
        type: NotificationType.HINT,
        trigger: {
            type: TriggerType.ON_BRANCH_UNLOCKED,
            branch: 'computer'
        },
        message: 'The computer branch is now available! Explore grandpa\'s digital legacy.',
        duration: 7000,
        persistAcrossAscension: false,
        priority: 5
    },
    
    // =====================
    // OFFLINE RETURN HINTS
    // =====================
    {
        id: 'hint_offline_short',
        type: NotificationType.HINT,
        trigger: {
            type: TriggerType.ON_OFFLINE_RETURN,
            offlineSeconds: 3600  // 1 hour
        },
        message: 'Welcome back! Your automations kept working while you were away.',
        duration: 5000,
        persistAcrossAscension: false,
        priority: 3
    },
    {
        id: 'hint_offline_long',
        type: NotificationType.HINT,
        trigger: {
            type: TriggerType.ON_OFFLINE_RETURN,
            offlineSeconds: 28800  // 8 hours
        },
        message: 'You\'ve been gone a while! Check your progress—resources have accumulated.',
        duration: 6000,
        persistAcrossAscension: false,
        priority: 4
    }
];
