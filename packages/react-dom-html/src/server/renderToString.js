// @flow
import React from "react";
import {renderToStaticMarkup, renderToString} from "react-dom/server";
import mapOptionsToState from "./mapOptionsToState";
import {renderStaticOpeningTagFromElement} from "./serverUtil";
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
        afterAppContainerElement
    } = mapOptionsToState(element, options);

    const openingHtmlTag = renderStaticOpeningTagFromElement(htmlElement);
    const openingBodyTag = renderStaticOpeningTagFromElement(bodyElement);
    const openingAppTag = renderStaticOpeningTagFromElement(appContainerElement);

    // The head may be assigned as a pre-rendered string
    const headTag =
        typeof headElement === "string"
            ? headElement
            : isStaticMarkup
                ? renderToStaticMarkup(headElement)
                : renderToString(headElement);
    const beforeAppContainerMarkup = beforeAppContainerElement
        ? renderToStaticMarkup(beforeAppContainerElement)
        : "";
    const afterAppContainerMarkup = afterAppContainerElement
        ? renderToStaticMarkup(afterAppContainerElement)
        : "";

    return `${openingHtmlTag}${headTag}${openingBodyTag}${beforeAppContainerMarkup}${openingAppTag}${appMarkup}</${
        appContainerElement.type
    }>${afterAppContainerMarkup}</body></html>`;
}
