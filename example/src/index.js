import Optimizely from "@optimizely/optimizely-sdk";
// Development mode:
import OptimizelyPendingEventsPlugin from "../../lib";
// Production mode
// import OptimizelyPendingEventsPlugin from '@optimizely/sdk-plugin-pending-events';

const dispatchLogger = message => {
  console.warn("Message from eventDispatcher: " + message);
};

const dispatchFetcher = (url, options, callback) => {
  const { method, body } = options;
  return fetch(url, {
    method,
    body,
    headers: {
      "content-type": "application/json"
    }
  }).then(resp => {
    if (resp.status < 400) {
      callback();
    } else {
      callback(new Error(`Bad response code: ${resp.status}`));
    }
  }, callback);
};

const optimizelyLogger = {
  log: console.log
};

fetch(
  "https://cdn.optimizely.com/public/81391212/s/10660680194_10660680194.json"
)
  .then(resp => resp.json())
  .then(datafile => {
    // TODO: store in cookie
    const userId = "optimizelyRandomUser" + Math.random();
    const optimizely = Optimizely.createInstance({
      datafile: datafile,
      logger: optimizelyLogger,
      eventDispatcher: OptimizelyPendingEventsPlugin(
        "optimizelyPendingEvents",
        dispatchFetcher,
        dispatchLogger
      )
    });

    const trackAndReload = ev => {
      optimizely.track("customEvent", userId);
      window.location.reload();
      ev.preventDefault();
    };

    const trackButton = document.getElementById("track");
    trackButton.innerText = "Track and Reload!";
    document.getElementById("track").addEventListener("click", trackAndReload);
  });
