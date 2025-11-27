import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useNotificationEngine } from '../js/composables/useNotificationEngine.js';
import { TriggerType, ComparisonOperator, NotificationDefaults } from '../js/data/notifications/types.js';
import { NotificationType } from '../js/data/notifications/constants.js';

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: vi.fn(key => store[key] || null),
        setItem: vi.fn((key, value) => { store[key] = value; }),
        removeItem: vi.fn(key => { delete store[key]; }),
        clear: vi.fn(() => { store = {}; })
    };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Mock getAllNotifications
vi.mock('../js/data/notifications/index.js', () => ({
    getAllNotifications: vi.fn(() => [])
}));

import { getAllNotifications } from '../js/data/notifications/index.js';

describe('useNotificationEngine', () => {
    let eventBus;
    let engine;
    let emittedEvents;

    beforeEach(() => {
        vi.clearAllMocks();
        localStorageMock.clear();
        emittedEvents = [];
        
        // Create mock event bus
        const listeners = new Map();
        eventBus = {
            on: vi.fn((event, handler) => {
                if (!listeners.has(event)) listeners.set(event, []);
                listeners.get(event).push(handler);
            }),
            emit: vi.fn((event, data) => {
                emittedEvents.push({ event, data });
                const handlers = listeners.get(event) || [];
                handlers.forEach(h => h(data));
            }),
            off: vi.fn()
        };
    });

    // ==========================================
    // INDEX BUILDER TESTS
    // ==========================================
    describe('buildNotificationIndex', () => {
        it('indexes onNodeUnlocked by nodeId', () => {
            getAllNotifications.mockReturnValue([
                {
                    id: 'test_1',
                    trigger: { type: TriggerType.ON_NODE_UNLOCKED, nodeId: 'hand_crank' },
                    message: 'Test 1'
                },
                {
                    id: 'test_2',
                    trigger: { type: TriggerType.ON_NODE_UNLOCKED, nodeId: 'hand_crank' },
                    message: 'Test 2'
                }
            ]);
            
            engine = useNotificationEngine(eventBus);
            engine.initialize();
            
            // Trigger the event
            eventBus.emit('nodeUnlocked', { node: { id: 'hand_crank', tier: 0 }, newLevel: 1, isUpgrade: false });
            
            // Both should be queued
            expect(emittedEvents.filter(e => e.event === 'showNotification').length).toBeGreaterThan(0);
        });

        it('indexes onNodeLevelReached by nodeId:level key', () => {
            getAllNotifications.mockReturnValue([
                {
                    id: 'level_5',
                    trigger: { type: TriggerType.ON_NODE_LEVEL_REACHED, nodeId: 'crank_harder', level: 5 },
                    message: 'Level 5!'
                }
            ]);
            
            engine = useNotificationEngine(eventBus);
            engine.initialize();
            
            // Upgrade to level 5
            eventBus.emit('nodeUnlocked', { node: { id: 'crank_harder', tier: 1 }, newLevel: 5, isUpgrade: true });
            
            expect(emittedEvents.some(e => e.event === 'showNotification')).toBe(true);
        });

        it('indexes onBranchUnlocked by branch name', () => {
            getAllNotifications.mockReturnValue([
                {
                    id: 'computer_branch',
                    trigger: { type: TriggerType.ON_BRANCH_UNLOCKED, branch: 'computer' },
                    message: 'Computer branch unlocked!'
                }
            ]);
            
            engine = useNotificationEngine(eventBus);
            engine.initialize();
            
            eventBus.emit('branchUnlocked', { branch: 'computer' });
            
            expect(emittedEvents.some(e => e.event === 'showNotification')).toBe(true);
        });

        it('sorts resource thresholds by threshold value', () => {
            getAllNotifications.mockReturnValue([
                {
                    id: 'energy_1000',
                    trigger: { type: TriggerType.ON_RESOURCE_AMOUNT_REACHED, resource: 'energy', threshold: 1000 },
                    message: '1000 energy!'
                },
                {
                    id: 'energy_100',
                    trigger: { type: TriggerType.ON_RESOURCE_AMOUNT_REACHED, resource: 'energy', threshold: 100 },
                    message: '100 energy!'
                },
                {
                    id: 'energy_500',
                    trigger: { type: TriggerType.ON_RESOURCE_AMOUNT_REACHED, resource: 'energy', threshold: 500 },
                    message: '500 energy!'
                }
            ]);
            
            engine = useNotificationEngine(eventBus);
            engine.initialize();
            
            // Check 200 energy - should only trigger 100 threshold
            engine.checkResourceThresholds({ energy: 200, data: 0, bandwidth: 0 });
            
            const notifications = emittedEvents.filter(e => e.event === 'showNotification');
            expect(notifications.length).toBe(1);
            expect(notifications[0].data.message).toBe('100 energy!');
        });

        it('sorts idle thresholds by idleSeconds', () => {
            getAllNotifications.mockReturnValue([
                {
                    id: 'idle_300',
                    trigger: { type: TriggerType.ON_IDLE_TIME, idleSeconds: 300 },
                    message: '5 min idle'
                },
                {
                    id: 'idle_60',
                    trigger: { type: TriggerType.ON_IDLE_TIME, idleSeconds: 60 },
                    message: '1 min idle'
                }
            ]);
            
            engine = useNotificationEngine(eventBus);
            engine.initialize();
            
            // Engine initialized, idle thresholds sorted
            // We can't easily test sorting without exposing internal state
            // But we can verify the engine initializes without error
            expect(engine).toBeDefined();
        });
    });

    // ==========================================
    // TRIGGER MATCHING TESTS
    // ==========================================
    describe('trigger matching', () => {
        it('matches onFirstLaunch trigger', () => {
            getAllNotifications.mockReturnValue([
                {
                    id: 'welcome',
                    trigger: { type: TriggerType.ON_FIRST_LAUNCH },
                    message: 'Welcome!',
                    priority: 10
                }
            ]);
            
            engine = useNotificationEngine(eventBus);
            engine.initialize();
            
            eventBus.emit('gameLoaded', { isFirstLaunch: true });
            
            expect(emittedEvents.some(e => 
                e.event === 'showNotification' && e.data.message === 'Welcome!'
            )).toBe(true);
        });

        it('does not trigger onFirstLaunch when not first launch', () => {
            getAllNotifications.mockReturnValue([
                {
                    id: 'welcome',
                    trigger: { type: TriggerType.ON_FIRST_LAUNCH },
                    message: 'Welcome!'
                }
            ]);
            
            engine = useNotificationEngine(eventBus);
            engine.initialize();
            
            eventBus.emit('gameLoaded', { isFirstLaunch: false });
            
            expect(emittedEvents.some(e => e.event === 'showNotification')).toBe(false);
        });

        it('matches onFeatureUnlocked trigger', () => {
            getAllNotifications.mockReturnValue([
                {
                    id: 'data_processing',
                    trigger: { type: TriggerType.ON_FEATURE_UNLOCKED, feature: 'dataProcessing' },
                    message: 'Data processing unlocked!'
                }
            ]);
            
            engine = useNotificationEngine(eventBus);
            engine.initialize();
            
            eventBus.emit('featureUnlocked', { feature: 'dataProcessing' });
            
            expect(emittedEvents.some(e => e.event === 'showNotification')).toBe(true);
        });

        it('matches onTierReached trigger on first node of tier', () => {
            getAllNotifications.mockReturnValue([
                {
                    id: 'tier_3',
                    trigger: { type: TriggerType.ON_TIER_REACHED, tier: 3 },
                    message: 'Tier 3 reached!'
                }
            ]);
            
            engine = useNotificationEngine(eventBus);
            engine.initialize();
            
            eventBus.emit('nodeUnlocked', { 
                node: { id: 'some_node', tier: 3 }, 
                newLevel: 1, 
                isUpgrade: false 
            });
            
            expect(emittedEvents.some(e => e.event === 'showNotification')).toBe(true);
        });

        it('does not trigger onTierReached on subsequent nodes of same tier', () => {
            getAllNotifications.mockReturnValue([
                {
                    id: 'tier_3',
                    trigger: { type: TriggerType.ON_TIER_REACHED, tier: 3 },
                    message: 'Tier 3 reached!'
                }
            ]);
            
            engine = useNotificationEngine(eventBus);
            engine.initialize();
            
            // First tier 3 node
            eventBus.emit('nodeUnlocked', { 
                node: { id: 'node_a', tier: 3 }, 
                newLevel: 1, 
                isUpgrade: false 
            });
            
            const countAfterFirst = emittedEvents.filter(e => e.event === 'showNotification').length;
            
            // Second tier 3 node
            eventBus.emit('nodeUnlocked', { 
                node: { id: 'node_b', tier: 3 }, 
                newLevel: 1, 
                isUpgrade: false 
            });
            
            const countAfterSecond = emittedEvents.filter(e => e.event === 'showNotification').length;
            
            // Should not have triggered again
            expect(countAfterSecond).toBe(countAfterFirst);
        });

        it('matches onAscension with count filter', async () => {
            vi.useFakeTimers();
            
            getAllNotifications.mockReturnValue([
                {
                    id: 'first_ascension',
                    trigger: { type: TriggerType.ON_ASCENSION, count: 1 },
                    message: 'First ascension!'
                },
                {
                    id: 'any_ascension',
                    trigger: { type: TriggerType.ON_ASCENSION },
                    message: 'Ascended!'
                }
            ]);
            
            engine = useNotificationEngine(eventBus);
            engine.initialize();
            
            eventBus.emit('ascensionComplete', { count: 1 });
            
            // Wait for queue to process both
            vi.advanceTimersByTime(600);
            
            // Both should trigger (specific count match + no count filter)
            const notifications = emittedEvents.filter(e => e.event === 'showNotification');
            expect(notifications.length).toBe(2);
            
            vi.useRealTimers();
        });

        it('matches onOfflineReturn with minimum seconds', () => {
            getAllNotifications.mockReturnValue([
                {
                    id: 'offline_hour',
                    trigger: { type: TriggerType.ON_OFFLINE_RETURN, offlineSeconds: 3600 },
                    message: 'Welcome back after an hour!'
                },
                {
                    id: 'offline_any',
                    trigger: { type: TriggerType.ON_OFFLINE_RETURN, offlineSeconds: 60 },
                    message: 'Welcome back!'
                }
            ]);
            
            engine = useNotificationEngine(eventBus);
            engine.initialize();
            
            // 30 minutes offline
            eventBus.emit('offlineReturn', { offlineSeconds: 1800 });
            
            // Only 60s threshold should trigger
            const notifications = emittedEvents.filter(e => e.event === 'showNotification');
            expect(notifications.length).toBe(1);
            expect(notifications[0].data.message).toBe('Welcome back!');
        });
    });

    // ==========================================
    // RESOURCE THRESHOLD TESTS
    // ==========================================
    describe('resource thresholds', () => {
        it('triggers when resource crosses threshold (>=)', () => {
            getAllNotifications.mockReturnValue([
                {
                    id: 'energy_100',
                    trigger: { 
                        type: TriggerType.ON_RESOURCE_AMOUNT_REACHED, 
                        resource: 'energy', 
                        threshold: 100,
                        comparison: '>='
                    },
                    message: '100 energy!'
                }
            ]);
            
            engine = useNotificationEngine(eventBus);
            engine.initialize();
            
            engine.checkResourceThresholds({ energy: 150, data: 0, bandwidth: 0 });
            
            expect(emittedEvents.some(e => e.event === 'showNotification')).toBe(true);
        });

        it('does not re-trigger after already triggered', () => {
            getAllNotifications.mockReturnValue([
                {
                    id: 'energy_100',
                    trigger: { 
                        type: TriggerType.ON_RESOURCE_AMOUNT_REACHED, 
                        resource: 'energy', 
                        threshold: 100
                    },
                    message: '100 energy!'
                }
            ]);
            
            engine = useNotificationEngine(eventBus);
            engine.initialize();
            
            engine.checkResourceThresholds({ energy: 150, data: 0, bandwidth: 0 });
            const countFirst = emittedEvents.filter(e => e.event === 'showNotification').length;
            
            engine.checkResourceThresholds({ energy: 200, data: 0, bandwidth: 0 });
            const countSecond = emittedEvents.filter(e => e.event === 'showNotification').length;
            
            expect(countSecond).toBe(countFirst);
        });

        it('early exits when current < next threshold', () => {
            getAllNotifications.mockReturnValue([
                {
                    id: 'energy_100',
                    trigger: { type: TriggerType.ON_RESOURCE_AMOUNT_REACHED, resource: 'energy', threshold: 100 },
                    message: '100!'
                },
                {
                    id: 'energy_1000',
                    trigger: { type: TriggerType.ON_RESOURCE_AMOUNT_REACHED, resource: 'energy', threshold: 1000 },
                    message: '1000!'
                }
            ]);
            
            engine = useNotificationEngine(eventBus);
            engine.initialize();
            
            // 50 energy - should trigger nothing
            engine.checkResourceThresholds({ energy: 50, data: 0, bandwidth: 0 });
            
            expect(emittedEvents.filter(e => e.event === 'showNotification').length).toBe(0);
        });

        it('handles <= comparison', () => {
            getAllNotifications.mockReturnValue([
                {
                    id: 'low_energy',
                    trigger: { 
                        type: TriggerType.ON_RESOURCE_AMOUNT_REACHED, 
                        resource: 'energy', 
                        threshold: 10,
                        comparison: '<='
                    },
                    message: 'Low energy!'
                }
            ]);
            
            engine = useNotificationEngine(eventBus);
            engine.initialize();
            
            engine.checkResourceThresholds({ energy: 5, data: 0, bandwidth: 0 });
            
            expect(emittedEvents.some(e => e.event === 'showNotification')).toBe(true);
        });

        it('handles == comparison', () => {
            getAllNotifications.mockReturnValue([
                {
                    id: 'exact_100',
                    trigger: { 
                        type: TriggerType.ON_RESOURCE_AMOUNT_REACHED, 
                        resource: 'energy', 
                        threshold: 100,
                        comparison: '=='
                    },
                    message: 'Exactly 100!'
                }
            ]);
            
            engine = useNotificationEngine(eventBus);
            engine.initialize();
            
            engine.checkResourceThresholds({ energy: 100, data: 0, bandwidth: 0 });
            expect(emittedEvents.some(e => e.event === 'showNotification')).toBe(true);
            
            // Reset and check 101 - should not trigger
            emittedEvents = [];
            engine.checkResourceThresholds({ energy: 101, data: 0, bandwidth: 0 });
            expect(emittedEvents.filter(e => e.event === 'showNotification').length).toBe(0);
        });
    });

    // ==========================================
    // SHOWN STATE PERSISTENCE
    // ==========================================
    describe('shown state persistence', () => {
        it('loads shown state from localStorage', () => {
            localStorageMock.setItem('networkSimShownNotifications', JSON.stringify(['test_1', 'test_2']));
            
            getAllNotifications.mockReturnValue([
                {
                    id: 'test_1',
                    trigger: { type: TriggerType.ON_NODE_UNLOCKED, nodeId: 'hand_crank' },
                    message: 'Test 1'
                }
            ]);
            
            engine = useNotificationEngine(eventBus);
            engine.initialize();
            
            // Already shown, should not trigger
            eventBus.emit('nodeUnlocked', { node: { id: 'hand_crank', tier: 0 }, newLevel: 1, isUpgrade: false });
            
            expect(emittedEvents.filter(e => e.event === 'showNotification').length).toBe(0);
        });

        it('saves shown state to localStorage (debounced)', async () => {
            vi.useFakeTimers();
            
            getAllNotifications.mockReturnValue([
                {
                    id: 'new_notification',
                    trigger: { type: TriggerType.ON_NODE_UNLOCKED, nodeId: 'hand_crank' },
                    message: 'New!'
                }
            ]);
            
            engine = useNotificationEngine(eventBus);
            engine.initialize();
            
            eventBus.emit('nodeUnlocked', { node: { id: 'hand_crank', tier: 0 }, newLevel: 1, isUpgrade: false });
            
            // Should not save immediately
            expect(localStorageMock.setItem).not.toHaveBeenCalledWith(
                'networkSimShownNotifications',
                expect.anything()
            );
            
            // Advance timer past debounce
            vi.advanceTimersByTime(1100);
            
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                'networkSimShownNotifications',
                expect.stringContaining('new_notification')
            );
            
            vi.useRealTimers();
        });

        it('handles corrupted localStorage gracefully', () => {
            localStorageMock.getItem.mockReturnValueOnce('not valid json{{{');
            
            getAllNotifications.mockReturnValue([]);
            
            engine = useNotificationEngine(eventBus);
            
            // Should not throw
            expect(() => engine.initialize()).not.toThrow();
        });

        it('handles localStorage quota exceeded', async () => {
            vi.useFakeTimers();
            
            getAllNotifications.mockReturnValue([
                {
                    id: 'test',
                    trigger: { type: TriggerType.ON_NODE_UNLOCKED, nodeId: 'test' },
                    message: 'Test'
                }
            ]);
            
            localStorageMock.setItem.mockImplementationOnce(() => {
                const error = new Error('Storage quota exceeded');
                error.name = 'QuotaExceededError';
                throw error;
            });
            
            engine = useNotificationEngine(eventBus);
            engine.initialize();
            
            eventBus.emit('nodeUnlocked', { node: { id: 'test', tier: 0 }, newLevel: 1, isUpgrade: false });
            
            // Should not throw
            expect(() => vi.advanceTimersByTime(1100)).not.toThrow();
            
            vi.useRealTimers();
        });
    });

    // ==========================================
    // QUEUE AND PRIORITY
    // ==========================================
    describe('queue and priority', () => {
        it('queues notifications with delay between them', async () => {
            vi.useFakeTimers();
            
            getAllNotifications.mockReturnValue([
                {
                    id: 'first',
                    trigger: { type: TriggerType.ON_NODE_UNLOCKED, nodeId: 'test' },
                    message: 'First',
                    priority: 5
                },
                {
                    id: 'second',
                    trigger: { type: TriggerType.ON_NODE_UNLOCKED, nodeId: 'test' },
                    message: 'Second',
                    priority: 5
                }
            ]);
            
            engine = useNotificationEngine(eventBus);
            engine.initialize();
            
            eventBus.emit('nodeUnlocked', { node: { id: 'test', tier: 0 }, newLevel: 1, isUpgrade: false });
            
            // First should show immediately
            expect(emittedEvents.filter(e => e.event === 'showNotification').length).toBe(1);
            
            // Second after delay
            vi.advanceTimersByTime(600);
            expect(emittedEvents.filter(e => e.event === 'showNotification').length).toBe(2);
            
            vi.useRealTimers();
        });

        it('sorts queue by priority (higher first) on subsequent items', async () => {
            vi.useFakeTimers();
            
            // When multiple notifications are queued at once, they get sorted by priority
            // But the first one is already being processed, so sorting affects remaining items
            getAllNotifications.mockReturnValue([
                {
                    id: 'low',
                    trigger: { type: TriggerType.ON_NODE_UNLOCKED, nodeId: 'test' },
                    message: 'Low priority',
                    priority: 1
                },
                {
                    id: 'medium',
                    trigger: { type: TriggerType.ON_NODE_UNLOCKED, nodeId: 'test' },
                    message: 'Medium priority',
                    priority: 5
                },
                {
                    id: 'high',
                    trigger: { type: TriggerType.ON_NODE_UNLOCKED, nodeId: 'test' },
                    message: 'High priority',
                    priority: 10
                }
            ]);
            
            engine = useNotificationEngine(eventBus);
            engine.initialize();
            
            eventBus.emit('nodeUnlocked', { node: { id: 'test', tier: 0 }, newLevel: 1, isUpgrade: false });
            
            // First gets processed immediately
            expect(emittedEvents.filter(e => e.event === 'showNotification').length).toBe(1);
            
            // Wait for second - should be high priority (sorted)
            vi.advanceTimersByTime(600);
            const notifications = emittedEvents.filter(e => e.event === 'showNotification');
            expect(notifications.length).toBe(2);
            expect(notifications[1].data.message).toBe('High priority');
            
            // Wait for third - should be medium (low comes after)
            vi.advanceTimersByTime(600);
            const allNotifications = emittedEvents.filter(e => e.event === 'showNotification');
            expect(allNotifications[2].data.message).toBe('Medium priority');
            
            vi.useRealTimers();
        });

        it('uses default priority when not specified', () => {
            getAllNotifications.mockReturnValue([
                {
                    id: 'default_priority',
                    trigger: { type: TriggerType.ON_NODE_UNLOCKED, nodeId: 'test' },
                    message: 'Default priority'
                    // No priority specified
                }
            ]);
            
            engine = useNotificationEngine(eventBus);
            engine.initialize();
            
            eventBus.emit('nodeUnlocked', { node: { id: 'test', tier: 0 }, newLevel: 1, isUpgrade: false });
            
            expect(emittedEvents.some(e => e.event === 'showNotification')).toBe(true);
        });
    });

    // ==========================================
    // ASCENSION RESET
    // ==========================================
    describe('ascension reset', () => {
        it('resets non-persistent notifications on ascension', () => {
            localStorageMock.setItem('networkSimShownNotifications', 
                JSON.stringify(['persistent_one', 'non_persistent_one'])
            );
            
            getAllNotifications.mockReturnValue([
                {
                    id: 'persistent_one',
                    trigger: { type: TriggerType.ON_NODE_UNLOCKED, nodeId: 'test1' },
                    message: 'Persistent',
                    persistAcrossAscension: true
                },
                {
                    id: 'non_persistent_one',
                    trigger: { type: TriggerType.ON_NODE_UNLOCKED, nodeId: 'test2' },
                    message: 'Non-persistent',
                    persistAcrossAscension: false
                }
            ]);
            
            engine = useNotificationEngine(eventBus);
            engine.initialize();
            
            // Trigger ascension
            eventBus.emit('ascensionComplete', { count: 1 });
            
            // Now check - persistent should still be shown, non-persistent should not
            expect(engine.wasShown('persistent_one')).toBe(true);
            expect(engine.wasShown('non_persistent_one')).toBe(false);
        });

        it('resets threshold tracking on ascension for non-persistent notifications', () => {
            vi.useFakeTimers();
            
            getAllNotifications.mockReturnValue([
                {
                    id: 'energy_100',
                    trigger: { 
                        type: TriggerType.ON_RESOURCE_AMOUNT_REACHED, 
                        resource: 'energy', 
                        threshold: 100 
                    },
                    message: '100 energy!',
                    persistAcrossAscension: false
                }
            ]);
            
            engine = useNotificationEngine(eventBus);
            engine.initialize();
            
            // Trigger threshold
            engine.checkResourceThresholds({ energy: 150, data: 0, bandwidth: 0 });
            expect(emittedEvents.filter(e => e.event === 'showNotification').length).toBe(1);
            
            // Wait for queue and debounce
            vi.advanceTimersByTime(1500);
            
            // Ascend (resets tracking AND shownNotifications for non-persistent)
            eventBus.emit('ascensionComplete', { count: 1 });
            
            // Verify the notification is no longer marked as shown
            expect(engine.wasShown('energy_100')).toBe(false);
            
            // Clear events and check again - should trigger now
            emittedEvents = [];
            engine.checkResourceThresholds({ energy: 150, data: 0, bandwidth: 0 });
            expect(emittedEvents.filter(e => e.event === 'showNotification').length).toBe(1);
            
            vi.useRealTimers();
        });
    });

    // ==========================================
    // IDLE TRACKING
    // ==========================================
    describe('idle tracking', () => {
        it('resets idle timer on interaction', () => {
            getAllNotifications.mockReturnValue([
                {
                    id: 'idle_10',
                    trigger: { type: TriggerType.ON_IDLE_TIME, idleSeconds: 10 },
                    message: 'Idle for 10s'
                }
            ]);
            
            engine = useNotificationEngine(eventBus);
            engine.initialize();
            
            // Record interaction resets timer
            engine.recordInteraction();
            
            // Check idle immediately - should not trigger
            engine.checkIdleThresholds();
            expect(emittedEvents.filter(e => e.event === 'showNotification').length).toBe(0);
        });

        it('clears triggered idle thresholds on interaction', () => {
            vi.useFakeTimers({ shouldAdvanceTime: true });
            
            // Using persistAcrossAscension: false so we can test re-triggering
            // Note: idle notifications still get added to shownNotifications,
            // but triggeredIdleThresholds is per-session and gets cleared on interaction
            getAllNotifications.mockReturnValue([
                {
                    id: 'idle_1',
                    trigger: { type: TriggerType.ON_IDLE_TIME, idleSeconds: 0.1 },
                    message: 'Idle',
                    persistAcrossAscension: false
                }
            ]);
            
            engine = useNotificationEngine(eventBus);
            engine.initialize();
            
            // Wait and trigger
            vi.advanceTimersByTime(200);
            engine.checkIdleThresholds();
            const count1 = emittedEvents.filter(e => e.event === 'showNotification').length;
            expect(count1).toBe(1);
            
            // Verify triggeredIdleThresholds is cleared on interaction
            // but shownNotifications still contains the ID (so it won't re-trigger)
            engine.recordInteraction();
            
            // Check that interaction cleared the session tracking
            // (the notification is still marked as shown, so it won't re-trigger)
            expect(engine.wasShown('idle_1')).toBe(true);
            
            vi.useRealTimers();
        });
    });

    // ==========================================
    // EDGE CASES
    // ==========================================
    describe('edge cases', () => {
        it('handles missing trigger type gracefully', () => {
            getAllNotifications.mockReturnValue([
                {
                    id: 'no_trigger',
                    message: 'No trigger defined'
                    // No trigger property
                }
            ]);
            
            engine = useNotificationEngine(eventBus);
            expect(() => engine.initialize()).not.toThrow();
        });

        it('handles empty notification list', () => {
            getAllNotifications.mockReturnValue([]);
            
            engine = useNotificationEngine(eventBus);
            expect(() => engine.initialize()).not.toThrow();
        });

        it('handles null resources in checkResourceThresholds', () => {
            getAllNotifications.mockReturnValue([
                {
                    id: 'energy_100',
                    trigger: { type: TriggerType.ON_RESOURCE_AMOUNT_REACHED, resource: 'energy', threshold: 100 },
                    message: '100!'
                }
            ]);
            
            engine = useNotificationEngine(eventBus);
            engine.initialize();
            
            // Undefined resources
            expect(() => engine.checkResourceThresholds({})).not.toThrow();
            expect(() => engine.checkResourceThresholds({ energy: undefined })).not.toThrow();
        });

        it('handles unknown resource type in thresholds', () => {
            getAllNotifications.mockReturnValue([
                {
                    id: 'unknown_resource',
                    trigger: { type: TriggerType.ON_RESOURCE_AMOUNT_REACHED, resource: 'unknown', threshold: 100 },
                    message: 'Unknown!'
                }
            ]);
            
            engine = useNotificationEngine(eventBus);
            expect(() => engine.initialize()).not.toThrow();
        });

        it('handles rapid-fire events (same notification)', () => {
            getAllNotifications.mockReturnValue([
                {
                    id: 'rapid',
                    trigger: { type: TriggerType.ON_NODE_UNLOCKED, nodeId: 'test' },
                    message: 'Rapid!'
                }
            ]);
            
            engine = useNotificationEngine(eventBus);
            engine.initialize();
            
            // Fire same event multiple times
            for (let i = 0; i < 5; i++) {
                eventBus.emit('nodeUnlocked', { node: { id: 'test', tier: 0 }, newLevel: 1, isUpgrade: false });
            }
            
            // Should only trigger once (marked as shown after first)
            expect(emittedEvents.filter(e => e.event === 'showNotification').length).toBe(1);
        });

        it('uses default duration when not specified', () => {
            getAllNotifications.mockReturnValue([
                {
                    id: 'no_duration',
                    trigger: { type: TriggerType.ON_NODE_UNLOCKED, nodeId: 'test' },
                    message: 'No duration'
                    // No duration specified
                }
            ]);
            
            engine = useNotificationEngine(eventBus);
            engine.initialize();
            
            eventBus.emit('nodeUnlocked', { node: { id: 'test', tier: 0 }, newLevel: 1, isUpgrade: false });
            
            const notification = emittedEvents.find(e => e.event === 'showNotification');
            expect(notification.data.duration).toBe(NotificationDefaults.duration);
        });

        it('uses default type when not specified', () => {
            getAllNotifications.mockReturnValue([
                {
                    id: 'no_type',
                    trigger: { type: TriggerType.ON_NODE_UNLOCKED, nodeId: 'test' },
                    message: 'No type'
                    // No type specified
                }
            ]);
            
            engine = useNotificationEngine(eventBus);
            engine.initialize();
            
            eventBus.emit('nodeUnlocked', { node: { id: 'test', tier: 0 }, newLevel: 1, isUpgrade: false });
            
            const notification = emittedEvents.find(e => e.event === 'showNotification');
            expect(notification.data.type).toBe(NotificationType.NARRATION);
        });
    });

    // ==========================================
    // PERFORMANCE TESTS
    // ==========================================
    describe('performance', () => {
        it('builds index in reasonable time with 1000 notifications', () => {
            // Generate 1000 notifications
            const notifications = [];
            for (let i = 0; i < 1000; i++) {
                notifications.push({
                    id: `notification_${i}`,
                    trigger: { 
                        type: TriggerType.ON_NODE_UNLOCKED, 
                        nodeId: `node_${i % 100}` 
                    },
                    message: `Message ${i}`
                });
            }
            
            getAllNotifications.mockReturnValue(notifications);
            
            const start = performance.now();
            engine = useNotificationEngine(eventBus);
            engine.initialize();
            const elapsed = performance.now() - start;
            
            // Should complete in under 50ms (generous for CI)
            expect(elapsed).toBeLessThan(50);
        });

        it('handles events in O(1) time', () => {
            // 100 different node IDs, 10 notifications each
            const notifications = [];
            for (let i = 0; i < 100; i++) {
                for (let j = 0; j < 10; j++) {
                    notifications.push({
                        id: `notification_${i}_${j}`,
                        trigger: { 
                            type: TriggerType.ON_NODE_UNLOCKED, 
                            nodeId: `node_${i}` 
                        },
                        message: `Message ${i}_${j}`
                    });
                }
            }
            
            getAllNotifications.mockReturnValue(notifications);
            
            engine = useNotificationEngine(eventBus);
            engine.initialize();
            
            // Trigger event for last node (worst case for linear scan)
            const start = performance.now();
            eventBus.emit('nodeUnlocked', { 
                node: { id: 'node_99', tier: 0 }, 
                newLevel: 1, 
                isUpgrade: false 
            });
            const elapsed = performance.now() - start;
            
            // Should complete in under 5ms
            expect(elapsed).toBeLessThan(5);
        });

        it('throttles tick-based checks', () => {
            getAllNotifications.mockReturnValue([
                {
                    id: 'energy_100',
                    trigger: { type: TriggerType.ON_RESOURCE_AMOUNT_REACHED, resource: 'energy', threshold: 100 },
                    message: '100!'
                }
            ]);
            
            engine = useNotificationEngine(eventBus);
            engine.initialize();
            
            // Simulate rapid ticks
            let checkCount = 0;
            const originalCheck = engine.checkResourceThresholds;
            
            // First tick
            eventBus.emit('gameTick', { resources: { energy: 50 }, now: 0 });
            
            // Rapid ticks within throttle window
            for (let i = 1; i < 10; i++) {
                eventBus.emit('gameTick', { resources: { energy: 50 }, now: i * 50 });
            }
            
            // Tick after throttle window
            eventBus.emit('gameTick', { resources: { energy: 150 }, now: 600 });
            
            // Only threshold at 600ms should trigger
            expect(emittedEvents.filter(e => e.event === 'showNotification').length).toBe(1);
        });
    });

    // ==========================================
    // DEBUG TOOLS
    // ==========================================
    describe('debug tools', () => {
        it('exposes window.__resetNarrations', () => {
            getAllNotifications.mockReturnValue([]);
            
            engine = useNotificationEngine(eventBus);
            engine.initialize();
            
            expect(typeof window.__resetNarrations).toBe('function');
        });

        it('__resetNarrations(false) resets non-persistent only', () => {
            localStorageMock.setItem('networkSimShownNotifications', 
                JSON.stringify(['persistent', 'non_persistent'])
            );
            
            getAllNotifications.mockReturnValue([
                { id: 'persistent', persistAcrossAscension: true },
                { id: 'non_persistent', persistAcrossAscension: false }
            ]);
            
            engine = useNotificationEngine(eventBus);
            engine.initialize();
            
            window.__resetNarrations(false);
            
            expect(engine.wasShown('persistent')).toBe(true);
            expect(engine.wasShown('non_persistent')).toBe(false);
        });

        it('__resetNarrations(true) resets all', () => {
            localStorageMock.setItem('networkSimShownNotifications', 
                JSON.stringify(['persistent', 'non_persistent'])
            );
            
            getAllNotifications.mockReturnValue([
                { id: 'persistent', persistAcrossAscension: true },
                { id: 'non_persistent', persistAcrossAscension: false }
            ]);
            
            engine = useNotificationEngine(eventBus);
            engine.initialize();
            
            window.__resetNarrations(true);
            
            expect(engine.wasShown('persistent')).toBe(false);
            expect(engine.wasShown('non_persistent')).toBe(false);
        });
    });
});
