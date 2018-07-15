# react-dom-html

> The easiest way to render html applications using react
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
    *   [Generating html for client apps](Generating_html_for_client_apps)
    *   [Advanced server-side rendering](Advanced_server-side_rendering)
*   [API](api)
*   [Contributing](contributing)
*   [License](license)

### Introduction

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

### Install

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

### Usage

#### In the browser

##### Client-side render

```js
// browser.js
import {renderHtml} from "react-dom-html";
import MyApplication from "./MyApplication";

// if the .html page was created using react-dom-html you don't need to specify a container
// (server-side rendering or static page generated using react-dom-html-cli)
renderHtml(<MyApplication />);
```

##### Hydrate a server render

```js
// browser.js
import {hydrateHtml} from "react-dom-html";
import MyApplication from "./MyApplication";

// if the server rendered the page using react-dom-html you don't need to specify a container
hydrateHtml(<MyApplication />);
```

#### Server rendering is really easy!

```js
// server.js
import {renderHtmlToString, HTML5_DOCTYPE} from "react-dom-html/server";
import MyApplication from "./MyApplication";

// Render the app in a default html template
const html = renderHtmlToString(<MyApplication />);

// Using expressjs or another http framework
res.send(HTML5_DOCTYPE + html);
```

Of course, you'll probably want to customize the `html` and include your application bundle. Use the `html` option to define a `<html>` element, you can include React elements here.

The `<app>` element represents the application container where the application will be rendered in the HTML output. The `<app>` element **must** be defined in the html, and it **must** be an immediate child of the `<body>` element.

Optionally, you can customize the html tag used for the application container using the `appContainerTagName` option.

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

#### Generating html for client apps

If you're not rendering your application on the server, you can still take advantage of `react-dom-html` to generate the `.html` page used to serve your application in the browser.

You can use [react-dom-html-cli](http://github.com/adam-26/react-dom-html/packages/react-dom-html-cli) to generate `.html` files usin the same simple syntax. The cli utility makes it easy to integrate the html generator into your build process.

#### Advanced server-side rendering

The `html` _option_ accepts a **function** that will be invoked **after** the application has rendered (for _String_ rendering only).
This enables you to assign content to the `html` output that is a result of the render.

Here's an example using the `html` callback option with:

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

_NOTE: This can not be done rendering to a stream, as streams **must** render in page order (from top to bottom)_

### API

The API is very similar to [react-dom](), additional `options` have been added for sever methods.

_If you're new to React, read the `react-dom` documentation first_

#### Client

Unlike [react-dom]() the `container` argument is optional for client methods
if you used `react-dom-html` to generate the `html` used to render the app.

```js
type renderCallback = () => void;

// Render the application in the browser

renderHtml(element: Element<any>, container?: DOMNode, callback?: renderCallback): void

// Hydrate the application in the browser

hydrateHtml(element: Element<any>, container?: DOMNode, callback?: renderCallback): void
```

#### Server

```js
type renderElement = null | Element<any>;

type serverRenderOptions = {
  html:? Element<'html'> | () => Element<'html'>,
  appContainerTagName?: string = "div"
};

// Render to String

renderHtmlToString(element?: renderElement, options?: serverRenderOptions = {}): string

renderHtmlToStaticMarkup(element?: renderElement, options?: serverRenderOptions = {}): string

// Render to Node Stream

renderHtmlToNodeStream(element?: renderElement, options?: serverRenderOptions = {}): Stream

renderHtmlToStaticNodeStream(element?: renderElement, options?: serverRenderOptions = {}): Stream
```

### Contribute

For questions or issues, please [open an issue](https://github.com/adam-26/react-dom-html/issues), and you're welcome to submit a PR for bug fixes and feature requests.

This package exists as a _yarn workspace_, you will need to _fork and then clone_ the [parent workspace](github.com/adam-26/react-dom-html). Follow the instructions in the workspace [README](github.com/adam-26/react-dom-html) file for installing the workspace dependencies.

Before submitting a PR, ensure you run `npm test` to verify that your code adheres to the configured lint rules and passes all tests. Be sure to include tests for any code changes or additions.

## License

MIT
