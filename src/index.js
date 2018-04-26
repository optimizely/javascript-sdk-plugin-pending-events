class PendingEvents {
  constructor(localStorageKey, events, logger) {
    this.localStorageKey = localStorageKey;
    this.logger = logger;

    this.length = 0;
    this.events = {};
    Object.values(events).forEach((event) => this.enqueue(event));
    this.persist();
  }

  persist() {
    // TODO: delete key if empty
    try {
      window.localStorage.setItem(this.localStorageKey, JSON.stringify(this.events));
    } catch(e) {
      this.logger(e);
    }
  }

  enqueue(event) {
    const idx = this.length++;
    this.logger('Enqueuing event at index: ' + idx);
    this.events[idx] = event;

    // TODO: add support for inline retry?

    this.sendEvent(event)
      .then(() => {
        this.dequeue(idx);
        this.persist();
        this.logger('Successfully sent event with index: ' + idx);
      })
      // Suppress errors; it'll be retried on next page load
      .catch((e) => {
        this.logger(e);
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
 * Construct an EventDispatcher compatible with @optimizely/optimizely-sdk
 *
 * @param {String} localStorageKey Key under which to persist/load pending events in `window.localStorage`
 * @param {Function=} logger
 * @return {EventDispatcher} An object with a dispatchEvent method, suitable for use as an EventDispatcher
 */
export default (localStorageKey, logger) => {
  logger = logger || (() => {});
  let currentEvents = {};
  try {
    const persistedEvents = window.localStorage.getItem(localStorageKey);
    if (persistedEvents) {
      currentEvents = JSON.parse(persistedEvents);
    }
  } catch (e) {
    logger(e);
  }

  const pendingEvents = new PendingEvents(localStorageKey, currentEvents, logger);

  return {
    dispatchEvent: (event) => {
      logger('Enqueuing event');
      pendingEvents.enqueue(event);
      pendingEvents.persist();
    }
  };
}
