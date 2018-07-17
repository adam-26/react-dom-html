# react-dom-html

> The easiest way to render full-page react-dom applications
>
> It's react-dom, without the need for any html boilerplate
>
> Supports React version 16+

[![npm](https://img.shields.io/npm/v/react-dom-html.svg)](https://www.npmjs.com/package/react-dom-html)
[![npm](https://img.shields.io/npm/dm/react-dom-html.svg)](https://www.npmjs.com/package/react-dom-html)
[![CircleCI branch](https://img.shields.io/circleci/project/github/adam-26/react-dom-html/master.svg)](https://circleci.com/gh/adam-26/react-dom-html/tree/master)
[![Maintainability](https://api.codeclimate.com/v1/badges/e159e926827685bcbd1a/maintainability)](https://codeclimate.com/github/adam-26/react-dom-html/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/e159e926827685bcbd1a/test_coverage)](https://codeclimate.com/github/adam-26/react-dom-html/test_coverage)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

_Test coverage:_ *~98.5%*

#### Contents

*   [Introduction](introduction)
*   [Install](install)
*   [Usage](usage)
    *   [Browser rendering](Browser)
    *   [Server rendering](Server)
        *   [Server render options](Server_render_options)
    *   [Generating static html](Generating_static_Html)
*   [API](api)
*   [Contributing](contributing)
*   [License](license)

## Introduction

`react-dom-html` is a thin wrapper around the client and server render methods of [react-dom]() that takes care of all the `html` boilerplate.

If you want to define HTML metadata in your react application (similar to [react-helmet](https://github.com/nfl/react-helmet)), use [react-dom-html-tags](https://github.com/adam-26/react-dom-html/tree/master/packages/react-dom-html-tags).

**Browser** methods supported:

*   `renderHtml`
*   `hydrateHtml`

**Server** methods supported:

*   `renderHtmlToString`
*   `renderHtmlToStaticMarkup`
*   `renderHtmlToNodeStream`
*   `renderHtmlToStaticNodeStream`

##### Bundle size:

~500 bytes gzipped for the _**client**_ production build.

## Install

```sh
// npm
npm install --save react-dom-html

// yarn
yarn add react-dom-html
```

Both `react` and `react-dom` are _peer dependencies_, so make sure you have them installed.

```sh
// npm
npm install --save react react-dom

// yarn
yarn add react react-dom
```

## Usage

### Browser

##### Client-side render

Use when [react-dom-html-cli](https://github.com/adam-26/react-dom-html/blob/master/packages/react-dom-html-cli/README.md),
`renderHtmlToStaticMarkup` or `renderHtmlToStaticNodeStream` is used to serve the application.

```js
// browser.js
import {renderHtml} from "react-dom-html";
import MyApplication from "./MyApplication";

renderHtml(<MyApplication />);
```

##### Hydrate a server render

Use when `renderHtmlToString` or `renderHtmlToNodeStream` is used to serve the application.

```js
// browser.js
import {hydrateHtml} from "react-dom-html";
import MyApplication from "./MyApplication";

// if the server rendered the page using react-dom-html you don't need to specify a container
hydrateHtml(<MyApplication />);
```

### Server

Server rendering is really easy!

##### Render to string

```js
// server.js
import {renderHtmlToString, HTML5_DOCTYPE} from "react-dom-html/server";
import MyApplication from "./MyApplication";

// Render the app in a default html template
const html = renderHtmlToString(<MyApplication />);

// Using expressjs or another http framework
res.send(HTML5_DOCTYPE + html);
```

##### Render using node streams

```js
import {renderHtmlToNodeStream, HTML5_DOCTYPE} from "react-dom-html/server";
import MyApplication from "./MyApplication";

const stream = renderHtmlToNodeStream(<App />);

res.write(HTML5_DOCTYPE);
return stream.pipe(res);
```

#### Server render options

Of course, you'll probably want to customize the `html` and include your application bundle.

##### html: The simple option

The `html` option accepts a **React component** to render custom Html. The root element **must** be a `<html>` element.

The `<app>` element represents the application container where the application will be rendered in the HTML output. The `<app>` element **must** be defined in the html, and it **must** be an immediate child of the `<body>` element.

Optionally, you can customize the html tag used for the application container using the `appContainerTagName` option.


Here is a simple example:

```js
// server.js
import {renderHtmlToString, HTML5_DOCTYPE} from "react-dom-html/server";
import MyApplication from "./MyApplication";


// The `<app />` element represents your application container.
// It's REQUIRED, and defines where your application will be rendered

// You can configure the html template using JSX
const html = renderHtmlToString(<MyApplication />, {
  html: (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>My Application</title>
      </head>
      <body className="pageBackground">

        {/*Include content before your application*/}
        <noscript>JavaScript must be enabled</noscript>

        {/*The `<app />` element is always REQUIRED*/}
        <app className="appBackground" />

        {/*Include content after your application*/}
        <script src="/public/scripts/appBundle.js" />

      </body>
    </html>
  ),

  // optionally, change the appContainer tag name
  appContainerTagName: "span"
}

// Using expressjs or another http framework
res.send(HTML5_DOCTYPE + html);
```

The `html` options also accepts a **callback function** that will be invoked **after** the
application has rendered (for _String_ rendering only). This enables you to assign content to
the `html` output that is a result of the render

Here's a more complex example using the `html` option as a callback that is invoked after the application is rendered.
This example includes:

*   serialized data, and
*   [styled-components](https://www.styled-components.com/docs/advanced#server-side-rendering) application on the server

```js
import {renderHtmlToString, HTML5_DOCTYPE} from "react-dom-html/server";
import {ServerStyleSheet} from "styled-components";
import createReduxStore from './store';
import MyApplication from "./MyApplication";

const store = createReduxStore();
const sheet = new ServerStyleSheet();

const html = renderHtmlToString(sheet.collectStyles(<MyApplication />), {
    html: () => (
      // After the application is rendered, you can access styles created during the render
      const styleTags = sheet.getStyleElement();

      return (
        <html>
          <head>
              <meta charSet="utf-8" />
              <title>My Application</title>
              {styleTags}
          </head>
          <body>
            <app />

            {/*Serialize store data, and include bundle*/}
            <script dangerouslySetInnerHTML={__html: `__appData=${JSON.stringify(store.getState())};`} />
            <script src="/public/scripts/appBundle.js" />
          </body>
        </html>
      );
    )
});
```

##### htmlElements: The advanced option

Using the `htmlElements` options is slightly more complex but gives you much greater control of how the
Html is rendered. This additional control is often required when **rendering using streams**.

You can use the above `html` _option_ with streams when you do **not** need to serialize any state
to the response (or write any other data to the response as a result of the application render). However,
if you need to serialize state (or write other data to the response as a result of the application render)
you must use the `htmlElements` _option_ that enables element-specific callback(s) to be invoked.
This allows you to serialize application state for the response.

If your application needs to render using both strings and streams with callbacks, you must use the `htmlElements` option.

**IMPORTANT**: The `htmlElement` and `bodyElement` options must not include any child elements.

Here is an example using all available `htmlElements` options:

```js
import {renderHtmlToNodeStream, HTML5_DOCTYPE} from "react-dom-html/server";
import createReduxStore from './store';
import MyApplication from "./MyApplication";

const store = createReduxStore();

const stream = renderHtmlToNodeStream(<MyApplication />, {
    htmlElements: {
        htmlElement: <html lang="en" />,
        headElement: (
          <head>
            <meta charSet="utf-8" />
            <title>My Application</title>
          </head>
        ),
        headIsReactRoot: true,
        bodyElement: <body className="appBody" />,
        beforeAppContainerElement: <noscript>JavaScript must be enabled</noscript>,
        afterAppContainerElement: () => (
            <script dangerouslySetInnerHTML={__html: `__appData=${JSON.stringify(store.getState())};`} />
            <script src="/public/scripts/appBundle.js" />
        )
    }
});
```

### Generating static Html

If you're not rendering your application on the server, you can still take advantage of `react-dom-html` to generate the `.html` page used to serve your application in the browser.

You can use [react-dom-html-cli](http://github.com/adam-26/react-dom-html/packages/react-dom-html-cli) to generate `.html` files usin the same simple syntax. The cli utility makes it easy to integrate the html generator into your build process.


## API

The API is very similar to [react-dom](), additional `options` have been added for sever methods.

_If you're new to React, read the `react-dom` documentation first_

### Client

Unlike [react-dom]() the `container` argument is optional for client methods
if you used `react-dom-html` to generate the `html` used to render the app.

```js
type renderCallback = () => void;

// Render the application in the browser

renderHtml(element: Element<any>, container?: DOMNode, callback?: renderCallback): void

// Hydrate the application in the browser

hydrateHtml(element: Element<any>, container?: DOMNode, callback?: renderCallback): void
```

### Server

```js
type renderElement = null | Element<any>;

type htmlElementOptions = {
  htmlElement?: Element<'html'> | () => Element<'html'>,
  headElement?: Element<'head'> | () => Element<'head'>,
  bodyElement?: Element<'body'> | () => Element<'body'>,
  appContainerElement?: Element<'*'> | () => Element<'*'>,
  beforeAppContainerElement?: Element<'*'> | () => Element<'*'>,
  afterAppContainerElement?: Element<'*'> | () => Element<'*'>,
  headIsReactRoot?: boolean = false
};

type serverRenderOptions = {
  html:? Element<'html'> | () => Element<'html'>,
  htmlElements:? htmlElementOptions | () => htmlElementOptions,
  appContainerTagName?: string = "div"
};

// Render to String

renderHtmlToString(element?: renderElement, options?: serverRenderOptions = {}): string

renderHtmlToStaticMarkup(element?: renderElement, options?: serverRenderOptions = {}): string

// Render to Node Stream

renderHtmlToNodeStream(element?: renderElement, options?: serverRenderOptions = {}): Stream

renderHtmlToStaticNodeStream(element?: renderElement, options?: serverRenderOptions = {}): Stream
```

## Contribute

For questions or issues, please [open an issue](https://github.com/adam-26/react-dom-html/issues), and you're welcome to submit a PR for bug fixes and feature requests.

This package exists as a _yarn workspace_, you will need to _fork and then clone_ the [parent workspace](github.com/adam-26/react-dom-html). Follow the instructions in the workspace [README](github.com/adam-26/react-dom-html) file for installing the workspace dependencies.

Before submitting a PR, ensure you run `npm test` to verify that your code adheres to the configured lint rules and passes all tests. Be sure to include tests for any code changes or additions.

## License

MIT
