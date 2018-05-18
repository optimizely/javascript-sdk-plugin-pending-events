# @optimizely/sdk-plugin-pending-events

[![BrowserStack Status](https://www.browserstack.com/automate/badge.svg?badge_key=VFFWdTVVODZyelR1eEFoMTV1ekY3UjFpSTVQemQwcU50RXJLMjk3dEhsUT0tLXBtdUNkNWR3VVdYYmJrSnZBc2dBNmc9PQ==--870d019874abb415a289e1bb630ccdc9eb07c909)](https://www.browserstack.com/automate/public-build/VFFWdTVVODZyelR1eEFoMTV1ekY3UjFpSTVQemQwcU50RXJLMjk3dEhsUT0tLXBtdUNkNWR3VVdYYmJrSnZBc2dBNmc9PQ==--870d019874abb415a289e1bb630ccdc9eb07c909)

An **unsupported, experimental⚠️** [`EventDispatcher`](https://developers.optimizely.com/x/solutions/sdks/reference/index.html?language=javascript#event-dispatcher) for Optimizely Full Stack ([`javascript-sdk`](https://github.com/optimizely/javascript-sdk), Web browser environment) that keeps a queue of pending (not completed) events and persist to `localStorage`, and retries pending events on initialization.

## Motivation

Tracking click in browsers is difficult because browsers often redirect users before tracking requests complete. This example suggests one of many possible solutions to the above problem. Feel free to try it out, modify according the the LICENSE, and suggest changes here. And if you have another method for tackling this problem, we'd love to hear from you! Drop us a line at developers@optimizely.com.

## Install

```sh
npm install @optimizely/sdk-plugin-pending-events
```

## Usage

See [`example`](./example) for an example of how this is used:

```sh
$ cd example
$ npm install
$ npm start
```

Load index.html in browser of your choice.

### API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### index

Construct an EventDispatcher compatible with [`@optimizely/optimizely-sdk`](https://www.npmjs.com/package/@optimizely/optimizely-sdk)

**Parameters**

-   `localStorageKey` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Key under which to persist/load pending events in `window.localStorage`
-   `sendJSON` **[SendJSON](#sendjson)** Function to call to send payload
-   `logger` **[Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)?** 

Returns **EventDispatcher** An object with a dispatchEvent method, suitable for use as an EventDispatcher

#### SendJSON

Function to call to send JSON

Type: [Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)

**Parameters**

-   `url` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** URL to send to
-   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
    -   `options.method` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** HTTP method to use
    -   `options.body` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Body text (should be stringified JSON)
-   `callback` **[SendJSONCallback](#sendjsoncallback)** Function to call, with no arguments, if successful, and with Error object, if error

**Examples**

```javascript
// Example sendJSON built using fetch
const sendJSON = (url, options, callback) => {
  const {method, body} = options;
  return fetch(url, {
    method,
    body,
    headers: {
      'content-type': 'application/json',
    }
  })
  .then((resp) => {
    if (resp.status < 400) {
      callback();
    } else {
      callback(new Error(`Bad response code: ${resp.status}`));
    }
  }, callback);
}
```

#### SendJSONCallback

Type: [Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)

**Parameters**

-   `error` **[Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)?** Error, if any
