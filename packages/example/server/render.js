import React from "react";
import { ServerStyleSheet } from "styled-components";
import AppScripts from "../src/components/AppScripts";
import AppStyles from "../src/components/AppStyles";
import App from "../src/components/App";
import { HtmlMetadata } from "react-dom-html-tags";
import {
    renderHtmlToString,
    renderHtmlToStaticMarkup,
    renderHtmlToNodeStream,
    renderHtmlToStaticNodeStream,
    HTML5_DOCTYPE
} from "react-dom-html-tags/server";
import { renderToString } from "react-dom/server";

const assets = require("../build/manifest.json");

const simpleCache = {};
const CACHE_KEY = "example_only";

function renderOnClient(req) {
    return typeof req.query.client !== "undefined";
}

const ClientTemplate = () => <AppStyles>Loading...</AppStyles>;

export function stringResponse(req, res) {
    if (renderOnClient(req)) {
        const html = renderHtmlToStaticMarkup(<ClientTemplate />, {
            afterAppContainer: (
                <AppScripts assets={assets} hydrateClient={false} />
            )
        });

        return res.send(HTML5_DOCTYPE + html);
    }

    const htmlMetadata = HtmlMetadata.createForServerStringRender();
    if (simpleCache[CACHE_KEY]) {
        // === if the HTML metadata is cached - use cached HTML metadata state for render ===
        htmlMetadata.useSerializedState(simpleCache[CACHE_KEY]);
    }

    // === styled-components ===
    const sheet = new ServerStyleSheet();
    const html = renderHtmlToString(sheet.collectStyles(<App />), {
        head: () => (
            <head>
                {React.Children.map(sheet.getStyleElement(), child => {
                    // It would be neater if "getStyledElement()" accepted an additional props argument
                    // - AND those props were COPIED when being HYDRATED on the client
                    return React.cloneElement(child, {
                        // todo - if styled-components supported additional props, this could be used to
                        //        prevent any configuration for hydration
                        // "data-react-dom-html-tags": true,
                        "data-styled-streamed": true // required to force it to hydrate immediately
                    });
                })}
            </head>
        ),
        afterAppContainer: <AppScripts assets={assets} hydrateClient={true} />,
        htmlMetadata: htmlMetadata
    });

    // === without styled-components ===
    // const html = renderHtmlToString(<App />, () => ({
    //     afterAppContainer: <AppScripts assets={assets} hydrateClient={true} />,
    //     htmlMetadata: htmlMetadata
    // }));

    // === Cache the HTML Metadata State ===
    if (!simpleCache[CACHE_KEY]) {
        // passing `renderToString` avoids adding `react-dom/server` as a client bundle dependency
        simpleCache[CACHE_KEY] = htmlMetadata.serializeState(renderToString);
    }

    res.send(HTML5_DOCTYPE + html);
}

export function streamResponse(req, res) {
    if (renderOnClient(req)) {
        const clientStream = renderHtmlToStaticNodeStream(<ClientTemplate />, {
            afterAppContainer: (
                <AppScripts assets={assets} hydrateClient={false} />
            )
        });

        res.write(HTML5_DOCTYPE);
        clientStream.pipe(res);
        return;
    }

    // === Stream using cached HTML Metadata state from the string render ===
    const htmlMetadata = HtmlMetadata.createForServerStreamRender();
    if (simpleCache[CACHE_KEY]) {
        // === if the HTML metadata is cached - use cached HTML metadata state for render ===
        htmlMetadata.useSerializedState(simpleCache[CACHE_KEY]);
    } else {
        throw new Error(
            "Stream render requires the HTML metadata be loaded before render, for this example render the page as a string to cache the HTML metadata and then render the page using node streams."
        );
    }

    const stream = renderHtmlToNodeStream(<App />, {
        afterAppContainer: <AppScripts assets={assets} hydrateClient={true} />,
        htmlMetadata: htmlMetadata
    });

    res.write(HTML5_DOCTYPE);
    stream.pipe(res);
}
