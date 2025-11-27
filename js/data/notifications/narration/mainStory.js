// Main Story Narrations
// ======================
// Core storyline narrations (hand_crank, lightbulb, attic, etc.)
// These drive the main plot forward

import { NotificationType } from '../constants.js';
import { NotificationDurations } from '../constants.js';
import { TriggerType } from '../types.js';

export const mainStoryNarrations = [
    // First launch - old_shed intro
    {
        id: 'old_shed_intro',
        type: NotificationType.NARRATION,
        trigger: {
            type: TriggerType.ON_FIRST_LAUNCH
        },
        message: 'You step into the old shed. Dust particles dance in the sunlight filtering through the cracks. It smells of aged wood and memories. The shed is dark... but you can make out a few objects: a hand crank mounted on the wall covered in cobwebs. It looks like it hasn\'t been used in years.',
        duration: NotificationDurations.NARRATION_LONG,
        persistAcrossAscension: true,
        priority: 10
    },
    // hand_crank unlock
    {
        id: 'hand_crank_unlock',
        type: NotificationType.NARRATION,
        trigger: {
            type: TriggerType.ON_NODE_UNLOCKED,
            nodeId: 'hand_crank'
        },
        message: 'When you turn the crank, you hear a faint humming sound...',
        duration: NotificationDurations.NARRATION_MEDIUM,
        persistAcrossAscension: false,
        priority: 10
    },
    // lightbulb unlock
    {
        id: 'lightbulb_unlock',
        type: NotificationType.NARRATION,
        trigger: {
            type: TriggerType.ON_NODE_UNLOCKED,
            nodeId: 'lightbulb'
        },
        message: 'When you turn on the light, the room is illuminated. The shed is empty, but there\'s an attic hatch above you that wasn\'t visible before.',
        duration: NotificationDurations.NARRATION_LONG,
        persistAcrossAscension: false,
        priority: 10
    },
    // attic unlock
    {
        id: 'attic_unlock',
        type: NotificationType.NARRATION,
        trigger: {
            type: TriggerType.ON_NODE_UNLOCKED,
            nodeId: 'attic'
        },
        message: 'You found an old computer up in the attic! Lets see if it still works...',
        duration: NotificationDurations.NARRATION_LONG,
        persistAcrossAscension: false,
        priority: 10
    },
    // gpa_old_pc unlock
    {
        id: 'gpa_old_pc_unlock',
        type: NotificationType.NARRATION,
        trigger: {
            type: TriggerType.ON_NODE_UNLOCKED,
            nodeId: 'gpa_old_pc'
        },
        message: 'You power on the old PC. The screen flickers to life, displaying a command prompt. It seems functional, albeit slow.',
        duration: NotificationDurations.NARRATION_LONG,
        persistAcrossAscension: false,
        priority: 10
    },
    {
        id: 'gpa_old_pc_unlock_terminal',
        type: NotificationType.TERMINAL,
        trigger: {
            type: TriggerType.ON_NODE_UNLOCKED,
            nodeId: 'gpa_old_pc'
        },
        message: '...Booting up...\n\n\nGood to see you again Anton!\n\nType /help for a list of commands.',
        duration: NotificationDurations.NARRATION_LONG,
        persistAcrossAscension: false,
        priority: 9,
        delay: 1_000
    },
    {
        id: 'gpa_old_pc_unlock_2',
        type: NotificationType.NARRATION,
        trigger: {
            type: TriggerType.ON_NODE_UNLOCKED,
            nodeId: 'gpa_old_pc'
        },
        message: 'Wow, this old computer still works! It even calls my grandfather by name!',
        duration: NotificationDurations.NARRATION_LONG,
        persistAcrossAscension: false,
        priority: 8,
        delay: 3_000
    },
    // command_help unlock
    {
        id: 'command_help_unlock',
        type: NotificationType.TERMINAL,
        trigger: {
            type: TriggerType.ON_NODE_UNLOCKED,
            nodeId: 'command_help'
        },
        message: 'Available commands:\n/help - Display this help message\n/generate - Generate data from raw inputs',
        duration: NotificationDurations.NARRATION_LONG,
        persistAcrossAscension: false,
        priority: 5
    },
    // command_generate unlock
    {
        id: 'command_generate_unlock',
        type: NotificationType.NARRATION,
        trigger: {
            type: TriggerType.ON_NODE_UNLOCKED,
            nodeId: 'command_generate'
        },
        message: 'You execute /generate. On the screen appears a single progressbar that slowly fills up. VEEEERY SLOW. After a while, it completes you see: "Data generation complete. 1 byte generated."',
        duration: NotificationDurations.NARRATION_LONG,
        persistAcrossAscension: false,
        priority: 10
    },
    {
        id: 'command_generate_unlock_terminal',
        type: NotificationType.TERMINAL,
        trigger: {
            type: TriggerType.ON_NODE_UNLOCKED,
            nodeId: 'command_generate'
        },
        message: '/generate\n\n[           ] 0%',
        duration: NotificationDurations.NARRATION_LONG,
        persistAcrossAscension: false,
        priority: 10,
        delay: 1_000
    },
    {
        id: 'command_generate_unlock_terminal_10_percent',
        type: NotificationType.TERMINAL,
        trigger: {
            type: TriggerType.ON_NODE_UNLOCKED,
            nodeId: 'command_generate'
        },
        message: '[#_________] 10%',
        duration: NotificationDurations.NARRATION_LONG,
        persistAcrossAscension: false,
        priority: 10,
        delay: 2_000
    },
    {
        id: 'command_generate_unlock_terminal_50_percent',
        type: NotificationType.TERMINAL,
        trigger: {
            type: TriggerType.ON_NODE_UNLOCKED,
            nodeId: 'command_generate'
        },
        message: '[######_____] 50%',
        duration: NotificationDurations.NARRATION_LONG,
        persistAcrossAscension: false,
        priority: 10,
        delay: 8_000
    },
    {
        id: 'command_generate_unlock_terminal_100_percent',
        type: NotificationType.TERMINAL,
        trigger: {
            type: TriggerType.ON_RESOURCE_AMOUNT_REACHED,
            resource: 'data',
            threshold: 1,
            comparison: '>='
        },
        message: '[##########] 100% \n\nData generation complete. 1 byte generated.',
        duration: NotificationDurations.NARRATION_LONG,
        persistAcrossAscension: false,
        priority: 10
    },
    // data generation reaching starting capacity
    {
        id: 'data_storage_90_percent',
        type: NotificationType.TERMINAL,
        trigger: {
            type: TriggerType.ON_RESOURCE_AMOUNT_REACHED,
            resource: 'data',
            threshold: 1028,
            comparison: '>='
        },
        message: 'Storage capacity at 100%... Please consider upgrading your storage to continue generating data.',
        duration: NotificationDurations.NARRATION_LONG,
        persistAcrossAscension: false,
        priority: 10
    },
];
