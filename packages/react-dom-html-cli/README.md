# react-dom-html-cli

> Generate .html files from react-dom-html templates

[![npm](https://img.shields.io/npm/v/react-dom-html.svg)](https://www.npmjs.com/package/react-dom-html)
[![npm](https://img.shields.io/npm/dm/react-dom-html.svg)](https://www.npmjs.com/package/react-dom-html)
[![CircleCI branch](https://img.shields.io/circleci/project/github/adam-26/react-dom-html/master.svg)](https://circleci.com/gh/adam-26/react-dom-html/tree/master)
[![Maintainability](https://api.codeclimate.com/v1/badges/e159e926827685bcbd1a/maintainability)](https://codeclimate.com/github/adam-26/react-dom-html/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/e159e926827685bcbd1a/test_coverage)](https://codeclimate.com/github/adam-26/react-dom-html/test_coverage)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

### Introduction

Generate `.html` files for serving client application bundles, sending emails or any other task that requires static Html pages to be generated.

[react-dom-html](http://github.com/adam-26/react-dom-html/packages/react-dom-html) eliminates the need for any `html` boilerplate, it uses a sensible default structure that you can
completely customize for your needs without needing to use strings.

`react-dom-html-cli` generates `.html` files using _react-dom-html templates_.

### Install

```sh
// npm
npm install --save-dev react-dom-html-cli

// yarn
yarn add react-dom-html-cli -D
```

The easiest way to run the executable is add a `script` to package.json:

```json
{
    "scripts": {
        "generateHtml":
            "react-dom-html generateHtml templates/inputTemplate.js output/generated.html"
    }
}
```

Run the script to generate html:

```sh
# npm
npm run generateHtml

# yarn
yarn run generateHtml
```

### Usage

1.  Define a html template

**IMPORTANT**: The `template` **must** be the **default** export from the file.

```js
// htmlTemplate.js
import React from "react";
// You can use react components with the template

// The `<app />` element is REQUIRED, it represents the application container
// That is where your application will be rendered

export default {
    includeDocType: true,
    html: (
        <html>
            <head>
                <meta charSet="utf-8" />
                <title>My Application</title>
            </head>
            <body>
                <app>
                    <div>Loading...</div>
                </app>
                <script src="/public/scripts/appBundle.js" />
            </body>
        </html>
    ),
    appContainerTagName: "span"
};
```

_You need to have `.babelrc` configured for React (or JSX) before running the cli template generator_
See `demo/.babelrc` for an example.

2.  Run the cli executable

```sh
react-dom-html generateHtml htmlTemplate.js generated.html
```

3.  Your `html` file is now generated!

### Template API

The template accepts _all_ options from [react-dom-html](http://github.com/adam-26/react-dom-html/packages/react-dom-html),
you can read more about template options there.

An additional option is supported:

*   `includeDocType`: set to `true` to include the HTML 5 doc type, or a string for a custom doc type

Also, the `<app />` element is permitted to have children when using the cli.

```js
type templateOptions = {
    includeDocType?: boolean | string,
    html: ?Element<"html">,
    appContainerTagName: ?string
};
```

### Minimal template example

The following template is the minimum elements required to correctly render:

*   The `<app />` element is **required**, and must be a child of `<body>`

```js
// htmlTemplate.js
import React from "react";

export default {
    includeDocType: true,
    html: (
        <html>
            <body>
                <app />
            </body>
        </html>
    )
};
```

### Contribute

For questions or issues, please [open an issue](https://github.com/adam-26/react-dom-html/issues), and you're welcome to submit a PR for bug fixes and feature requests.

This package exists as a _yarn workspace_, you will need to _fork and then clone_ the [parent workspace](github.com/adam-26/react-dom-html). Follow the instructions in the workspace [README](github.com/adam-26/react-dom-html) file for installing the workspace dependencies.

Before submitting a PR, ensure you run `npm test` to verify that your code adheres to the configured lint rules and passes all tests. Be sure to include tests for any code changes or additions.

## License

MIT
