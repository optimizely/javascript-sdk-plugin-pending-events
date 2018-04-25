class PendingEvents {
  constructor(localStorageKey, events) {
    this.localStorageKey = localStorageKey;
    // Re-index events to remove gaps
    this.length = 0;
    this.events = Object.values(events).reduce((res, event) => {
      res[this.length++] = event;
      return res;
    }, {});
  }

  persist() {
    window.localStorage.setItem(this.localStorageKey, JSON.stringify(this.events));
  }

  enqueue(event) {
    this.events[this.length++] = event;
    return this.length;
  }

  dequeue(index) {
    delete this.events[index];
  }
}

// TODO: use a cross-browser alternative to fetch
const sendEvent = (event) => fetch(event.url, {
  method: event.httpVerb,
  body: JSON.stringify(event.params),
  headers: {
    'content-type': 'application/json',
  },
});

/**
 * Construct an [`EventDispatcher`](https://developers.optimizely.com/x/solutions/sdks/reference/index.html?language=javascript#event-dispatcher)
 * compatible with @optimizely/optimizely-sdk
 *
 * @param {String} localStorageKey Key under which to persist/load pending events in `window.localStorage`
 */
export default (localStorageKey) => {
  let currentEvents = {};
  const persistedEvents = window.localStorage.getItem(localStorageKey);
  if (persistedEvents) {
    try {
      currentEvents = JSON.parse(persistedEvents);
    } catch (e) {
      // suppress errors loading from JSON
    }
  }

  const pendingEvents = new PendingEvents(localStorageKey, currentEvents);

  return {
    dispatchEvent: (event) => {
      const idx = pendingEvents.enqueue(event);
      sendEvent(event).then(() => {
        pendingEvents.dequeue(idx);
      });
    }
  };
}
