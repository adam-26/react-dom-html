### Integration tests

*   Integration tests use compiled code for tests (`/lib`)
*   Tests using `<HtmlProvider>` with each permitted child element
*   Jest snapshots are used to verify render output (>10,000 snapshots)
*   Asserts the output of all renders are the same, for:
    *   `client: render`
    *   `client: hydrate`
    *   `server: renderToString`
    *   `server: renderToStaticMarkup`
