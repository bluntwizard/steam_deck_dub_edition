/**
 * EventEmitter utility for components to emit and listen to events
 */
class EventEmitter {
  /**
   * Creates a new EventEmitter
   * @param {Object} options - The event emitter options
   * @param {HTMLElement} [options.target=document] - The target element to attach events to
   * @param {boolean} [options.debug=false] - Enable debug logging for events
   */
  constructor(options = {}) {
    this.target = options.target || document;
    this.debug = options.debug || false;
    this.eventListeners = new Map();
  }

  /**
   * Emit an event with optional detail data
   * @param {string} eventName - Name of the event to emit
   * @param {any} detail - Optional data to include with the event
   * @returns {boolean} Whether the event was handled by at least one listener
   */
  emit(eventName, detail) {
    if (this.debug) {
      console.log(`Emitting event: ${eventName}`, detail);
    }

    const event = new CustomEvent(eventName, {
      bubbles: true,
      cancelable: true,
      detail
    });

    return this.target.dispatchEvent(event);
  }

  /**
   * Add an event listener
   * @param {string} eventName - Name of the event to listen for
   * @param {Function} listener - Callback function to execute when the event is fired
   * @param {Object} [options] - Additional event listener options
   */
  on(eventName, listener, options) {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, new Set());
    }

    const boundListener = (event) => {
      listener(event);
    };

    this.eventListeners.get(eventName).add({
      originalListener: listener,
      boundListener
    });

    this.target.addEventListener(eventName, boundListener, options);

    if (this.debug) {
      console.log(`Added listener for event: ${eventName}`);
    }

    return this;
  }

  /**
   * Remove an event listener
   * @param {string} eventName - Name of the event to remove listener for
   * @param {Function} listener - The original callback function to remove
   */
  off(eventName, listener) {
    if (!this.eventListeners.has(eventName)) {
      return this;
    }

    const listeners = this.eventListeners.get(eventName);
    for (const item of listeners) {
      if (item.originalListener === listener) {
        this.target.removeEventListener(eventName, item.boundListener);
        listeners.delete(item);
        
        if (this.debug) {
          console.log(`Removed listener for event: ${eventName}`);
        }
        
        break;
      }
    }

    if (listeners.size === 0) {
      this.eventListeners.delete(eventName);
    }

    return this;
  }

  /**
   * Add an event listener that will be called only once
   * @param {string} eventName - Name of the event to listen for
   * @param {Function} listener - Callback function to execute when the event is fired
   * @param {Object} [options] - Additional event listener options
   */
  once(eventName, listener, options) {
    const onceListener = (event) => {
      this.off(eventName, onceListener);
      listener(event);
    };

    return this.on(eventName, onceListener, options);
  }

  /**
   * Remove all event listeners
   * @param {string} [eventName] - Optional event name to remove all listeners for
   */
  removeAllListeners(eventName) {
    if (eventName) {
      if (this.eventListeners.has(eventName)) {
        const listeners = this.eventListeners.get(eventName);
        for (const item of listeners) {
          this.target.removeEventListener(eventName, item.boundListener);
        }
        this.eventListeners.delete(eventName);
        
        if (this.debug) {
          console.log(`Removed all listeners for event: ${eventName}`);
        }
      }
    } else {
      for (const [name, listeners] of this.eventListeners.entries()) {
        for (const item of listeners) {
          this.target.removeEventListener(name, item.boundListener);
        }
      }
      this.eventListeners.clear();
      
      if (this.debug) {
        console.log('Removed all event listeners');
      }
    }

    return this;
  }

  /**
   * Get the number of listeners for an event
   * @param {string} eventName - Name of the event to get listener count for
   * @returns {number} The number of listeners for the event
   */
  listenerCount(eventName) {
    if (!this.eventListeners.has(eventName)) {
      return 0;
    }

    return this.eventListeners.get(eventName).size;
  }
}

export default EventEmitter; 