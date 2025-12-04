// useEventBus Composable
// =======================
// Simple pub/sub event bus for inter-composable communication
// Decouples composables from direct dependencies

import type { EventMap, EventHandler } from '@network-simulator/shared/types/event';

/**
 * Type-safe event bus for pub/sub communication between composables
 */
export function useEventBus() {
    const events = new Map<keyof EventMap, Array<EventHandler<any>>>();

    /**
     * Subscribe to an event
     * @param eventName - Event identifier
     * @param callback - Handler function
     * @returns Unsubscribe function
     */
    function on<K extends keyof EventMap>(
        eventName: K,
        callback: EventHandler<K>
    ): () => void {
        if (!events.has(eventName)) {
            events.set(eventName, []);
        }
        events.get(eventName)!.push(callback);
        
        // Return unsubscribe function
        return () => {
            const handlers = events.get(eventName);
            if (handlers) {
                const index = handlers.indexOf(callback);
                if (index > -1) {
                    handlers.splice(index, 1);
                }
            }
        };
    }

    /**
     * Emit an event
     * @param eventName - Event identifier
     * @param data - Event payload
     */
    function emit<K extends keyof EventMap>(
        eventName: K,
        data: EventMap[K]
    ): void {
        if (!events.has(eventName)) return;
        events.get(eventName)!.forEach((callback) => {
            try {
                callback(data);
            } catch (e) {
                console.error(`Error in event handler for '${eventName}':`, e);
            }
        });
    }

    /**
     * Subscribe to event, auto-unsubscribe after first call
     * @param eventName - Event identifier
     * @param callback - Handler function
     */
    function once<K extends keyof EventMap>(
        eventName: K,
        callback: EventHandler<K>
    ): () => void {
        const unsubscribe = on(eventName, (data) => {
            callback(data);
            unsubscribe();
        });
        return unsubscribe;
    }

    /**
     * Remove all listeners for an event or all events
     * @param eventName - Optional event to clear
     */
    function off(eventName?: keyof EventMap): void {
        if (!eventName) {
            events.clear();
        } else {
            events.delete(eventName);
        }
    }

    return { on, emit, once, off };
}
