// Energy Branch Side Stories
// ===========================
// Side narrations for energy branch (catch_rat, crank_harder levelEffects, etc.)

import { NotificationType } from '../constants.js';
import { NotificationDurations } from '../constants.js';
import { TriggerType } from '../types.js';

export const energySideNarrations = [
    // hamster_wheel unlock
    {
        id: 'hamster_wheel_unlock',
        type: NotificationType.NARRATION,
        trigger: {
            type: TriggerType.ON_NODE_UNLOCKED,
            nodeId: 'hamster_wheel'
        },
        message: 'You set up the hamster wheel next to the crank. Lucy hops in and starts running. Look at her go!!! The humming sound indicates energy is being generated for you automatically.',
        duration: NotificationDurations.NARRATION_MEDIUM,
        persistAcrossAscension: false,
        priority: 10
    },
    // crank_harder base unlock
    {
        id: 'crank_harder_unlock',
        type: NotificationType.NARRATION,
        trigger: {
            type: TriggerType.ON_NODE_UNLOCKED,
            nodeId: 'crank_harder'
        },
        message: 'You put your back into it and crank even harder. You feel the burn in your arms, but the energy output increases noticeably.',
        duration: NotificationDurations.NARRATION_SHORT,
        persistAcrossAscension: false,
        priority: 5
    },
    // crank_harder level 5
    {
        id: 'crank_harder_level5',
        type: NotificationType.NARRATION,
        trigger: {
            type: TriggerType.ON_NODE_LEVEL_REACHED,
            nodeId: 'crank_harder',
            level: 5
        },
        message: 'Sweat drips down your forehead as you crank with all your might. The shed seems to vibrate slightly from the effort, and the energy generation is impressive now.',
        duration: NotificationDurations.NARRATION_SHORT,
        persistAcrossAscension: false,
        priority: 5
    },
    // crank_harder level 10 (max)
    {
        id: 'crank_harder_level10',
        type: NotificationType.NARRATION,
        trigger: {
            type: TriggerType.ON_NODE_LEVEL_REACHED,
            nodeId: 'crank_harder',
            level: 10
        },
        message: 'With a final, Herculean effort, you crank the handle as hard as you can. CRA-A-A-A-A-A-CK! With a loud snap, the crank handle breaks off in your hands. Well, at least you gave it your all!',
        duration: NotificationDurations.NARRATION_MEDIUM,
        persistAcrossAscension: false,
        priority: 5
    },
    // catch_rat unlock
    {
        id: 'catch_rat_unlock',
        type: NotificationType.NARRATION,
        trigger: {
            type: TriggerType.ON_NODE_UNLOCKED,
            nodeId: 'catch_rat'
        },
        message: 'You caught the rat! It seems eager to run in the wheel.',
        duration: NotificationDurations.NARRATION_SHORT,
        persistAcrossAscension: false,
        priority: 5
    }
];
