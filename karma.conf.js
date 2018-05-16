// Karma configuration
// Generated on Thu Apr 26 2018 10:59:21 GMT-0700 (PDT)

// https://www.browserstack.com/automate/node#run-tests-on-desktop-mobile, plus a lot of trial and error
const browserstackLaunchers = {
  // Popular desktop browsers
  bs_chrome_win: {
    base: 'BrowserStack',
    browser: 'Chrome',
    os: 'Windows',
    os_version: '10',
  },
  bs_firefox_win: {
    base: 'BrowserStack',
    browser: 'Firefox',
    os: 'Windows',
    os_version: '10',
  },
  bs_edge: {
    base: 'BrowserStack',
    browser: 'Edge',
    os: 'Windows',
    os_version: '10',
  },
  bs_safari_mac: {
    base: 'BrowserStack',
    browser: 'Safari',
    browser_version: '11.1',
    os: 'OS X',
    os_version: 'High Sierra',
  },
  // Oldest supported desktop browser
  bs_ie_10: {
    base: 'BrowserStack',
    browser: 'ie',
    browser_version: '10',
    os: 'Windows',
    os_version: '7',
  },
  // Most modern iPhone available without "real devices" support
  bs_iphone: {
    base: 'BrowserStack',
    device: 'iPhone 6S',
    platform: 'MAC',
    // Despite what configurator suggests, os/os_version are not optional
    os: 'iOS',
    os_version: '9.1',
  },
  // Oldest supported iOS: 6.0
  bs_iphone5: {
    base: 'BrowserStack',
    device: 'iPhone 5',
    platform: 'MAC',
    // Despite what configurator suggests, os/os_version are not optional
    os: 'iOS',
    os_version: '6.0',
  },
  // Most modern Android available without "real devices" support (Android 4.4)
  bs_android: {
    base: 'BrowserStack',
    browser: 'android',
    platform: 'ANDROID',
    device: 'Samsung Galaxy S5 Mini',
    // Despite what configurator suggests, os/os_version are not optional
    os: 'android',
    os_version: '4.4',
  },
};

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha'],


    // list of files / patterns to load in the browser
    files: [
      {pattern: 'test/**/*.js', watched: false}
    ],


    // list of files / patterns to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'test/**/*.js': ['webpack']
    },

    webpack: {
      mode: 'development',
      devtool: 'inline-source-map',
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
              loader: 'babel-loader',
            },
          },
        ],
      },
    },

    client: {
      mocha: {
        reporter: 'html',
      },
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    browserStack: {
      project: 'javascript-sdk-plugin-pending-events',
      build: process.env.BUILD_NUMBER,
      username: process.env.BROWSERSTACK_USERNAME,
      accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
    },

    // define browserstack browsers
    customLaunchers: browserstackLaunchers,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: process.env.BROWSERSTACK_USERNAME ? Object.keys(browserstackLaunchers) : ['Chrome'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
