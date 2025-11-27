// Notification Data Index
// =======================
// Re-exports all notification data and provides combined access

import { TriggerType, ComparisonOperator, NotificationDefaults } from './types.js';

// Import narration files
import { mainStoryNarrations } from './narration/mainStory.js';
import { energySideNarrations } from './narration/energySide.js';
import { computerSideNarrations } from './narration/computerSide.js';

// Import hint files
import { gameplayHints } from './hints/gameplay.js';

/**
 * Get all notifications combined
 * @returns {Array} All notification definitions
 */
export function getAllNotifications() {
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
export { TriggerType, ComparisonOperator, NotificationDefaults };
