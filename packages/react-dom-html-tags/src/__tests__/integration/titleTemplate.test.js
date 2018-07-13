import React from "react";
import {withHtml, Html} from "../../../lib";
import {testSet, runTestSets, Container} from "./testHarness";
// =========== TEST SETS ===========

// Tests that verify title templates are correctly combined and the last title value is applied to those templates
// Where multiple title templates are defined, they will be concatenated to produce the final template
function titleTemplateTestSets(testSetName) {
    const createHtmlHOC = (titleTemplate, defaultTitle) => {
        return withHtml(() => (
            <html>
                <head>
                    <title template={titleTemplate}>{defaultTitle}</title>
                </head>
            </html>
        ))(Container);
    };

    const createHeadHOC = (titleTemplate, defaultTitle) => {
        return withHtml(() => (
            <head>
                <title template={titleTemplate}>{defaultTitle}</title>
            </head>
        ))(Container);
    };

    const createHtml = (titleTemplate, defaultTitle) => {
        return ({children}) => (
            <Html>
                <head>
                    <title template={titleTemplate}>{defaultTitle}</title>
                </head>
                <app>
                    <div>{children}</div>
                </app>
            </Html>
        );
    };

    const createHtmlWithBody = (titleTemplate, defaultTitle) => {
        return ({children}) => (
            <Html>
                <head>
                    <title template={titleTemplate}>{defaultTitle}</title>
                </head>
                <body>
                    <app>
                        <div>{children}</div>
                    </app>
                </body>
            </Html>
        );
    };

    const titleTemplateComponentFactory = createComponent => {
        return {
            createRoot: () => createComponent(title => `${title} | Root Template`, "Root Title"),
            createTopSibling: () =>
                createComponent(title => `${title} | Top Sibling Template`, "Top Sibling Title"),
            createBottomSibling: () =>
                createComponent(
                    title => `${title} | Bottom Sibling Template`,
                    "Bottom Sibling Title"
                ),
            createTopSiblingChild: () =>
                createComponent(
                    title => `${title} | Top Sibling Child Template`,
                    "Top Sibling Child Title"
                ),
            createBottomSiblingChild: () =>
                createComponent(
                    title => `${title} | Bottom Sibling Child Template`,
                    "Bottom Sibling Child Title"
                ),
            createLastChild: () =>
                createComponent(title => `${title} | Rendered Template`, "Rendered Title") // this is used to set expectations
        };
    };

    return [
        // withHtml() HOC tests
        testSet(
            testSetName,
            "withHtml > html > head",
            titleTemplateComponentFactory(createHtmlHOC)
        ),
        testSet(testSetName, "withHtml > head", titleTemplateComponentFactory(createHeadHOC)),

        // <Html> component tests
        testSet(testSetName, "Html > head | app", titleTemplateComponentFactory(createHtml)),
        testSet(
            testSetName,
            "Html > head | body > app",
            titleTemplateComponentFactory(createHtmlWithBody)
        )
    ];
}

runTestSets(titleTemplateTestSets("title template"));
