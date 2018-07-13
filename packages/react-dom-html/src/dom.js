// @flow
import {render, hydrate} from "react-dom";
import {getAppContainerProps} from "./util";
import type {ElementType} from "./flowTypes";

export function getAppContainer(element) {
    return document.querySelector(getAppContainerProps(element).querySelector);
}

export function hydrateHtml(element: ElementType, container, callback) {
    if (typeof container === "function" && typeof callback === "undefined") {
        callback = container;
        container = null;
    }

    hydrate(element, container || getAppContainer(element), callback);
}

export function renderHtml(element: ElementType, container, callback) {
    if (typeof container === "function" && typeof callback === "undefined") {
        callback = container;
        container = null;
    }

    render(element, container || getAppContainer(element), callback);
}
