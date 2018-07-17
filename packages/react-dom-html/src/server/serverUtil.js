// @flow
import React, {isValidElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {createElement} from "react";
import {getAppContainerProps} from "../util";

const IS_DEV = process.env.NODE_ENV !== "production";

export const HTML5_DOCTYPE = "<!DOCTYPE html>";
export const HTML_TAG = "html";
export const HEAD_TAG = "head";
export const BODY_TAG = "body";
export const APP_TAG = "app";

export function warn(msg) {
    if (IS_DEV) {
        console.warn(message(msg));
    }
}

export function message(msg) {
    return `[react-dom-html] ${msg}`;
}

// Use callback to create react elements after the main application is rendered
export function resolveOptionalElement(element) {
    return !isValidElement(element) && typeof element === "function" ? element() : element;
}
export function renderStaticOpeningTagFromElement(element) {
    const markup = renderToStaticMarkup(element);
    return markup.substring(0, markup.length - (element.type.length + 3));
}

export function resolveAndRenderStaticOpeningTag(element) {
    return renderStaticOpeningTagFromElement(resolveOptionalElement(element));
}

export function createAppContainerElement(
    rootElement,
    appContainerTagName: string,
    appContainerProps?: Object = {}
) {
    const {id, children, ...appContainerAttributes} = appContainerProps;
    const {tagName, id: containerId} = getAppContainerProps(rootElement, {
        appContainerTagName: appContainerTagName,
        appContainerId: id
    });

    return createElement(tagName, {id: containerId, ...appContainerAttributes}, children);
}
