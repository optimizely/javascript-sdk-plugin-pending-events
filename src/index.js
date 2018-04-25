class PendingEvents {
  constructor(localStorageKey, events) {
    this.localStorageKey = localStorageKey;
    this.length = 0;
    this.events = {};
    Object.values(events).forEach((event) => this.enqueue(event));
    this.persist();
  }

  persist() {
    // TODO: delete key if empty
    window.localStorage.setItem(this.localStorageKey, JSON.stringify(this.events));
  }

  enqueue(event) {
    const idx = this.length++;
    this.events[idx] = event;

    return this.sendEvent(event)
      .then(() => {
        this.dequeue(idx);
        this.persist();
      });
  }

  dequeue(index) {
    delete this.events[index];
  }

  // TODO: use a cross-browser alternative to fetch
  sendEvent(event) {
    return fetch(event.url, {
      method: event.httpVerb,
      body: JSON.stringify(event.params),
      headers: {
        'content-type': 'application/json',
      },
    });
  }
}

/**
 * Construct an [`EventDispatcher`](https://developers.optimizely.com/x/solutions/sdks/reference/index.html?language=javascript#event-dispatcher)
 * compatible with @optimizely/optimizely-sdk
 *
 * @param {String} localStorageKey Key under which to persist/load pending events in `window.localStorage`
 */
export default (localStorageKey) => {
  let currentEvents = {};
  try {
    const persistedEvents = window.localStorage.getItem(localStorageKey);
    if (persistedEvents) {
      currentEvents = JSON.parse(persistedEvents);
    }
  } catch (e) {
    // Suppress errors loading from storage
  }

  const pendingEvents = new PendingEvents(localStorageKey, currentEvents);

  return {
    dispatchEvent: (event) => {
      pendingEvents.enqueue(event);
      pendingEvents.persist();
    }
  };
}
