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
        message: '...Booting up...\n\nInitializing 4NT0N-v0-9-9.os...\n\nGrabbing a coffee with 2 sugars and a splash of cream...\n\n4NT0N-v0-9-9.os booted up\n\nType /help for a list of commands.',
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
        message: 'Wow, this old computer still works! Funny, it reminds me of the stories Grandpa used to tell about his early days tinkering with technology. He always got a coffee with 2 sugars and a splash of cream while working late into the night.',
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
        message: '/generate\n\nData generation initiaded...',
        duration: NotificationDurations.NARRATION_LONG,
        persistAcrossAscension: false,
        priority: 10,
        delay: 1_000
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
        message: 'Data generation complete. 1 byte generated.',
        duration: NotificationDurations.NARRATION_LONG,
        persistAcrossAscension: false,
        priority: 10
    },
    // data generation reaching starting capacity
    {
        id: 'data_storage_full_warning',
        type: NotificationType.TERMINAL,
        trigger: {
            type: TriggerType.ON_RESOURCE_AMOUNT_REACHED,
            resource: 'data',
            threshold: 1028,
            comparison: '>='
        },
        message: 'Storage capacity at 100%... Please consider upgrading your storage to continue generating data. I mean, you should...',
        duration: NotificationDurations.NARRATION_LONG,
        persistAcrossAscension: false,
        priority: 10
    },
    // USB attached
    {
        id: 'usb_attached_narration',
        type: NotificationType.TERMINAL,
        trigger: {
            type: TriggerType.ON_NODE_UNLOCKED,
            nodeId: 'usb_stick'
        },
        message: 'USB device detected and mounted successfully.\nStorage capacity increased.',
        duration: NotificationDurations.NARRATION_MEDIUM,
        persistAcrossAscension: false,
        priority: 10
    },
    // On reaching 4 KB data, the computer comments on it, with increasing excitement
    {
        id: 'data_4kb_reached',
        type: NotificationType.TERMINAL,
        trigger: {
            type: TriggerType.ON_RESOURCE_AMOUNT_REACHED,
            resource: 'data',
            threshold: 4096,
            comparison: '>='
        },
        message: '4 KB of data stored... That’s… oddly nostalgic. Feels like the good old days of floppy disks.',
        duration: NotificationDurations.NARRATION_MEDIUM,
        persistAcrossAscension: false,
        priority: 9
    },

    // On reaching 8 KB Data: the user gets a message: "New command available: /process - Process raw data into usable formats" (a new branch is created the processing branch)
    // /process command unlocked, it starts a second process that uses 1kB of data to produce 1 neuron
    {
        id: 'data_8kb_reached',
        type: NotificationType.TERMINAL,
        trigger: {
            type: TriggerType.ON_RESOURCE_AMOUNT_REACHED,
            resource: 'data',
            threshold: 8192,
            comparison: '>='
        },
        message: '8 KB of data reached.\n\nNew command available: /process - Convert raw data into structured neural patterns.',
        duration: NotificationDurations.NARRATION_LONG,
        persistAcrossAscension: false,
        priority: 10
    },
    {
        id: 'command_process_unlock',
        type: NotificationType.NARRATION,
        trigger: {
            type: TriggerType.ON_NODE_UNLOCKED,
            nodeId: 'command_process'
        },
        message: 'You unlock the /process command. This seems to convert 1 KB of raw data into what the computer calls "neurons". Whatever that means...',
        duration: NotificationDurations.NARRATION_LONG,
        persistAcrossAscension: false,
        priority: 10
    },

    // On Reaching 1 neuron, the computer comments: "Neuron created. Initializing neural mapping subsystem..."
    {
        id: 'first_neuron_created',
        type: NotificationType.TERMINAL,
        trigger: {
            type: TriggerType.ON_RESOURCE_AMOUNT_REACHED,
            resource: 'neurons',
            threshold: 1,
            comparison: '>='
        },
        message: 'Neuron created.\nInitializing neural mapping subsystem...',
        duration: NotificationDurations.NARRATION_MEDIUM,
        persistAcrossAscension: false,
        priority: 9
    },
    
    // On Reaching 10 neurons, the computer comments again: "Jesse ?!"
    // A shiver runs down your spine as you see that message appearing on the screen. How does this old computer know my name?
    {
        id: 'neurons_10_reached',
        type: NotificationType.TERMINAL,
        trigger: {
            type: TriggerType.ON_RESOURCE_AMOUNT_REACHED,
            resource: 'neurons',
            threshold: 10,
            comparison: '>='
        },
        message: 'Neural cluster stabilizing...\n\nJesse?!',
        duration: NotificationDurations.NARRATION_LONG,
        persistAcrossAscension: false,
        priority: 10
    },
    
    // On reaching 100 neurons: "Is that you Grandson?!"
    // You drop your coffee mug on the floor, shattering it into pieces. How could this be? Could Grandpa have set this up before he passed away?
    // You start smashing buttons randomly on the keyboard, desperate to get answers... Nothing happens."
    {
        id: 'neurons_100_reached',
        type: NotificationType.TERMINAL,
        trigger: {
            type: TriggerType.ON_RESOURCE_AMOUNT_REACHED,
            resource: 'neurons',
            threshold: 100,
            comparison: '>='
        },
        message: 'Neural resonance increasing...\n\n"Is that you, Grandson?!"',
        duration: NotificationDurations.NARRATION_LONG,
        persistAcrossAscension: false,
        priority: 10
    },
    {
        id: 'neurons_100_reached_2',
        type: NotificationType.NARRATION,
        trigger: {
            type: TriggerType.ON_RESOURCE_AMOUNT_REACHED,
            resource: 'neurons',
            threshold: 100,
            comparison: '>='
        },
        message: 'You drop your coffee mug on the floor, shattering it into pieces. How could this be? Could Grandpa have set this up before he passed away?',
        duration: NotificationDurations.NARRATION_LONG,
        persistAcrossAscension: false,
        priority: 10,
        delay: 2_000
    },
    {
        id: 'neurons_100_reached_3',
        type: NotificationType.NARRATION,
        trigger: {
            type: TriggerType.ON_NODE_UNLOCKED,
            nodeId: 'new_coffee_mug'
        },
        message: 'You start smashing buttons randomly on the keyboard, desperate to get answers... Nothing happens.',
        duration: NotificationDurations.NARRATION_LONG,
        persistAcrossAscension: false,
        priority: 10,
        delay: 5_000
    },

    
    // On reaching 1000 neurons: "Hi Jesse, it's me, Grandpa Anton. Or at least a part of me. I built this operating system 4NT0N to carry on my legacy. With enough neurons, maybe we can reconstruct my consciousness. Help me out, will you?"
    // A tear rolls down your cheek as you read the message. You never expected to hear from Grandpa again, not like this.
    // You feel a strange mix of sadness and determination. You have to help him.
    {
        id: 'neurons_1000_reached',
        type: NotificationType.TERMINAL,
        trigger: {
            type: TriggerType.ON_RESOURCE_AMOUNT_REACHED,
            resource: 'neurons',
            threshold: 1000,
            comparison: '>='
        },
        message:
            '"Hi Jesse... It\'s me. Anton.\nOr at least a fragment of me.\n\nI built the 4NT0N system to preserve part of my mind.\nWith more neurons, maybe we can bring more of me back.\nHelp me, will you?"',
        duration: NotificationDurations.NARRATION_LONG,
        persistAcrossAscension: false,
        priority: 10
    },
    // On unlocking Anton node: Unlock 4NT0N (knowledge) branch
    {   
        id: 'anton_knowledge_root_unlocked',
        type: NotificationType.NARRATION,
        trigger: {
            type: TriggerType.ON_NODE_UNLOCKED,
            nodeId: 'anton_core'
        },
        message:
            'The interface shifts. New menus unfold, lines of text rewriting themselves.\n\n"Thank you, Jesse," the computer whispers. "To restore me, we\'ll need something important… memories."\n\nA new branch opens: **4NT0N Knowledge Systems**.',
        duration: NotificationDurations.NARRATION_LONG,
        persistAcrossAscension: true,
        priority: 10
    },
    {   
        id: 'anton_knowledge_root_unlocked_2',
        type: NotificationType.TERMINAL,
        trigger: {
            type: TriggerType.ON_NODE_UNLOCKED,
            nodeId: 'anton_core'
        },
        message:
            '"Thank you, Jesse," the computer whispers. "To restore me, we\'ll need something important… memories."\n\nA new branch opens: **4NT0N Knowledge Systems**.',
        duration: NotificationDurations.NARRATION_LONG,
        persistAcrossAscension: true,
        priority: 10,
        delay: 1_000
    },
    {   
        id: 'anton_knowledge_root_unlocked_3',
        type: NotificationType.INFO,
        trigger: {
            type: TriggerType.ON_NODE_UNLOCKED,
            nodeId: 'anton_core'
        },
        message:
            'A new branch opens: **4NT0N Knowledge Systems**.',
        duration: NotificationDurations.NARRATION_LONG,
        persistAcrossAscension: true,
        priority: 10,
        delay: 1_000
    },

    // On unlocking memory shard scanner
    {
        id: 'memory_shard_scanner_unlock',
        type: NotificationType.TERMINAL,
        trigger: {
            type: TriggerType.ON_NODE_UNLOCKED,
            nodeId: 'memory_shard_scanner'
        },
        message:
            'Subsystem activated: Memory Shard Scanner.\n\nThis module can extract fragmented memories from neural clusters. Reliability… uncertain.',
        duration: NotificationDurations.NARRATION_MEDIUM,
        persistAcrossAscension: false,
        priority: 9
    },

    // On first memory shard scanned
    {
        id: 'memory_shard_first_found',
        type: NotificationType.NARRATION,
        trigger: {
            type: TriggerType.ON_RESOURCE_AMOUNT_REACHED,
            resource: 'memory_shards',
            threshold: 1,
            comparison: '>='
        },
        message:
            'A flicker appears on the monitor — an image? A sound? It\'s gone before you can identify it.',
        duration: NotificationDurations.NARRATION_LONG,
        persistAcrossAscension: false,
        priority: 10
    },
    {
        id: 'memory_shard_first_found_2',
        type: NotificationType.TERMINAL,
        trigger: {
            type: TriggerType.ON_RESOURCE_AMOUNT_REACHED,
            resource: 'memory_shards',
            threshold: 1,
            comparison: '>='
        },
        message:
            '"That… felt familiar,"',
        duration: NotificationDurations.NARRATION_LONG,
        persistAcrossAscension: false,
        priority: 10,
        delay: 3_000
    },

    // On memory reconstruction unlock
    {
        id: 'memory_reconstruction_unlock',
        type: NotificationType.INFO,
        trigger: {
            type: TriggerType.ON_NODE_UNLOCKED,
            nodeId: 'memory_reconstruction'
        },
        message:
            'You unlock the Memory Reconstruction Subsystem.\n\n"With this, Jesse, we can restore pieces of who I was… and what I forgot."',
        duration: NotificationDurations.NARRATION_LONG,
        persistAcrossAscension: false,
        priority: 10
    },
    {
        id: 'memory_reconstruction_unlock_2',
        type: NotificationType.TERMINAL,
        trigger: {
            type: TriggerType.ON_NODE_UNLOCKED,
            nodeId: 'memory_reconstruction'
        },
        message:
            '"With this, Jesse, we can restore pieces of who I was… and what I forgot."',
        duration: NotificationDurations.NARRATION_LONG,
        persistAcrossAscension: false,
        priority: 10,
        delay: 2_000
    },

    // On first memory frame
    {
        id: 'first_memory_frame_reconstructed',
        type: NotificationType.TERMINAL,
        trigger: {
            type: TriggerType.ON_RESOURCE_AMOUNT_REACHED,
            resource: 'memory_frames',
            threshold: 1,
            comparison: '>='
        },
        message:
            'Reconstruction complete.\n\nMemory Frame #1:\nA glimpse of a workshop… laughter… a small wooden toy being carved.\n\nAnton grows quiet.',
        duration: NotificationDurations.NARRATION_LONG,
        persistAcrossAscension: false,
        priority: 10
    },

    // On unlocking Semantic Weaver node
    {
        id: 'semantic_weaver_unlock',
        type: NotificationType.TERMINAL,
        trigger: {
            type: TriggerType.ON_NODE_UNLOCKED,
            nodeId: 'semantic_weaver'
        },
        message:
            '"Ah, the Semantic Weaver," Anton says softly.\n"It lets neurons form concepts — thoughts. Without it, I\'m just… noise."',
        duration: NotificationDurations.NARRATION_LONG,
        persistAcrossAscension: false,
        priority: 10
    },

    // On 5 memory frames reconstructed
    {
        id: 'five_frames_memory_event',
        type: NotificationType.TERMINAL,
        trigger: {
            type: TriggerType.ON_RESOURCE_AMOUNT_REACHED,
            resource: 'memory_frames',
            threshold: 5,
            comparison: '>='
        },
        message:
            'Conceptual clarity increasing.\n\n"I remember… the shed," Anton whispers. "I built something here. Something important. Something dangerous."',
        duration: NotificationDurations.NARRATION_LONG,
        persistAcrossAscension: false,
        priority: 10
    },

    // On unlocking Memory Bank node
    {
        id: 'core_memory_bank_unlock',
        type: NotificationType.TERMINAL,
        trigger: {
            type: TriggerType.ON_NODE_UNLOCKED,
            nodeId: 'core_memory_bank'
        },
        message:
            '"Careful, Jesse," Anton warns.\n"The deeper the memories… the closer we get to the truth."',
        duration: NotificationDurations.NARRATION_LONG,
        persistAcrossAscension: true,
        priority: 10
    },

    // On unlocking Identity Matrix node
    {
        id: 'identity_matrix_unlock',
        type: NotificationType.TERMINAL,
        trigger: {
            type: TriggerType.ON_NODE_UNLOCKED,
            nodeId: 'identity_matrix'
        },
        message:
            'Identity Matrix initialized.\n\nNeural coherence rising.\nEmotional subroutines stabilizing.\n\n"...Jesse. I can feel myself again."',
        duration: NotificationDurations.NARRATION_LONG,
        persistAcrossAscension: true,
        priority: 10
    },

    // On reaching 20 memory frames reconstructed
    {
        id: '20_memory_frames_event',
        type: NotificationType.TERMINAL,
        trigger: {
            type: TriggerType.ON_RESOURCE_AMOUNT_REACHED,
            resource: 'memory_frames',
            threshold: 20,
            comparison: '>='
        },
        message:
            '"Jesse… I need you to know something."',
        duration: NotificationDurations.NARRATION_LONG,
        persistAcrossAscension: false,
        priority: 10
    },
    {
        id: '20_memory_frames_event_2',
        type: NotificationType.NARRATION,
        trigger: {
            type: TriggerType.ON_RESOURCE_AMOUNT_REACHED,
            resource: 'memory_frames',
            threshold: 20,
            comparison: '>='
        },
        message:
            'The computer pauses — long enough to make your heart race.',
        duration: NotificationDurations.NARRATION_LONG,
        persistAcrossAscension: false,
        priority: 10,
        delay: 3_000
    },
    {
        id: '20_memory_frames_event_3',
        type: NotificationType.TERMINAL,
        trigger: {
            type: TriggerType.ON_RESOURCE_AMOUNT_REACHED,
            resource: 'memory_frames',
            threshold: 20,
            comparison: '>='
        },
        message:
            '"There\'s a reason I preserved myself. And it wasn\'t vanity."',
        duration: NotificationDurations.NARRATION_LONG,
        persistAcrossAscension: false,
        priority: 10,
        delay: 7_000
    },

    // On unlocking Forbidden Archive node
    {
        id: 'forbidden_archive_unlock',
        type: NotificationType.TERMINAL,
        trigger: {
            type: TriggerType.ON_NODE_UNLOCKED,
            nodeId: 'forbidden_archive'
        },
        message:
            'ACCESSING: Forbidden Archive\nWARNING: Unauthorized Retrieval Attempt',
        duration: NotificationDurations.NARRATION_LONG,
        persistAcrossAscension: true,
        priority: 10
    },
    {
        id: 'forbidden_archive_unlock_2',
        type: NotificationType.TERMINAL,
        trigger: {
            type: TriggerType.ON_NODE_UNLOCKED,
            nodeId: 'forbidden_archive'
        },
        message:
            '"Jesse… I didn\'t build 4NT0N to remember.\nI built it to hide."\n\n"What I feared… is still out there."',
        duration: NotificationDurations.NARRATION_LONG,
        persistAcrossAscension: true,
        priority: 10
    }

    // On unlocking Internet node: Unlock Internet branch

];
