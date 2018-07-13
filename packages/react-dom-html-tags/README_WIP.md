# WORK-IN-PROGRESS

## The API will change before version 1 is published

# react-dom-html-tags

> Define HTML elements and metadata in react applications
>
> The latest version requires React version 16.3+ - it utilizes the new React context API

TODO Update some badges to specific workspace packages

[![npm](https://img.shields.io/npm/v/react-dom-html-tags.svg)](https://www.npmjs.com/package/react-dom-html-tags)
[![npm](https://img.shields.io/npm/dm/react-dom-html-tags.svg)](https://www.npmjs.com/package/react-dom-html-tags)
[![CircleCI branch](https://img.shields.io/circleci/project/github/adam-26/react-dom-html-tags/master.svg)](https://circleci.com/gh/adam-26/react-dom-html-tags/tree/master)
[![Maintainability](https://api.codeclimate.com/v1/badges/e159e926827685bcbd1a/maintainability)](https://codeclimate.com/github/adam-26/react-dom-html-tags/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/e159e926827685bcbd1a/test_coverage)](https://codeclimate.com/github/adam-26/react-dom-html-tags/test_coverage)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

### Install

```sh
// npm
npm install --save react-dom-html-tags

// yarn
yarn add react-dom-html-tags
```

### Introduction

Define HTML metadata in React applications.

An alternative to using [react-helmet](https://github.com/nfl/react-helmet),
this provides a few benefits:

1.  Use standard HTML syntax
2.  React is used to render all `<head>` elements and html attributes
3.  It displays correctly in **react dev-tools**.
4.  No additional attributes are appended to <head> child elements
5.  React logs hydration warnings if the client `<head>` does not match the server rendered `<head>`
6.  Hydration warnings are logged if `<html>`, `<head>`, `<body>` or `<app>` html attributes do not match server rendered values
7.  Deterministic rendering on server and client, providing detailed warnings if client updates are non-deterministic, so you can fix the problem
8.  Easy server-side rendering, supports use of streams
9.  When async rendering is enabled for React, it should be simple to add support for this.

You can [read a more detailed comparison to react-helmet here](https://github.com/adam-26/react-dom-html/tree/master/packages/react-dom-html-tags/docs/HELMET_COMPARISON.md).

2 APIs are available for defining HTML metadata:

1.  Use the `<Html>` element in your render methods
2.  Use the `withHtml()` higher-order component and keep your render methods clean

The only different between the 2 APIs (beside slight syntax differences) is that `withHtml()` can be used
to enable advanced server-side stream rendering scenarios. You can read more about rendering with streams below.

#### `<Html>` API:

*   The `<app>` element is **required**, the `<app>` elements children are rendered in the normal react component tree.

TODO: The <app> element here requires CLEAR rules - children must be defined? accept NULL as child?

```js
import React from "react";
import {Html} from "react-dom-html-tags";

const DemoComponent = ({children}) => (
    <Html lang="en" amp>
        <head>
            <meta charSet="utf-8" />
            <title template={title => `${title} | Site Name`}>Page Title</title>
        </head>
        <body className="bodyBackground">
            <app className="appBackground">{children}</app>
        </body>
    </Html>
);
```

#### `withHtml()` API:

TODO: The <app> element SHOULD NOT be required here... its just not necessary.

*   The `<app>` element is **required**, but it can **not define children**.
*   The `<html>` element **must be lower-case**

```js
import {withHtml} from "react-dom-html-tags";

export default withHtml(props => (
    <html lang="en" amp>
        <head>
            <meta charSet="utf-8" />
            <title template={title => `${title} | Site Name`}>Page Title</title>
        </head>
        <body className="bodyBackground">
            <app className="appBackground" />
        </body>
    </html>
))(WrappedComponent);
```

The HTML rendered is (almost) exactly what you define here, no additional attributes!
Its _almost_ exact because the title _template_ attribute is removed and used to generate the title value.

Use the API approach you prefer! You can mix and match if you really want.

Deeply nested and sibling HTML components are also supported:

```js
import {Html} from "react-dom-html-tags";

const AppTemplate = ({children}) => (
    <Html lang="en" amp>
        <head>
            <meta charSet="utf-8" />
            <title template={title => `${title} | Site Name`}>Page Title</title>
        </head>
        <body className="bodyBackground">
            <app className="appBackground">{children}</app>
        </body>
    </Html>
);

const LoginPage = props => (
    <Html>
        <head>
            <title>Login</title>
        </head>
        <body>
            <app>
                <UsernameAndPassword />
            </app>
        </body>
    </Html>
);

// Somewhere in your react application
<AppTemplate>
    <LoginPage />
</AppTemplate>;
```

All HTML metadata will be correctly resolved and rendered

### Browser rendering

Rendering on the browser is easy.
Internally it uses [react-dom-html](https://github.com/adam-26/react-dom-html/tree/master/packages/react-dom-html), if you are **not** rendering on the server - you may be interested in reading how to [generate a html template for browser-only rendering](https://github.com/adam-26/react-dom-html/tree/master/packages/react-dom-html-cli) using [react-dom-html-cli](https://github.com/adam-26/react-dom-html/tree/master/packages/react-dom-html-cli).

```js
import {renderHtml, hydrateHtml} from "react-dom-html-tags";

renderHtml(<App />);

// Or, when you're hydrating a server render
hydrateHtml(<App />);
```

If you're not using server-side rendering and you're not using [react-dom-html](https://github.com/adam-26/react-dom-html/tree/master/packages/react-dom-html) to create your client `.html` file,
you can specify a DOM container _similar_ to using [react-dom](https://reactjs.org/docs/react-dom.html).

```js
import {renderHtml} from "react-dom-html-tags";
renderHtml(<App />, {container: document.querySelector("#app")});
```

### Server rendering

Rendering on the server is easy, equivalent methods exist for all standard `react-dom` server render methods. For more information see the API documentation below.

```js
import {
    HTML5_DOCTYPE,
    renderHtmlToString,
    renderHtmlToStaticMarkup,
    renderHtmlToNodeStream,
    renderHtmlToStaticNodeStream
} from "react-dom-html-tags/server";

// using expressjs, or similar...
res.send(HTML5_DOCTYPE + renderHtmlToString(<App />));
```

When rendering using streams, all HTML metadata must be loaded **before** rendering.

### Usage

#### Supported HTML syntax

*   all standard HTML `<head>` elements are supported
*   The `<app>` element is used to represent the application container - it is **required** and **must** be an immediate child of `<body>`
*   Define attributes directly on HTML elements
    *   `<Html>`, `<html>`, `<head>`, `<body>` and `<app>` all accept attributes
    *   use react camel-case prop names to define attributes
*   `<style>` elements accept `string` child values
    *   template literals can be used as the child value for easy multi-line styles
    *   if you include user-input in styles, be sure to sanitize it to prevent any XSS or similar vulnerabilities
        *   if you use user-input for any `@import(url)` URLs, validate and/or sanitize the URL value
*   `<script>` elements require that you use `dangerouslySetInnerHTML={{__html: ""}}` for inline scripts
*   `<title>` supports the additional `template` attribute.
    *   nested title templates are reduced to produce a concatenated title value
    *   It accepts a function that receives a `title` string argument and must return a `string`, example:

```js
<title template={title => `${title} | Site Name`}>Title value</title>
```

#### Render static content outside of the application container

On the server you often need to render HTML outside the react application container. A common use-case is rendering a `<script>` tag that loads your application bundle on the page.

You can use the `beforeAppContainer` and `afterAppContainer` _options_ with all server render methods to render additional content either before or after the application container. You can use react components with these options, they are both rendered as static markup.

```js
const html = renderHtmlToString(<App />, {
    beforeAppContainer: <noscript>Enable JavaScript</noscript>,
    afterAppContainer: <script src="/bundle.js" />
});
```

This will render html similar to:

```html
<html>
  <head></head>
  <body>
   <noscript>Enable JavaScript</noscript>
   <div id="app">
     <!-- App is rendered here -->
   </div>
   <script src="/bundle.js" />
  </body>
</html>
```

These options should be enough to give you complete control of the rendered html document.

#### Including external `<head>` elements

You can add React and HTML DOMNode children to the document `<head>`, but you need to instruct [react-dom-html-tags]() to **ignore** them so that they are not removed when the `<head>` is initially mounted.

To do this, add the HTML attribute: `data-react-dom-html-tags="false"`

For example, if you want to add an external script:

```js
<script src="/cdn/script.js" data-react-dom-html-tags="false" />
```

#### Ignoring non-deterministic errors

You can disable all non-deterministic warnings for client rendering.

This requires you to create the `HtmlProvider` and set the `suppressNonDeterministicWarnings` prop.

**important:** remember to assign the `htmlMetadata` the `metadata` prop.

```js
import {renderHtml, hydrateHtml, HtmlProvider} from "react-dom-html-tags";

// client render
renderHtml(htmlMetadata => (
    <HtmlProvider metadata={htmlMetadata} suppressNonDeterministicWarnings={true}>
        <App />
    </HtmlProvider>
));

// client hydrate
hydrateHtml(htmlMetadata => (
    <HtmlProvider metadata={htmlMetadata} suppressNonDeterministicWarnings={true}>
        <App />
    </HtmlProvider>
));
```

#### Adding `<head>` elements outside the render lifecycle

In some advanced use-cases you may **need** to add react elements to the `<head>` element outside of the react lifecycle.

**NOTE: This should only be used when absolutely necessary**, you should define `<head>` elements in the react component lifecycle when possible.

You can use the `head` _option_ with _string server render methods_ to append additional elements to the HTML `<head>`. You should add a `data-react-dom-html-tags="false"` attribute to any element(s) you define here, otherwise the client will not hydrate correctly.

```js
const html = renderHtmlToString(<App />, {
    head: () => <link rel="stylesheet" href="custom.css" data-react-dom-html-tags="false" />
});
```

This will render html similar to:

```html
<html>
  <head>
    <link rel="stylesheet" href="custom.css" data-react-dom-html-tags="false" />
  </head>
  <body>
   <div id="app">
     <!-- App is rendered here -->
   </div>
  </body>
</html>
```

For a real-world use-case, see the _styled-components_ usage below.

#### Webpack style-loader

To have wepback style-loader work correctly, you must instruct react-dom-html-tags to ignore the injected `style-loader` `<style>` element. Add the following options to your style-loader webpack configuration:

```js
module: {
  rules: [{
    test: /\.css$/,
    use: [{
        loader: "style-loader",
        options: {
          attrs: {"data-react-dom-html-tags": false}
        }
       },
      {loader: "css-loader"}]
  }]
},
```

#### SSR Cache

_This section provides guidance for caching **only** HTML metadata. For many cache use-cases, you can simply cache the entire render output._

You can cache the HTML metadata to improve server render performance, you can also use cached HTML metadata to enable use of rendering to streams. You can only populate the cache after `renderHtmlToString`, but once the cache is populated you can use the cached HTML metadata to `renderHtmlToString` and `renderHtmlToNodeStream`.

```js
import {HTML5_DOCTYPE, HtmlMetadata} from "react-dom-html-tags";
import {renderHtmlToString} from "react-dom-html-tags/server";
import {renderToString} from "react-dom/server";
import CacheProvider from "./serverCacheProvider";

// expressjs handler, or similar
const CACHE_KEY = req.url;

const htmlMetadata = HtmlMetadata.createForServerStringRender();
if (CacheProvider.hasKey(CACHE_KEY)) {
    //  use cached HTML metadata for render
    htmlMetadata.useSerializedState(CacheProvider.get(CACHE_KEY));
}

const html = renderHtmlToString(<App />, {
    htmlMetadata: htmlMetadata
});

if (!CacheProvider.hasKey(CACHE_KEY)) {
    // populate the cache
    // passing `renderToString` avoids bundling `react-dom/server`
    CacheProvider.set(CACHE_KEY, htmlMetadata.serializeState(renderToString));
}

res.send(HTML5_DOCTYPE + html);
```

You can also render to node streams using cached data. But remember, in this scenario the HTML metadata **must** be cached first using a string render. This is because stream rendering **must** render the HTML page in order from top to bottom.

```js
import {HTML5_DOCTYPE, HtmlMetadata} from "react-dom-html-tags";
import {renderHtmlToNodeStream} from "react-dom-html-tags/server";

// expressjs handler, or similar
const CACHE_KEY = req.url;

const htmlMetadata = HtmlMetadata.createForServerStreamRender();
if (CacheProvider.hasKey(CACHE_KEY)) {
    //  use cached HTML metadata for render
    htmlMetadata.useSerializedState(CacheProvider.get(CACHE_KEY));

    const stream = renderHtmlToNodeStream(<App />, {
        htmlMetadata: htmlMetadata
    });

    res.write(HTML5_DOCTYPE);
    return stream.pipe(res);
}
// else, perform a string render and populate the cache
```

#### SSR using streams

There are 2 approaches you can use for server rendering with streams:

1.  Determine all components that define HTML metadata, and invoke the HTML before rendering the app

    *   Its difficult
    *   Limited to using the `withHtml()` API for defining metadata
    *   Generally requires use of additional packages to resolve route HTML components

2.  Cache html state after `renderHtmlToString`, and use cached html state to stream future responses (as described above)
    *   Easier (The only complication is defining a reliable cache key)
    *   Supports both APIs

##### Approach 1 pseudo-code

```js
import {HtmlMetadata, HtmlProvider} from "react-dom-html-tags";
import {HTML5_DOCTYPE, renderHtmlToNodeStream} from "react-dom-html-tags/server";

const htmlMetadata = HtmlMetadata.createForServerStreamRender();

// get all components that render HTML tags
// - this could be done using react-router-config static routes for example.
// - the _props_ passed to `appendHtmlMetadata` should be returned when resolving HTML tag components
const htmlComponents = [...];
htmlComponents.forEach(htmlComponent => {
  htmlComponent.appendHtmlMetadata(htmlMetadata, props);
});

// After the HTML state is loaded from cache, you can render using streams
const stream = renderHtmlToNodeStream(<App />, {
  metadata: htmlMetadata
});

res.write(HTML5_DOCTYPE);
stream.pipe(res);
```

#### styled-components

react-dom-html-tags can be used with [styled-components](https://www.styled-components.com/), but you'll need to tweak a few configuration option:

_note: this would be must simpler if styled-components `getStyleElement()` accepted an argument for additional props_

**client:**

```js
import {renderHtml, hydrateHtml} from "react-dom-html-tags";

// hydrating a server render
hydrateHtml(<App />, {
    hydratedHeadElementSelectors: "[data-styled-components]"
});

// Or, client-only render
renderHtml(<App />, {
    externalHeadElementSelectors: "[data-styled-components]"
});
```

**server:**

```js
import {renderHtmlToString} from "react-dom-html-tags/server";
import {ServerStyleSheet} from "styled-components";

const sheet = new ServerStyleSheet();
const html = renderHtmlToString(sheet.collectStyles(<App />), {
    // after the application is rendered, include the stylesheet(s) in the document <head>
    head: () => (
        <head>
            {React.Children.map(sheet.getStyleElement(), child => {
                // required to prevent client hydration errors
                return React.cloneElement(child, {
                    "data-styled-streamed": true
                });
            })}
        </head>
    )
});
```

### API

`react-dom-html-tags`:

```js
type HydrateHtmlOptions = {
  container?: DOMNode,
  callback?: () => void,
  externalHeadElementSelectors?: Array<String> | String,
  hydratedHeadElementSelectors?: Array<String> | String,
};

hydrateHtml(element: React.ElementType, options?: HydrateHtmlOptions = {});

type RenderHtmlOptions = {
  container?: DOMNode,
  callback?: () => void,
  externalHeadElementSelectors?: Array<String> | String
};

renderHtml(element: React.ElementType, options?: RenderHtmlOptions = {});
```

`react-dom-html-tags/server`:

```js
type StringRenderOptions = {
  beforeAppContainer?: React.Element<any>,
  afterAppContainer?: React.Element<any>,
  htmlMetadata?: HtmlMetadata,
  appContainerTagName?: string,
  head?: React.Element<head> | () => React.Element<head>
};

renderHtmlToString(element: React.ElementType, options?: StringRenderOptions  = {});

renderHtmlToStaticMarkup(element: React.ElementType, options?: StringRenderOptions = {});

type StreamRenderOptions = {
  beforeAppContainer?: React.Element<any>,
  afterAppContainer?: React.Element<any>,
  htmlMetadata?: HtmlMetadata,
  appContainerTagName?: string
};

renderHtmlToNodeStream(element: React.ElementType, options?: StreamRenderOptions = {});

renderHtmlToStaticNodeStream(element: React.ElementType, options?: StreamRenderOptions = {});
```

### Contribute

For questions or issues, please [open an issue](https://github.com/adam-26/react-dom-html/issues), and you're welcome to submit a PR for bug fixes and feature requests.

Before submitting a PR, ensure you run `yarn test` to verify that your coe adheres to the configured lint rules and passes all tests. Be sure to include unit tests for any code changes or additions.

## License

MIT
