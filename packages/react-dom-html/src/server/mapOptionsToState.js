// @flow
import {createElement, cloneElement, Children, isValidElement} from "react";
import invariant from "invariant";
import {
    warn,
    message,
    HTML_TAG,
    HEAD_TAG,
    BODY_TAG,
    APP_TAG,
    createAppContainerElement,
    resolveOptionalElement
} from "./serverUtil";

const VALID_ROOT_CHILD_TAGS = [HTML_TAG];
const VALID_HTML_CHILD_TAGS = [HEAD_TAG, BODY_TAG];

function resolveHtml(child, htmlState, options) {
    const {children: nestedChildren, ...childProps} = child.props;
    htmlState.htmlElement = createElement(HTML_TAG, childProps);

    if (nestedChildren && Children.count(nestedChildren) > 0) {
        Children.forEach(nestedChildren, nestedChild => {
            htmlState = resolveHtmlElement(nestedChild, htmlState, VALID_HTML_CHILD_TAGS, options);
        });
    }

    return htmlState;
}

function resolveBody(child, htmlState, options) {
    const {children: nestedChildren, ...childProps} = child.props;
    htmlState.bodyElement = createElement(BODY_TAG, childProps);

    let idx = 0;
    let hasResolvedAppContainer = false;
    htmlState.beforeAppContainerElement = [];
    htmlState.afterAppContainerElement = [];

    Children.forEach(nestedChildren, nestedChild => {
        if (nestedChild.type === APP_TAG) {
            resolveApp(nestedChild, htmlState, options);
            hasResolvedAppContainer = true;
        } else if (!hasResolvedAppContainer) {
            htmlState.beforeAppContainerElement.push(cloneElement(nestedChild, {key: idx++}));
        } else {
            htmlState.afterAppContainerElement.push(cloneElement(nestedChild, {key: idx++}));
        }
    });

    return htmlState;
}

function resolveApp(child, htmlState, options) {
    // does <app> permit children?
    const {children: nestedChildren, ...childProps} = child.props;
    const allowedChildren = options.allowAppContainerChildren;
    if (!allowedChildren && Children.count(nestedChildren) !== 0) {
        throw new Error(message("<app> does not support the use of children."));
    }

    // Do not set "id" value on <app>
    if (typeof childProps.id !== "undefined") {
        warn(
            `Setting 'id=\"${
                childProps.id
            }\"' on the <app> tag may have unintended consequences. You should set the "id" before initial render.`
        );
    }

    // Only assign the props here
    htmlState.appContainerProps = childProps;
    if (allowedChildren && nestedChildren) {
        htmlState.appContainerProps.children = nestedChildren;
    }

    return htmlState;
}

function resolveHead(child, htmlState) {
    // <head> keeps it children for rendering
    htmlState.headElement = child;
    return htmlState;
}

function resolveHtmlElement(children, htmlState, validTagNames, options) {
    const child = Children.only(children);
    const childType = child.type;

    if (validTagNames.indexOf(childType) !== -1) {
        if (childType === HTML_TAG) {
            return resolveHtml(child, htmlState, options);
        }

        if (childType === HEAD_TAG) {
            return resolveHead(child, htmlState);
        }

        if (childType === BODY_TAG) {
            return resolveBody(child, htmlState, options);
        }
    }

    throw new Error(
        message(`Invalid html markup, tag "${childType}" is not supported in its current position.`)
    );
}

export function assignOptions(defaultOptions, options) {
    const definedOptions = Object.keys(options).reduce((opts, key) => {
        const optionValue = options[key];
        if (typeof optionValue !== "undefined" && options.hasOwnProperty(key)) {
            opts[key] = optionValue;
        }

        return opts;
    }, {});

    return Object.assign({}, defaultOptions, definedOptions);
}

const defaultElements = {
    htmlElement: createElement(HTML_TAG),
    headElement: createElement(HEAD_TAG),
    bodyElement: createElement(BODY_TAG)
};

export default function mapOptionsToState(element, options) {
    const {
        // html element options
        html,
        appContainerTagName,
        // undocumented options
        htmlElements,
        allowAppContainerChildren,
        // other options
        ...otherOpts
    } = options;

    // If a `html` element is provided, it takes priority
    if (html) {
        const htmlEl = resolveOptionalElement(html);
        invariant(isValidElement(htmlEl), "`html` is required to be a react element.");
        const opts = {
            allowAppContainerChildren:
                typeof allowAppContainerChildren === "boolean" ? allowAppContainerChildren : false
        };

        const {appContainerProps, ...state} = resolveHtmlElement(
            htmlEl,
            {},
            VALID_ROOT_CHILD_TAGS,
            opts
        );
        state.appContainerElement = createAppContainerElement(
            element,
            appContainerTagName,
            appContainerProps
        );

        if (typeof state.headElement === "undefined") {
            state.headElement = createElement(HEAD_TAG);
        }

        return assignOptions(defaultElements, {
            ...otherOpts,
            ...state
        });
    }

    if (htmlElements) {
        const {
            htmlElement,
            bodyElement,
            headElement,
            appContainerElement,
            beforeAppContainerElement,
            afterAppContainerElement
        } =
            typeof htmlElements === "function" ? htmlElements() : htmlElements;

        return assignOptions(defaultElements, {
            ...otherOpts,
            htmlElement,
            bodyElement,
            headElement,
            beforeAppContainerElement,
            afterAppContainerElement,
            appContainerElement:
                appContainerElement || createAppContainerElement(element, appContainerTagName)
        });
    }

    return Object.assign(
        {
            appContainerElement: createAppContainerElement(element, appContainerTagName)
        },
        defaultElements,
        otherOpts
    );
}
