import React from "react";
import streamToString from "stream-to-string";
import {
    renderHtmlToString,
    renderHtmlToStaticMarkup,
    renderHtmlToNodeStream,
    renderHtmlToStaticNodeStream
} from "../server";

const testSets = [
    [
        "renderHtmlToString",
        renderHtmlToString,
        ' data-reactroot=""',
        (html, callback) => callback(undefined, html)
    ],
    [
        "renderHtmlToStaticMarkup",
        renderHtmlToStaticMarkup,
        "",
        (html, callback) => callback(undefined, html)
    ],
    [
        "renderHtmlToNodeStream",
        renderHtmlToNodeStream,
        ' data-reactroot=""',
        (stream, callback) => streamToString(stream, callback)
    ],
    [
        "renderHtmlToStaticNodeStream",
        renderHtmlToStaticNodeStream,
        "",
        (stream, callback) => streamToString(stream, callback)
    ]
];

describe("server", () => {
    describe("HTML API", () => {
        testSets.forEach(([description, render, dataReactRoot, toHtml]) => {
            describe(description, () => {
                test("should render with no args", done => {
                    toHtml(render(), (err, html) => {
                        expect(err).toBeFalsy();
                        expect(html).toBe(
                            `<html><head></head><body><div id="app"></div></body></html>`
                        );
                        done();
                    });
                });

                test("should render default html", done => {
                    toHtml(render(<div>content</div>), (err, html) => {
                        expect(err).toBeFalsy();
                        expect(html).toBe(
                            `<html><head></head><body><div id="app"><div${dataReactRoot}>content</div></div></body></html>`
                        );
                        done();
                    });
                });

                test("should render html attributes", done => {
                    const rendered = render(<div>content</div>, {
                        html: (
                            <html lang="en">
                                <body>
                                    <app />
                                </body>
                            </html>
                        )
                    });

                    toHtml(rendered, (err, html) => {
                        expect(err).toBeFalsy();
                        expect(html).toBe(
                            `<html lang="en"><head></head><body><div id="app"><div${dataReactRoot}>content</div></div></body></html>`
                        );
                        done();
                    });
                });

                test("should render head", done => {
                    const rendered = render(<div>content</div>, {
                        html: (
                            <html>
                                <head>
                                    <title>Page Title</title>
                                </head>
                                <body>
                                    <app />
                                </body>
                            </html>
                        )
                    });

                    toHtml(rendered, (err, html) => {
                        expect(err).toBeFalsy();
                        expect(html).toBe(
                            `<html><head><title>Page Title</title></head><body><div id="app"><div${dataReactRoot}>content</div></div></body></html>`
                        );
                        done();
                    });
                });

                test("should render body attributes", done => {
                    const rendered = render(<div>content</div>, {
                        html: (
                            <html>
                                <body className="appBody">
                                    <app />
                                </body>
                            </html>
                        )
                    });

                    toHtml(rendered, (err, html) => {
                        expect(err).toBeFalsy();
                        expect(html).toBe(
                            `<html><head></head><body class="appBody"><div id="app"><div${dataReactRoot}>content</div></div></body></html>`
                        );
                        done();
                    });
                });

                test("should render custom app container", done => {
                    const rendered = render(<div>content</div>, {
                        html: (
                            <html>
                                <body>
                                    <app id="notDefault" />
                                </body>
                            </html>
                        ),
                        appContainerTagName: "span"
                    });

                    toHtml(rendered, (err, html) => {
                        expect(err).toBeFalsy();
                        expect(html).toBe(
                            `<html><head></head><body><span id="notDefault"><div${dataReactRoot}>content</div></span></body></html>`
                        );
                        done();
                    });
                });

                test("should render markup before the app container", done => {
                    const rendered = render(<div>content</div>, {
                        html: (
                            <html>
                                <body>
                                    <div>before</div>
                                    <app />
                                </body>
                            </html>
                        )
                    });

                    toHtml(rendered, (err, html) => {
                        expect(err).toBeFalsy();
                        expect(html).toBe(
                            `<html><head></head><body><div>before</div><div id="app"><div${dataReactRoot}>content</div></div></body></html>`
                        );
                        done();
                    });
                });

                test("should render markup after the app container", done => {
                    const rendered = render(<div>content</div>, {
                        html: (
                            <html>
                                <body>
                                    <app />
                                    <div>after</div>
                                </body>
                            </html>
                        )
                    });

                    toHtml(rendered, (err, html) => {
                        expect(err).toBeFalsy();
                        expect(html).toBe(
                            `<html><head></head><body><div id="app"><div${dataReactRoot}>content</div></div><div>after</div></body></html>`
                        );
                        done();
                    });
                });

                test("should render html with custom appContainer tag name", done => {
                    const rendered = render(<div>content</div>, {
                        html: (
                            <html lang="en">
                                <head>
                                    <title>Page Title</title>
                                </head>
                                <body className="appBody">
                                    <div>before</div>
                                    <app id="notDefault" />
                                    <div>after</div>
                                </body>
                            </html>
                        ),
                        appContainerTagName: "span"
                    });

                    toHtml(rendered, (err, html) => {
                        expect(err).toBeFalsy();
                        expect(html).toBe(
                            `<html lang="en"><head><title>Page Title</title></head><body class="appBody"><div>before</div><span id="notDefault"><div${dataReactRoot}>content</div></span><div>after</div></body></html>`
                        );
                        done();
                    });
                });
            });
        });
    });

    describe("element API", () => {
        testSets.forEach(([description, render, dataReactRoot, toHtml]) => {
            describe(description, () => {
                test("should render html attributes", done => {
                    const rendered = render(<div>content</div>, {
                        htmlElements: {
                            htmlElement: <html lang="en" />
                        }
                    });

                    toHtml(rendered, (err, html) => {
                        expect(err).toBeFalsy();
                        expect(html).toBe(
                            `<html lang="en"><head></head><body><div id="app"><div${dataReactRoot}>content</div></div></body></html>`
                        );
                        done();
                    });
                });

                test("should render head", done => {
                    const rendered = render(<div>content</div>, {
                        htmlElements: {
                            headElement: (
                                <head>
                                    <title>Page Title</title>
                                </head>
                            )
                        }
                    });

                    toHtml(rendered, (err, html) => {
                        expect(err).toBeFalsy();
                        expect(html).toBe(
                            `<html><head><title>Page Title</title></head><body><div id="app"><div${dataReactRoot}>content</div></div></body></html>`
                        );
                        done();
                    });
                });

                test("should render body attributes", done => {
                    const rendered = render(<div>content</div>, {
                        htmlElements: {
                            bodyElement: <body className="appBody" />
                        }
                    });

                    toHtml(rendered, (err, html) => {
                        expect(err).toBeFalsy();
                        expect(html).toBe(
                            `<html><head></head><body class="appBody"><div id="app"><div${dataReactRoot}>content</div></div></body></html>`
                        );
                        done();
                    });
                });

                test("should render custom app container", done => {
                    const rendered = render(<div>content</div>, {
                        htmlElements: {
                            appContainerElement: <span id="notDefault" />
                        }
                    });

                    toHtml(rendered, (err, html) => {
                        expect(err).toBeFalsy();
                        expect(html).toBe(
                            `<html><head></head><body><span id="notDefault"><div${dataReactRoot}>content</div></span></body></html>`
                        );
                        done();
                    });
                });

                test("should render markup before the app container", done => {
                    const rendered = render(<div>content</div>, {
                        htmlElements: {
                            beforeAppContainerElement: <div>before</div>
                        }
                    });

                    toHtml(rendered, (err, html) => {
                        expect(err).toBeFalsy();
                        expect(html).toBe(
                            `<html><head></head><body><div>before</div><div id="app"><div${dataReactRoot}>content</div></div></body></html>`
                        );
                        done();
                    });
                });

                test("should render markup after the app container", done => {
                    const rendered = render(<div>content</div>, {
                        htmlElements: {
                            afterAppContainerElement: <div>after</div>
                        }
                    });

                    toHtml(rendered, (err, html) => {
                        expect(err).toBeFalsy();
                        expect(html).toBe(
                            `<html><head></head><body><div id="app"><div${dataReactRoot}>content</div></div><div>after</div></body></html>`
                        );
                        done();
                    });
                });

                test("should render htmlElements options callback", done => {
                    const rendered = render(<div>content</div>, {
                        htmlElements: () => ({
                            htmlElement: <html lang="en" />,
                            headElement: (
                                <head>
                                    <title>Page Title</title>
                                </head>
                            ),
                            bodyElement: <body className="appBody" />,
                            appContainerElement: <span id="notDefault" />,
                            beforeAppContainerElement: <div>before</div>,
                            afterAppContainerElement: <div>after</div>
                        })
                    });

                    toHtml(rendered, (err, html) => {
                        expect(err).toBeFalsy();
                        expect(html).toBe(
                            `<html lang="en"><head><title>Page Title</title></head><body class="appBody"><div>before</div><span id="notDefault"><div${dataReactRoot}>content</div></span><div>after</div></body></html>`
                        );
                        done();
                    });
                });

                test("should render htmlElements options with individual callbacks", done => {
                    const rendered = render(<div>content</div>, {
                        htmlElements: {
                            htmlElement: () => <html lang="en" />,
                            headElement: () => (
                                <head>
                                    <title>Page Title</title>
                                </head>
                            ),
                            bodyElement: () => <body className="appBody" />,
                            appContainerElement: () => <span id="notDefault" />,
                            beforeAppContainerElement: () => <div>before</div>,
                            afterAppContainerElement: () => <div>after</div>
                        }
                    });

                    toHtml(rendered, (err, html) => {
                        expect(err).toBeFalsy();
                        expect(html).toBe(
                            `<html lang="en"><head><title>Page Title</title></head><body class="appBody"><div>before</div><span id="notDefault"><div${dataReactRoot}>content</div></span><div>after</div></body></html>`
                        );
                        done();
                    });
                });

                test("should render head as react-root", done => {
                    const rendered = render(<div>content</div>, {
                        htmlElements: {
                            headElement: (
                                <head>
                                    <title>Page Title</title>
                                </head>
                            ),
                            headIsReactRoot: true
                        }
                    });

                    toHtml(rendered, (err, html) => {
                        expect(err).toBeFalsy();
                        expect(html).toBe(
                            `<html><head${dataReactRoot}><title>Page Title</title></head><body><div id="app"><div${dataReactRoot}>content</div></div></body></html>`
                        );
                        done();
                    });
                });
            });
        });
    });
});
