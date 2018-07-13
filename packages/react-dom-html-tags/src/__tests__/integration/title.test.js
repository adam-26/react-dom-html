import React from "react";
import {withHtml, Html} from "../../../lib";
import {testSet, runTestSets, Container} from "./testHarness";
// =========== TEST SETS ===========

// Tests to verify that the title text is correctly overwritten by child title's
function titleTestSets(testSetName) {
    const createHtmlHOC = titleText => {
        return withHtml(() => (
            <html>
                <head>
                    <title>{titleText}</title>
                </head>
            </html>
        ))(Container);
    };

    const createHeadHOC = titleText => {
        return withHtml(() => (
            <head>
                <title>{titleText}</title>
            </head>
        ))(Container);
    };

    const createHtml = titleText => {
        return ({children}) => (
            <Html>
                <head>
                    <title>{titleText}</title>
                </head>
                <app>
                    <div>{children}</div>
                </app>
            </Html>
        );
    };

    const createHtmlWithBody = (titleText = "Rendered Title") => {
        return ({children}) => (
            <Html>
                <head>
                    <title>{titleText}</title>
                </head>
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
            createRoot: () => createComponent("Root Title"),
            createTopSibling: () => createComponent("Top Sibling Title"),
            createBottomSibling: () => createComponent("Bottom Sibling Title"),
            createTopSiblingChild: () => createComponent("Top Sibling Child Title"),
            createBottomSiblingChild: () => createComponent("Bottom Sibling Child Title"),
            createLastChild: () => createComponent("Rendered Title") // this is used to set expectations
        };
    };

    return [
        // withHtml() HOC tests
        testSet(testSetName, "withHtml > html > head", titleComponentFactory(createHtmlHOC)),
        testSet(testSetName, "withHtml > head", titleComponentFactory(createHeadHOC)),

        // <Html> component tests
        testSet(testSetName, "Html > head | app", titleComponentFactory(createHtml)),
        testSet(testSetName, "Html > head | body > app", titleComponentFactory(createHtmlWithBody))
    ];
}

runTestSets(titleTestSets("title"));
