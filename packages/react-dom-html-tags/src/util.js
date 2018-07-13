// @flow
import React from "react";

const IS_DEV = process.env.NODE_ENV !== "production";

// TODO: Rename the attribute? value can be true/false (before/after main hydrate usage + it can be used for external on normal client render)
export const HTML_TAGS_HYDRATE_ATTR = "data-react-dom-html-tags";

export function message(msg) {
    return `[react-dom-html-tags] ${msg}`;
}

export function warn(msg) {
    if (IS_DEV) {
        // eslint-disable-next-line no-console
        console.warn(message(msg));
    }
}

export function error(msg) {
    if (IS_DEV) {
        // eslint-disable-next-line no-console
        console.error(message(msg));
    }
}

export function forEachQuerySelectorAll(domNode, selector, eachCallback) {
    const nodes = domNode.querySelectorAll(selector);
    if (!nodes || nodes.length === 0) {
        return;
    }

    for (let i = 0, len = nodes.length; i < len; i++) {
        eachCallback(nodes[i]);
    }
}

export function getDomElementAttributeNames(domElement) {
    if (typeof domElement.getAttributeNames === "function") {
        return domElement.getAttributeNames();
    }

    // TODO: Test this works in IE
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttributeNames
    const attributes = domElement.attributes;
    const length = attributes.length;
    const result = new Array(length);
    for (let i = 0; i < length; i++) {
        result[i] = attributes[i].name;
    }

    return result;
}

export function reduceAttributes(attributes?: Object = {}, defaultValues?: Object = {}) {
    return Object.keys(attributes).reduce((renderAttributes, attributeName) => {
        const attributeValues = attributes[attributeName];
        renderAttributes[attributeName] = Array.isArray(attributeValues)
            ? attributeValues.join(" ")
            : attributeValues;

        return renderAttributes;
    }, defaultValues);
}

export function reduceAttributesToString(attributes?: Object = {}) {
    return Object.keys(attributes).reduce((str, attributeName) => {
        const attributeValue = attributes[attributeName];
        if (typeof attributeValue === "undefined") {
            return str;
        }

        return `${str} ${attributeName}="${attributeValue}"`;
    }, "");
}

export function renderForError(elementName, {children, ...attributes}) {
    const attrString = reduceAttributesToString(attributes, true);
    if (children) {
        return `<${elementName}${attrString}>${children}</${elementName}>`;
    }

    return `<${elementName}${attrString} />`;
}
