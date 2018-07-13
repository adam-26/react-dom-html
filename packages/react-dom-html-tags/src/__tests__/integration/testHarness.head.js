// @flow
import React, {createElement} from "react";
import {withHtml, Html} from "../../../lib";
import {Container, testSet} from "./testHarness";

// Tests that head values correct append or replace
export function headTestSets(testAction, tagName, getPropsFunc, testPropDecsriptor) {
    const createHtmlHOC = props => {
        return withHtml(() => (
            <html>
                <head>{createElement(tagName, props)}</head>
            </html>
        ))(Container);
    };

    const createHeadHOC = props => {
        return withHtml(() => <head>{createElement(tagName, props)}</head>)(Container);
    };

    const createHtml = props => {
        return ({children}) => (
            <Html>
                <head>{createElement(tagName, props)}</head>
                <app>
                    <div>{children}</div>
                </app>
            </Html>
        );
    };

    const createHtmlWithBody = props => {
        return ({children}) => (
            <Html>
                <head>{createElement(tagName, props)}</head>
                <body>
                    <app>
                        <div>{children}</div>
                    </app>
                </body>
            </Html>
        );
    };

    const titleComponentFactory = createComponent => {
        return {
            createRoot: () => createComponent(getPropsFunc("Root")),
            createTopSibling: () => createComponent(getPropsFunc("Top Sibling Title")),
            createBottomSibling: () => createComponent(getPropsFunc("Bottom Sibling")),
            createTopSiblingChild: () => createComponent(getPropsFunc("Top Sibling Child")),
            createBottomSiblingChild: () => createComponent(getPropsFunc("Bottom Sibling Child")),
            createLastChild: () => createComponent(getPropsFunc("Rendered"))
        };
    };

    const testSetDescriptions = [testAction, tagName + " tag"];
    if (testPropDecsriptor) {
        testSetDescriptions.push(testPropDecsriptor);
    }

    return [
        // withHtml() HOC tests
        testSet(
            testSetDescriptions,
            "withHtml > html > head",
            titleComponentFactory(createHtmlHOC)
        ),
        testSet(testSetDescriptions, "withHtml > head", titleComponentFactory(createHeadHOC)),

        // <Html> component tests
        testSet(testSetDescriptions, "Html > head | app", titleComponentFactory(createHtml)),
        testSet(
            testSetDescriptions,
            "Html > head | body > app",
            titleComponentFactory(createHtmlWithBody)
        )
    ];
}
