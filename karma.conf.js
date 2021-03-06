// Karma configuration
// Generated on Fri Aug 11 2017 12:27:37 GMT+0100 (BST)
var istanbul = require('browserify-istanbul');
module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['browserify', 'jasmine'],

    files: [
      'app/components/app.js',
      'app/**/*.spec.js'
    ],

    exclude: [
    ],

    preprocessors: {
      'app/components/app.js' : ['browserify'],
      'app/**/*.spec.js': ['browserify']
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage'],

    browserify: {
      debug: true,
      paths: ['./app/components/', './app/shared/'],
      transform: [
        istanbul({
          ignore: ['**/node_modules/**']
        })
      ]
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_DEBUG,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
