import React, {createElement} from "react";
import {withHtml, Html} from "../../../lib";
import {TAG_NAMES} from "../../constants";
import {testSet, runTestSets, Container} from "./testHarness";
// =========== TEST SETS ===========

// Tests to verify that attributes with same names are merged - className
function mergeAttributeTestSets(htmlTagName, attributeName) {
    const isHtmlTag = htmlTagName === TAG_NAMES.HTML;
    const isHeadTag = htmlTagName === TAG_NAMES.HEAD;
    const isBodyTag = htmlTagName === TAG_NAMES.BODY;
    const isAppTag = htmlTagName === TAG_NAMES.APP;

    const createHtmlHOC = attributes => {
        return withHtml(() => (
            <html {...(isHtmlTag ? attributes : {})}>
                {(!isHtmlTag && createElement(htmlTagName, attributes)) || null}
            </html>
        ))(Container);
    };

    // This test is NOT run when the htmlTagName === HTML
    const createHeadHOC = attributes => {
        return withHtml(() => createElement(htmlTagName, attributes))(Container);
    };

    const createHtml = attributes => {
        return ({children}) => (
            <Html {...(isHtmlTag ? attributes : {})}>
                <head {...(isHeadTag ? attributes : {})} />
                <app {...(isAppTag ? attributes : {})}>
                    <div>{children}</div>
                </app>
            </Html>
        );
    };

    const createHtmlWithBody = attributes => {
        return ({children}) => (
            <Html {...(isHtmlTag ? attributes : {})}>
                <head {...(isHeadTag ? attributes : {})} />
                <body {...(isBodyTag ? attributes : {})}>
                    <app {...(isAppTag ? attributes : {})}>
                        <div>{children}</div>
                    </app>
                </body>
            </Html>
        );
    };

    const componentFactory = createComponent => {
        return {
            // Each component should assign a DIFFERENT attribute
            createRoot: () => createComponent({[attributeName]: "root"}),
            createTopSibling: () => createComponent({[attributeName]: "topSibling"}),
            createBottomSibling: () => createComponent({[attributeName]: "bottomSibling"}),
            createTopSiblingChild: () => createComponent({[attributeName]: "topSiblingChild"}),
            createBottomSiblingChild: () =>
                createComponent({[attributeName]: "bottomSiblingChild"}),
            createLastChild: () => createComponent({[attributeName]: "rendered"})
        };
    };

    const testSetName = `merge ${htmlTagName}Attributes`;
    return [
        // withHtml() HOC tests
        testSet(testSetName, "withHtml > html > head", componentFactory(createHtmlHOC)),
        testSet(testSetName, "withHtml > head", componentFactory(createHeadHOC)),

        // <Html> component tests
        testSet(testSetName, "Html > head | body > app", componentFactory(createHtmlWithBody)),

        // No body attribute exists for assigning body attribute values
        isBodyTag ? false : testSet(testSetName, "Html > head | app", componentFactory(createHtml))
    ].filter(item => item !== false);
}

runTestSets(
    mergeAttributeTestSets("html", "className"),
    mergeAttributeTestSets("head", "className"),
    mergeAttributeTestSets("body", "className"),
    mergeAttributeTestSets("app", "className")
);
