import React from "react";
import HtmlMetadata from "../HtmlMetadata";
import Html from "../components/Html";
import {renderHtmlToString} from "../server";

describe("HtmlMetadata", () => {
    describe("getHeadComponents()", () => {
        describe("priorityOrder", () => {
            test("should return head components in default prioritized component order", () => {
                const html = renderHtmlToString(
                    <Html>
                        <head>
                            <title>Page Title</title>
                            <meta name="viewport" content="width=device-width, initial-scale=1" />
                            <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                            <meta name="description" content="a description" />
                            <meta charSet="utf-8" />
                        </head>
                        <app>
                            <div>content</div>
                        </app>
                    </Html>
                );
                expect(html).toBe(
                    '<html><head data-reactroot=""><meta charSet="utf-8"/><meta http-equiv="X-UA-Compatible" content="IE=edge"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>Page Title</title><meta name="description" content="a description"/></head><body><div id="app"><div>content</div></div></body></html>'
                );
            });
        });
    });
});
