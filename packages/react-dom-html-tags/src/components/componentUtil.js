// @flow
import React, {createElement, isValidElement} from "react";
import HeadFragment from "./HeadFragment";
import HtmlProvider from "./HtmlProvider";
import HeadContainer from "./HeadContainer";
import {message} from "../util";

const IS_DEV = process.env.NODE_ENV !== "production";

export function createHeadChildren(rootElement, metadata) {
    const rootElementType = rootElement.type || {};
    const headFragment =
        typeof rootElementType.getHeadFragment === "function" // 1. check for static method on root element
            ? rootElementType.getHeadFragment()
            : rootElementType === HtmlProvider // 2. check for prop assigned to <HtmlProvider>
                ? rootElement.props.headFragment
                : HeadFragment; // 3. fallback

    if (IS_DEV) {
        // Required to verify that the render used the correct head fragment
        metadata.setRenderedHeadFragment(headFragment);
    }

    return createElement(HeadContainer, {metadata: metadata}, headFragment);
}

export function withHtmlProvider(element, metadata) {
    if (isValidElement(element)) {
        return <HtmlProvider metadata={metadata}>{element}</HtmlProvider>;
    }

    if (typeof element === "function") {
        return element(metadata);
    }

    throw new Error(
        message("Root element must be React element or function that returns a React element")
    );
}
