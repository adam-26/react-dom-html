// @flow
import {isValidElement} from "react";
import {renderHtml as render, hydrateHtml as hydrate, getAppContainerProps} from "react-dom-html";
import HtmlMetadata from "./HtmlMetadata";
import {error, HTML_TAGS_HYDRATE_ATTR, forEachQuerySelectorAll} from "./util";
import {withHtmlProvider, createHeadChildren} from "./components/componentUtil";
import type {Node} from "react";
import type {RootElement} from "./flowTypes";

const IS_DEV = process.env.NODE_ENV;

function removeHeadElements(
    headDomNode,
    defaultSelector: string,
    additionalSelectors?: Array | string = []
) {
    const removedElements = [];
    const selectors = [defaultSelector];
    if (typeof additionalSelectors === "string") {
        selectors.push(additionalSelectors);
    } else if (Array.isArray(additionalSelectors) && additionalSelectors.length !== 0) {
        [].push.apply(selectors, additionalSelectors);
    }

    // Remove the element(s) from <head>
    forEachQuerySelectorAll(headDomNode, selectors.join(", "), tag => {
        removedElements.push(headDomNode.removeChild(tag));
    });

    return removedElements;
}

export function hydrateHtml(element: RootElement, options?: Object = {}) {
    let serverSnapshot;
    if (IS_DEV) {
        serverSnapshot = takeAttributeSnapshot();
    }

    const headDomNode = document.querySelector("head");
    const htmlMetadata = HtmlMetadata.createForClientHydrate();
    const {
        container,
        callback,
        externalHeadElementSelectors,
        hydratedHeadElementSelectors
    } = options;

    return prepareForRender(htmlMetadata, element, container, (rootElement, appContainer) => {
        // Remove any "ignored" html tags from the <head> element
        // - required to support head elements outside of the react lifecycle
        // - react will remove them as part of the render lifecycle
        // - removing them here allows react to hydrate without warnings
        const externalHeadTags = removeHeadElements(
            headDomNode,
            `[${HTML_TAGS_HYDRATE_ATTR}='false']`,
            externalHeadElementSelectors
        );

        // === 2 phase hydrate - same order as server render should prevent hydration warnings ===:
        // 1. hydrate the app
        // 2. hydrate the <head>
        hydrate(rootElement, appContainer, () => {
            // Remove any "hydrated" <head> elements after application is rendered
            // - required to prevent hydrated head elements being removed when we mount <head>
            // - these elements are re-applied to <head> after mounting
            const hydratedHeadTags = removeHeadElements(
                headDomNode,
                `[${HTML_TAGS_HYDRATE_ATTR}='true']`,
                hydratedHeadElementSelectors
            );

            hydrate(createHeadChildren(rootElement, htmlMetadata), headDomNode, () => {
                // After hydrating the head - re-apply any DOM nodes that were previously removed
                if (hydratedHeadTags.length > 0) {
                    hydratedHeadTags.forEach(tag => headDomNode.appendChild(tag));
                }

                if (externalHeadTags.length > 0) {
                    externalHeadTags.forEach(tag => headDomNode.appendChild(tag));
                }

                if (IS_DEV) {
                    const clientSnapshot = takeAttributeSnapshot();
                    compareSnapshots(serverSnapshot, clientSnapshot);
                }

                if (callback) {
                    callback();
                }
            });
        });
    });
}

export function renderHtml(element: RootElement, options?: Object = {}) {
    const htmlMetadata = HtmlMetadata.createForClientRender();
    const {container, callback, externalHeadElementSelectors} = options;

    if (externalHeadElementSelectors) {
        htmlMetadata.appendExternalHeadSelectors(externalHeadElementSelectors);
    }

    return prepareForRender(htmlMetadata, element, container, (rootElement, appContainer) => {
        render(rootElement, appContainer, callback);
    });
}

function prepareForRender(htmlMetadata, element, container, renderCallback) {
    const rootElement = withHtmlProvider(element, htmlMetadata);
    const appContainer =
        container ||
        document.querySelector(
            getAppContainerProps(isValidElement(element) ? element : rootElement).querySelector
        );

    // Assign the container to the html metadata
    // - required for updating appContainer attributes
    htmlMetadata.setAppContainer(appContainer);

    // Invoke the render
    renderCallback(rootElement, appContainer);

    return () => {
        // Release the ref to the container DOM node
        htmlMetadata.setAppContainer(null);
    };
}

function compareSnapshots(serverSnapshot, clientSnapshot) {
    if (serverSnapshot.htmlAttributes !== clientSnapshot.htmlAttributes) {
        error(
            `Warning: The hydrated html attributes do not match. Server: ` +
                `\`${serverSnapshot.htmlAttributes}\` Client: \`${clientSnapshot.htmlAttributes}\`.`
        );
    }

    if (serverSnapshot.bodyAttributes !== clientSnapshot.bodyAttributes) {
        error(
            `Warning: The hydrated body attributes do not match. Server: ` +
                `\`${serverSnapshot.bodyAttributes}\` Client: \`${clientSnapshot.bodyAttributes}\`.`
        );
    }
}

function takeAttributeSnapshot() {
    return {
        htmlAttributes: snapshotAttributes(document.querySelector("html")),
        bodyAttributes: snapshotAttributes(document.querySelector("body"))
    };
}

// From MDN: https://developer.mozilla.org/en-US/docs/Web/API/Element/className
// The name className is used for this property instead of class because of conflicts with
// the "class" keyword in many languages which are used to manipulate the DOM.
const ATTRIBUTE_NAME_MAP = {
    classname: "class",
    className: "class"
};

function snapshotAttributes(element) {
    if (!element || !element.hasAttributes()) {
        return "";
    }

    const attributes = {};
    const elementAttributes = element.attributes;
    for (let i = elementAttributes.length - 1; i >= 0; i--) {
        attributes[elementAttributes[i].name] = elementAttributes[i].value;
    }

    return Object.keys(attributes)
        .sort()
        .reduce((snapshot, attributeName) => {
            const attributeValue = attributes[attributeName];
            if (typeof attributeValue !== "undefined") {
                snapshot.push(
                    `${ATTRIBUTE_NAME_MAP[attributeName] || attributeName}="${attributeValue}"`
                );
            }

            return snapshot;
        }, [])
        .join(" ");
}
