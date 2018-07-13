/*
 * Copyright 2018 @adam-26.
 * Copyrights licensed under the MIT License.
 * See the accompanying LICENSE file for terms.
 */

import { render, hydrate } from 'react-dom';

var DEFAULT_APP_ELEMENT_ID = "app";


function defaultTo(getter, value) {
    if (typeof getter === "function") {
        return getter();
    }

    return value;
}

function getAppContainerProps() {
    var rootElement = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var appContainerTagName = options.appContainerTagName,
        appContainerId = options.appContainerId;

    var type = rootElement === null ? null : rootElement.type;
    var elementId = appContainerId || defaultTo(type && type.getAppContainerId, DEFAULT_APP_ELEMENT_ID);

    return {
        tagName: appContainerTagName || defaultTo(type && type.getAppContainerTagName, "div"),
        id: elementId,
        querySelector: "#" + elementId
    };
}

function getAppContainer(element) {
    return document.querySelector(getAppContainerProps(element).querySelector);
}

function hydrateHtml(element, container, callback) {
    if (typeof container === "function" && typeof callback === "undefined") {
        callback = container;
        container = null;
    }

    hydrate(element, container || getAppContainer(element), callback);
}

function renderHtml(element, container, callback) {
    if (typeof container === "function" && typeof callback === "undefined") {
        callback = container;
        container = null;
    }

    render(element, container || getAppContainer(element), callback);
}

export { renderHtml, hydrateHtml, getAppContainerProps };
