// @flow
import invariant from "invariant";
// NOTE: This import will be replaced @ build-time to use "react-dom-html-tags"
import {HtmlMetadata, withHtmlProvider} from "../index.js";
import {getAppElement, getRenderOptions, message, resolveOptionalElement} from "./serverUtil";
import {
    renderHtmlToString as renderToString,
    renderHtmlToStaticMarkup as renderToStaticMarkup
} from "react-dom-html/server";
import type {RootElement} from "../flowTypes";

export function renderHtmlToString(element: RootElement, options?: Object = {}): string {
    return renderString("renderHtmlToString", renderToString, false, element, options);
}

export function renderHtmlToStaticMarkup(element: RootElement, options?: Object = {}): string {
    return renderString("renderHtmlToStaticMarkup", renderToStaticMarkup, true, element, options);
}

function renderString(
    renderFunctionName: string,
    renderToFunc: (element: mixed) => string,
    isStaticMarkup: boolean,
    element: RootElement,
    options?: Object = {}
): string {
    const {htmlMetadata, head, ...renderOpts} = options;
    if (htmlMetadata) {
        invariant(
            htmlMetadata.isServerStringRender(),
            message("Invalid `htmlMetadata` instance, not created for server string render.")
        );
    }

    const metadata = htmlMetadata || HtmlMetadata.createForServerStringRender();

    // Wrap the application with a HtmlProvider
    const rootElement = withHtmlProvider(element, metadata);
    const appElement = getAppElement(rootElement, element);

    return renderToFunc(rootElement, {
        htmlElements: () => {
            // head is not used when serialized state has been assigned
            if (head && !metadata._hasSerializedState()) {
                metadata.appendHead(resolveOptionalElement(head));
            }

            return getRenderOptions(
                renderFunctionName,
                isStaticMarkup,
                appElement,
                metadata,
                renderOpts
            );
        }
    });
}
