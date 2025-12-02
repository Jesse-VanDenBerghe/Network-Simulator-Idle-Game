// Notification Data Index
// =======================
// Re-exports all notification data and provides combined access

import { TriggerType, ComparisonOperator } from '../../types/notification';
import type { Notification } from '../../types/notification';

// Import narration files
import { mainStoryNarrations } from './narration/mainStory';
import { energySideNarrations } from './narration/energySide';
import { computerSideNarrations } from './narration/computerSide';

// Import hint files
import { gameplayHints } from './hints/gameplay';

/**
 * Get all notifications combined
 */
export function getAllNotifications(): Notification[] {
    return [
        ...mainStoryNarrations,
        ...energySideNarrations,
        ...computerSideNarrations,
        ...gameplayHints
    ];
}

// Re-export individual arrays for direct access
export { 
    mainStoryNarrations, 
    energySideNarrations, 
    computerSideNarrations, 
    gameplayHints 
};

// Re-export types for convenience
export { TriggerType, ComparisonOperator };
