// @flow
import React, {Children} from "react";
import createHtmlHOC from "./HtmlHOC";
import {TAG_NAMES, HTML_CHILD_TAG_KEYS} from "../constants";
import mapHtmlToState from "../mapHtmlToState";
import {Consumer as HtmlContextConsumer} from "./HtmlContextComponents";
import {message} from "../util";

const IS_PROD = process.env.NODE_ENV;
const HTML = TAG_NAMES.HTML;
const BODY = TAG_NAMES.BODY;
const APP = TAG_NAMES.APP;

const VALID_BODY_CHILDREN = [APP];

function findAppElement({children}, validTagKeys) {
    let appTag = null;
    Children.forEach(children, child => {
        if (!IS_PROD) {
            if (child === null || validTagKeys.indexOf(child.type) === -1) {
                const elementName = child === null ? "`null`" : `<${child.type}>`;
                throw new Error(
                    `Html element ${elementName} is not supported, only <head>, <body> and <app> are allowed to be used as immediate children.`
                );
            }
        }

        if (appTag || child === null) {
            return;
        }

        if (child.type === BODY) {
            appTag = findAppElement(child.props, VALID_BODY_CHILDREN);
        } else if (child.type === APP) {
            appTag = child;
        }
    });

    return appTag;
}

function findApplicationChildren(props) {
    const appElement = findAppElement(props, HTML_CHILD_TAG_KEYS);

    /*
    Reasoning on requiring <app> children:
     - <Html> is used to apply metadata to applications
     - I can think of no reason to define metadata at a tree leaf
     - It should encourage use of a standard pattern when using <Html>
     */
    if (!appElement) {
        throw new Error(
            message(
                "<Html> requires an <app> element. It can be an immediate child, or a child of <body>."
            )
        );
    }

    const appChildChildren = appElement.props.children;
    if (!appChildChildren || Children.count(appChildChildren) === 0) {
        throw new Error(message("<Html> requires the <app> element to have children."));
    }

    return appChildChildren;
}

const HtmlHOC = createHtmlHOC(({htmlElement}, options) =>
    mapHtmlToState(htmlElement, {...options, permitAppChildren: true})
);

export default function Html(props) {
    const appChildren = findApplicationChildren(props);

    // eslint-disable-next-line react/prop-types
    const {children, ...htmlAttributes} = props;
    const htmlElement = React.createElement(HTML, htmlAttributes, children);

    return (
        <HtmlContextConsumer>
            {htmlContext => (
                <HtmlHOC htmlElement={htmlElement} htmlContext={htmlContext}>
                    {appChildren || null}
                </HtmlHOC>
            )}
        </HtmlContextConsumer>
    );
}
