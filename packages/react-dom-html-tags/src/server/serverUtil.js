// @flow
import {createElement, isValidElement} from "react";
// NOTE: This import will be replaced @ build-time to use "react-dom-html-tags"
import {createHeadChildren} from "../index.js";

export function message(msg) {
    return `[react-dom-html-tags/server] ${msg}`;
}

export function error(msg) {
    // eslint-disable-next-line no-console
    console.error(message(msg));
}

export function getAppElement(htmlProvider, element) {
    return isValidElement(element) ? element : htmlProvider;
}

// TODO: Remove this func... and all usages of it - its now done in the react-dom-html pkg
// Use callback to create react elements after the main application is rendered
export function resolveOptionalElement(element) {
    return !isValidElement(element) && typeof element === "function" ? element() : element;
}

export function getRenderOptions(
    renderFunctionName,
    isStaticMarkup,
    element, // The original react element passed to the render method
    metadata,
    options?: Object = {}
) {
    const {
        appContainerTagName,
        appContainerId,
        beforeAppContainer,
        afterAppContainer,
        ...otherOptions
    } = options;

    // Update the metadata state
    metadata.setStaticServerRender(isStaticMarkup);

    if (metadata._hasSerializedState()) {
        // === use serialized state to perform the render ===
        const {
            appTagName,
            htmlAttributes,
            bodyAttributes,
            appAttributes,
            head
        } = metadata._getSerializedState();

        return {
            ...otherOptions,
            htmlElement: createElement("html", htmlAttributes),
            bodyElement: createElement("body", bodyAttributes),
            headElement: head,
            headIsReactRoot: true,
            appContainerElement: createElement(appTagName, appAttributes),
            beforeAppContainerElement: resolveOptionalElement(beforeAppContainer),
            afterAppContainerElement: resolveOptionalElement(afterAppContainer)
        };
    }

    const {
        appTagName,
        htmlAttributes,
        headAttributes,
        bodyAttributes,
        appAttributes
    } = metadata.getServerAttributes(element, {appContainerTagName, appContainerId});

    return {
        ...otherOptions,
        htmlElement: createElement("html", htmlAttributes),
        bodyElement: createElement("body", bodyAttributes),
        headElement: createElement("head", headAttributes, createHeadChildren(element, metadata)),
        headIsReactRoot: true,
        appContainerElement: createElement(appTagName, appAttributes),
        beforeAppContainerElement: resolveOptionalElement(beforeAppContainer),
        afterAppContainerElement: resolveOptionalElement(afterAppContainer)
    };
}
