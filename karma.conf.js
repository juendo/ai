// Karma configuration
// Generated on Sun May 15 2016 21:21:39 GMT+0100 (BST)

module.exports = function(config) {
  config.set({

    plugins: [
        'karma-chrome-launcher',
        'karma-jasmine'
    ],

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
        'public/bower_components/jquery/dist/jquery.js',
        'public/bower_components/angular/angular.js',
        'public/bower_components/angular-route/angular-route.js',
        'public/bower_components/angular-socket-io/socket.js',
        'public/bower_components/ngDraggable/ngDraggable.js',
        'node_modules/angular-mocks/angular-mocks.js',
        'public/js/socket.js',
        'public/js/actions.js',
        'public/js/gameController.js',
        'public/js/directives.js',
        'tests/*.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
        'public/js/actions.js': 'coverage'
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


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    reporters = ['coverage']
  })
}
