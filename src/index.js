class PendingEvents {
  constructor(localStorageKey, sendJSON, events, logger) {
    this.localStorageKey = localStorageKey;
    this.logger = logger;
    this.sendJSON = sendJSON;

    this.length = 0;
    this.events = {};
    for (let i in events) {
      this.enqueue(events[i]);
    }
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
    this.sendEvent(event, (err) => {
      if (err) {
        this.logger(err);
        return;
      }

      this.dequeue(idx);
      this.persist();
      this.logger('Successfully sent event with index: ' + idx);
    });
  }

  dequeue(index) {
    delete this.events[index];
  }

  sendEvent(event, callback) {
    this.sendJSON(event.url, {
      method: event.httpVerb,
      body: JSON.stringify(event.params),
    }, callback);
  }
}

/**
 * @callback SendJSONCallback
 * @param {Error=} error Error, if any
 */

/**
 * Function to call to send JSON
 *
 * @example
 * // Example sendJSON built using fetch
 * const sendJSON = (url, options, callback) => {
 *   const {method, body} = options;
 *   return fetch(url, {
 *     method,
 *     body,
 *     headers: {
 *       'content-type': 'application/json',
 *     }
 *   })
 *   .then((resp) => {
 *     if (resp.status < 400) {
 *       callback();
 *     } else {
 *       callback(new Error(`Bad response code: ${resp.status}`));
 *     }
 *   }, callback);
 * }
 *
 * @callback SendJSON
 * @param {String} url URL to send to
 * @param {Object} options
 * @param {String} options.method HTTP method to use
 * @param {String} options.body Body text (should be stringified JSON)
 * @param {SendJSONCallback} callback Function to call, with no arguments, if successful, and with Error object, if error
 */

/**
 * Construct an EventDispatcher compatible with @optimizely/optimizely-sdk
 *
 * @param {String} localStorageKey Key under which to persist/load pending events in `window.localStorage`
 * @param {SendJSON} sendJSON Function to call to send payload
 * @param {Function=} logger
 * @return {EventDispatcher} An object with a dispatchEvent method, suitable for use as an EventDispatcher
 */
export default (localStorageKey, sendJSON, logger) => {
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

  const pendingEvents = new PendingEvents(localStorageKey, sendJSON, currentEvents, logger);

  return {
    dispatchEvent: (event) => {
      logger('Enqueuing event');
      pendingEvents.enqueue(event);
      pendingEvents.persist();
    }
  };
}
