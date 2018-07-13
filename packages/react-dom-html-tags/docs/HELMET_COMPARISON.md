# Compared to react-helmet

react-dom-html-tags is not based on, nor forked from [react-helmet](https://github.com/nfl/react-helmet), it is a new package.

## No react-side-effect dependency

No use of the npm package [react-side-effect](https://github.com/gaearon/react-side-effect), this simplifies server rendering.

## No data-react-helmet attributes

No more `data-react-helmet` attributes! Instead, you need to assign the `data-react-dom-html-tags` attribute
to any `<head>` element that is **not** rendered using react-dom-html-tags (a common example is the
`<style>` tag rendered by the webpack style-loader plugin).

This should reduce the size of HTML documents being served.

## Rendering

react-helmet renders most head elements and attributes using internal code, it updates the head by
directly manipulating the DOM.

react-dom-html-tags uses react to render All HTML, this ensures consistency between your application and head components. The
`<head>` is mounted using react, so all head elements display in react dev-tools. The `html`, `head`, `body`
and application container attribute values are also rendered using react, after they are rendered they
are copied to the HTML DOM.

## Deterministic

react-helmet is only deterministic on the initial render - this is ok on the server where a request only
involves a single render, but on the client react-helmet can result in non-deterministic `<head>` values.
This occurs because when child components are re-rendered react-helmet is not able to determine the order
of those children in the tree reliably.

react-dom-html-tags is deterministic, when you define html tags that are non-deterministic on client updates
a warning is logged to the console (in development) to notify you, it also includes detailed information
to assist you in identifying the non-deterministic components.

## SSR

react-helmet SSR support is functional, but its a little clumsy.

react-dom-html-tags makes server rendering easy, includes support for streams, and it should support
async rendering once it becomes available in react.

## Async rendering

react-helmet won't be able to support async rendering without being re-written.

react-dom-html-tags should only require a few minor changes to support async rendering
once its available in react.
