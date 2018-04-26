var Optimizely = require('@optimizely/optimizely-sdk');
// Development mode:
var OptimizelyPendingEventsPlugin = require('../../lib').default;
// Production mode
// var OptimizelyPendingEventsPlugin = require('@optimizely/sdk-plugin-pending-events').default;

var dispatchLogger = function(message) {
  console.warn('Message from eventDispatcher: ' + message);
};

var optimizelyLogger = {
  log: console.log
};

fetch('https://cdn.optimizely.com/public/81391212/s/10660680194_10660680194.json')
  .then(function(resp) {
    return resp.json();
  })
  .then(function(datafile) {
    var userId = 'optimizelyRandomUser' + Math.random();
    var optimizely = Optimizely.createInstance({
      datafile: datafile,
      logger: optimizelyLogger,
      eventDispatcher: OptimizelyPendingEventsPlugin('optimizelyPendingEvents', dispatchLogger)
    });

    var trackAndReload = function(ev) {
      optimizely.track('customEvent', userId);
      window.location.reload();
      ev.preventDefault();
    }

    var trackButton = document.getElementById('track');
    trackButton.innerText = 'Track and Reload!';
    document.getElementById('track').addEventListener('click', trackAndReload);
  });
