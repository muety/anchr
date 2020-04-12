// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html
// Generated on 2015-11-19 using
// generator-karma 1.0.0

module.exports = function(config) {
    'use strict';

    config.set({
        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // base path, that will be used to resolve files and exclude
        basePath: '../',

        // testing framework to use (jasmine/mocha/qunit/...)
        // as well as any additional frameworks (requirejs/chai/sinon/...)
        frameworks: [
            "jasmine"
        ],

        // list of files / patterns to load in the browser
        files: [
            // bower:js
            'bower_components/angular/angular.js',
            'bower_components/jquery/dist/jquery.js',
            'bower_components/bootstrap/dist/js/bootstrap.js',
            'bower_components/angular-cookies/angular-cookies.js',
            'bower_components/angular-resource/angular-resource.js',
            'bower_components/angular-route/angular-route.js',
            'bower_components/bootstrap-material-design/dist/js/material.js',
            'bower_components/bootstrap-material-design/dist/js/ripples.js',
            'bower_components/clipboard/dist/clipboard.js',
            'bower_components/ngclipboard/dist/ngclipboard.js',
            'bower_components/ng-file-upload/ng-file-upload.js',
            'bower_components/angular-jwt/dist/angular-jwt.js',
            'bower_components/cryptojslib/components/aes-min.js',
            'bower_components/cryptojslib/components/aes.js',
            'bower_components/cryptojslib/components/cipher-core-min.js',
            'bower_components/cryptojslib/components/cipher-core.js',
            'bower_components/cryptojslib/components/core-min.js',
            'bower_components/cryptojslib/components/core.js',
            'bower_components/cryptojslib/components/enc-base64-min.js',
            'bower_components/cryptojslib/components/enc-base64.js',
            'bower_components/cryptojslib/components/enc-utf16-min.js',
            'bower_components/cryptojslib/components/enc-utf16.js',
            'bower_components/cryptojslib/components/evpkdf-min.js',
            'bower_components/cryptojslib/components/evpkdf.js',
            'bower_components/cryptojslib/components/format-hex-min.js',
            'bower_components/cryptojslib/components/format-hex.js',
            'bower_components/cryptojslib/components/hmac-min.js',
            'bower_components/cryptojslib/components/hmac.js',
            'bower_components/cryptojslib/components/lib-typedarrays-min.js',
            'bower_components/cryptojslib/components/lib-typedarrays.js',
            'bower_components/cryptojslib/components/md5-min.js',
            'bower_components/cryptojslib/components/md5.js',
            'bower_components/cryptojslib/components/mode-cfb-min.js',
            'bower_components/cryptojslib/components/mode-cfb.js',
            'bower_components/cryptojslib/components/mode-ctr-gladman-min.js',
            'bower_components/cryptojslib/components/mode-ctr-gladman.js',
            'bower_components/cryptojslib/components/mode-ctr-min.js',
            'bower_components/cryptojslib/components/mode-ctr.js',
            'bower_components/cryptojslib/components/mode-ecb-min.js',
            'bower_components/cryptojslib/components/mode-ecb.js',
            'bower_components/cryptojslib/components/mode-ofb-min.js',
            'bower_components/cryptojslib/components/mode-ofb.js',
            'bower_components/cryptojslib/components/pad-ansix923-min.js',
            'bower_components/cryptojslib/components/pad-ansix923.js',
            'bower_components/cryptojslib/components/pad-iso10126-min.js',
            'bower_components/cryptojslib/components/pad-iso10126.js',
            'bower_components/cryptojslib/components/pad-iso97971-min.js',
            'bower_components/cryptojslib/components/pad-iso97971.js',
            'bower_components/cryptojslib/components/pad-nopadding-min.js',
            'bower_components/cryptojslib/components/pad-nopadding.js',
            'bower_components/cryptojslib/components/pad-zeropadding-min.js',
            'bower_components/cryptojslib/components/pad-zeropadding.js',
            'bower_components/cryptojslib/components/pbkdf2-min.js',
            'bower_components/cryptojslib/components/pbkdf2.js',
            'bower_components/cryptojslib/components/rabbit-legacy-min.js',
            'bower_components/cryptojslib/components/rabbit-legacy.js',
            'bower_components/cryptojslib/components/rabbit-min.js',
            'bower_components/cryptojslib/components/rabbit.js',
            'bower_components/cryptojslib/components/rc4-min.js',
            'bower_components/cryptojslib/components/rc4.js',
            'bower_components/cryptojslib/components/ripemd160-min.js',
            'bower_components/cryptojslib/components/ripemd160.js',
            'bower_components/cryptojslib/components/sha1-min.js',
            'bower_components/cryptojslib/components/sha1.js',
            'bower_components/cryptojslib/components/sha224-min.js',
            'bower_components/cryptojslib/components/sha224.js',
            'bower_components/cryptojslib/components/sha256-min.js',
            'bower_components/cryptojslib/components/sha256.js',
            'bower_components/cryptojslib/components/sha3-min.js',
            'bower_components/cryptojslib/components/sha3.js',
            'bower_components/cryptojslib/components/sha384-min.js',
            'bower_components/cryptojslib/components/sha384.js',
            'bower_components/cryptojslib/components/sha512-min.js',
            'bower_components/cryptojslib/components/sha512.js',
            'bower_components/cryptojslib/components/tripledes-min.js',
            'bower_components/cryptojslib/components/tripledes.js',
            'bower_components/cryptojslib/components/x64-core-min.js',
            'bower_components/cryptojslib/components/x64-core.js',
            'bower_components/cryptojslib/rollups/aes.js',
            'bower_components/cryptojslib/rollups/hmac-md5.js',
            'bower_components/cryptojslib/rollups/hmac-ripemd160.js',
            'bower_components/cryptojslib/rollups/hmac-sha1.js',
            'bower_components/cryptojslib/rollups/hmac-sha224.js',
            'bower_components/cryptojslib/rollups/hmac-sha256.js',
            'bower_components/cryptojslib/rollups/hmac-sha3.js',
            'bower_components/cryptojslib/rollups/hmac-sha384.js',
            'bower_components/cryptojslib/rollups/hmac-sha512.js',
            'bower_components/cryptojslib/rollups/md5.js',
            'bower_components/cryptojslib/rollups/pbkdf2.js',
            'bower_components/cryptojslib/rollups/rabbit-legacy.js',
            'bower_components/cryptojslib/rollups/rabbit.js',
            'bower_components/cryptojslib/rollups/rc4.js',
            'bower_components/cryptojslib/rollups/ripemd160.js',
            'bower_components/cryptojslib/rollups/sha1.js',
            'bower_components/cryptojslib/rollups/sha224.js',
            'bower_components/cryptojslib/rollups/sha256.js',
            'bower_components/cryptojslib/rollups/sha3.js',
            'bower_components/cryptojslib/rollups/sha384.js',
            'bower_components/cryptojslib/rollups/sha512.js',
            'bower_components/cryptojslib/rollups/tripledes.js',
            'bower_components/angular-mocks/angular-mocks.js',
            // endbower
            "app/scripts/**/*.js",
            "test/mock/**/*.js",
            "test/spec/**/*.js"
        ],

        // list of files / patterns to exclude
        exclude: [],

        // web server port
        port: 8080,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers: [
            "PhantomJS"
        ],

        // Which plugins to enable
        plugins: [
            "karma-phantomjs-launcher",
            "karma-jasmine"
        ],

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false,

        colors: true,

        // level of logging
        // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: config.LOG_INFO,

        // Uncomment the following lines if you are using grunt's server to run the tests
        // proxies: {
        //   '/': 'http://localhost:9000/'
        // },
        // URL root prevent conflicts with the site root
        // urlRoot: '_karma_'
    });
};