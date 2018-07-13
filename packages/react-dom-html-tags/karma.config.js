// Karma configuration
const fs = require("fs");
const path = require("path");

function resolveBrowserBabelPolyfill() {
    const files = [
        "node_modules/babel-polyfill/browser.js",
        "../../node_modules/babel-polyfill/browser.js"
    ];

    return files.find(file => fs.existsSync(path.resolve(file)));
}

// The karma config is based on the react-helmet karma config, original here:
// https://github.com/nfl/react-helmet/blob/master/karma.config.js
// It's been slightly modified, but @nfl did the hard work here - thanks!
module.exports = function(config) {
    function normalizationBrowserName(browser) {
        return `json/${browser.toLowerCase().split(/[ /-]/)[0]}`;
    }

    config.set({
        // ... normal karma configuration
        basePath: "",

        // How long will Karma wait for a message from a browser before disconnecting from it (in ms).
        browserNoActivityTimeout: 60000,

        client: {
            mocha: {
                bail: true,
                reporter: "html"
            }
        },

        // frameworks to use
        frameworks: ["chai-sinon", "mocha"],

        files: [
            // The babel polyfill is required for React 16+ in phantonJS
            {pattern: resolveBrowserBabelPolyfill(), instrument: false},
            "./src/__tests__/browser/test.js"
        ],

        preprocessors: {
            // add webpack as preprocessor
            "./src/__tests__/browser/test.js": ["webpack", "sourcemap"]
        },

        coverageReporter: {
            dir: ".build/coverage/karma",
            includeAllSources: true,
            reporters: [
                {
                    type: "json",
                    subdir: normalizationBrowserName
                },
                {
                    type: "lcov",
                    subdir: "lcov-report"
                },
                {
                    type: "lcovonly",
                    subdir: ".",
                    file: "lcov.info"
                }
            ]
        },

        webpack: {
            devtool: "inline-source-map",
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        // exclude this dirs from coverage
                        exclude: [/node_modules/],
                        loader: "babel-loader"
                    }
                ]
            },
            watch: true,
            resolve: {
                // options for resolving module requests
                // (does not apply to resolving to loaders)
                modules: ["node_modules", path.resolve(__dirname, "..", "..", "node_modules")]
            }
        },

        webpackServer: {
            noInfo: true
        },

        // test-utils results reporter to use
        // possible values: "dots", "progress", "junit", "growl", "coverage"
        reporters: ["coverage", "spec", "junit"],

        // the default configuration
        junitReporter: {
            outputDir: "./.build/coverage/karma/junit",
            outputFile: "karma-results.xml",
            useBrowserName: false
            // suite: '', // suite will become the package name attribute in xml testsuite element
            // useBrowserName: true, // add browser name to report and classes names
            // nameFormatter: undefined, // function (browser, result) to customize the name attribute in xml testcase element
            // classNameFormatter: undefined, // function (browser, result) to customize the classname attribute in xml testcase element
            // properties: {} // key value pair of properties to add to the <properties> section of the report
            // xmlVersion: null // use '1' if reporting to be per SonarQube 6.2 XML format
        },

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera (has to be installed with `npm install karma-opera-launcher`)
        // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
        // - PhantomJS
        // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
        browsers: process.env.CIRCLECI
            ? ["Chrome", "PhantomJS"]
            : ["Chrome", "PhantomJS", "Firefox"],

        customLaunchers: {
            ChromeTravis: {
                base: "Chrome",
                flags: ["--no-sandbox"]
            }
        },

        // If browser does not capture in given timeout [ms], kill it
        captureTimeout: 60000,

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: true,

        // In yarn workspaces, plugins must be manually required or karma does not work
        plugins: [
            require("webpack"),

            // load all karma-* plugins
            require("karma-chai"),
            require("karma-chai-sinon"),
            require("karma-chrome-launcher"),
            require("karma-coverage"),
            require("karma-firefox-launcher"),
            require("karma-html-reporter"),
            require("karma-junit-reporter"),
            require("karma-mocha"),
            require("karma-phantomjs-launcher"),
            require("karma-phantomjs-shim"),
            require("karma-sourcemap-loader"),
            require("karma-spec-reporter"),
            require("karma-tap-reporter"),
            require("karma-webpack")
        ]
    });
};
