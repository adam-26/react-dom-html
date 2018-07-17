// @flow
import React from "react";
import {renderToStaticMarkup, renderToString} from "react-dom/server";
import mapOptionsToState from "./mapOptionsToState";
import {
    resolveAndRenderStaticOpeningTag,
    renderStaticOpeningTagFromElement,
    resolveOptionalElement
} from "./serverUtil";
import type {ElementType} from "../flowTypes";

export function renderHtmlToString(element: ElementType = null, options?: Object = {}): string {
    return renderString("renderHtmlToString", renderToString, false, element, options);
}

export function renderHtmlToStaticMarkup(
    element: ElementType = null,
    options?: Object = {}
): string {
    return renderString("renderHtmlToStaticMarkup", renderToStaticMarkup, true, element, options);
}

function renderString(
    renderFunctionName: string,
    renderToFunc: (element: mixed) => string,
    isStaticMarkup: boolean,
    element: ElementType,
    options: Object
): string {
    // render the main element(s) first
    const appMarkup = renderToFunc(element);

    const {
        htmlElement,
        bodyElement,
        headElement,
        appContainerElement,
        beforeAppContainerElement,
        afterAppContainerElement,
        headIsReactRoot
    } = mapOptionsToState(element, options);

    const openingHtmlTag = resolveAndRenderStaticOpeningTag(htmlElement);
    const openingBodyTag = resolveAndRenderStaticOpeningTag(bodyElement);
    const appContainerEl = resolveOptionalElement(appContainerElement);
    const openingAppTag = renderStaticOpeningTagFromElement(appContainerEl);

    // The head may be assigned as a pre-rendered string
    const headEl = resolveOptionalElement(headElement);
    const headTag =
        typeof headEl === "string"
            ? headEl
            : (isStaticMarkup || !headIsReactRoot)
                ? renderToStaticMarkup(headEl)
                : renderToString(headEl);
    const beforeAppContainerMarkup = beforeAppContainerElement
        ? renderToStaticMarkup(resolveOptionalElement(beforeAppContainerElement))
        : "";
    const afterAppContainerMarkup = afterAppContainerElement
        ? renderToStaticMarkup(resolveOptionalElement(afterAppContainerElement))
        : "";

    return `${openingHtmlTag}${headTag}${openingBodyTag}${beforeAppContainerMarkup}${openingAppTag}${appMarkup}</${
        appContainerEl.type
    }>${afterAppContainerMarkup}</body></html>`;
}
