import Optimizely from '@optimizely/optimizely-sdk';
// Development mode:
// import OptimizelyPendingEventsPlugin from '../../lib';
// Production mode
import OptimizelyPendingEventsPlugin from '@optimizely/sdk-plugin-pending-events';

const dispatchLogger = (message) => {
  console.warn('Message from eventDispatcher: ' + message);
};

const optimizelyLogger = {
  log: console.log
};

fetch('https://cdn.optimizely.com/public/81391212/s/10660680194_10660680194.json')
  .then((resp) => resp.json())
  .then((datafile) => {
    // TODO: store in cookie
    const userId = 'optimizelyRandomUser' + Math.random();
    const optimizely = Optimizely.createInstance({
      datafile: datafile,
      logger: optimizelyLogger,
      eventDispatcher: OptimizelyPendingEventsPlugin('optimizelyPendingEvents', dispatchLogger)
    });

    const trackAndReload = (ev) => {
      optimizely.track('customEvent', userId);
      window.location.reload();
      ev.preventDefault();
    };

    const trackButton = document.getElementById('track');
    trackButton.innerText = 'Track and Reload!';
    document.getElementById('track').addEventListener('click', trackAndReload);
  });
