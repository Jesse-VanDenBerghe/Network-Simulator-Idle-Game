// Type Definitions Barrel Export
// ================================

// Game state types
export type {
    ResourceId,
    Resource,
    ResourceAmounts,
    AutomationRates,
    DataGeneration,
    EnergyGeneration,
    GameStatistics,
    GameState,
    PrestigeStatistics,
    PrestigeState,
    PrestigeBonuses,
    SaveState
} from './game';

// Node system types
export type {
    BranchId,
    BranchMetadata,
    NodeTier,
    NodeCost,
    AutomationEffect,
    NarrationEffect,
    LevelEffect,
    NodeEffects,
    NodeRequirement,
    Node,
    Branch,
    AffordabilityCheck,
    UnlockResult,
    NodeCollection,
    BranchCollection
} from './node';

export {
    BRANCHES
} from './node';

// Notification system types
export {
    NotificationType,
    TriggerType,
    ComparisonOperator,
    NotificationDurations
} from './notification';

export type {
    BaseTrigger,
    NodeUnlockedTrigger,
    NodeLevelTrigger,
    ResourceTrigger,
    BranchUnlockedTrigger,
    FeatureUnlockedTrigger,
    TierReachedTrigger,
    AscensionTrigger,
    OfflineReturnTrigger,
    IdleTimeTrigger,
    FirstLaunchTrigger,
    NotificationTrigger,
    Notification,
    NotificationDisplay,
    NotificationHistoryEntry,
    NotificationState
} from './notification';

// Event bus types
export type {
    NodeUnlockedEvent,
    NodeLevelReachedEvent,
    BranchUnlockedEvent,
    FeatureUnlockedEvent,
    TierReachedEvent,
    ResourceChangedEvent,
    NotificationShownEvent,
    AscensionEvent,
    GameLoadedEvent,
    CrankClickedEvent,
    EventMap,
    EventHandler,
    EventBus
} from './event';
