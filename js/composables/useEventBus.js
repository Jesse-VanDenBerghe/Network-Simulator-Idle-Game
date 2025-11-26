// useEventBus Composable
// =======================
// Simple pub/sub event bus for inter-composable communication
// Decouples composables from direct dependencies

const { ref } = Vue;

export function useEventBus() {
    const events = new Map();

    /**
     * Subscribe to an event
     * @param {string} eventName - Event identifier
     * @param {Function} callback - Handler function
     * @returns {Function} Unsubscribe function
     */
    function on(eventName, callback) {
        if (!events.has(eventName)) {
            events.set(eventName, []);
        }
        events.get(eventName).push(callback);
        
        // Return unsubscribe function
        return () => {
            const handlers = events.get(eventName);
            const index = handlers.indexOf(callback);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        };
    }

    /**
     * Emit an event
     * @param {string} eventName - Event identifier
     * @param {*} data - Event payload
     */
    function emit(eventName, data) {
        if (!events.has(eventName)) return;
        events.get(eventName).forEach(callback => {
            try {
                callback(data);
            } catch (e) {
                console.error(`Error in event handler for '${eventName}':`, e);
            }
        });
    }

    /**
     * Subscribe to event, auto-unsubscribe after first call
     * @param {string} eventName - Event identifier
     * @param {Function} callback - Handler function
     */
    function once(eventName, callback) {
        const unsubscribe = on(eventName, (data) => {
            callback(data);
            unsubscribe();
        });
        return unsubscribe;
    }

    /**
     * Remove all listeners for an event or all events
     * @param {string} [eventName] - Optional event to clear
     */
    function off(eventName) {
        if (!eventName) {
            events.clear();
        } else {
            events.delete(eventName);
        }
    }

    return { on, emit, once, off };
}
