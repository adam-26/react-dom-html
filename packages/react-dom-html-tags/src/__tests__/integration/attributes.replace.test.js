import React, {createElement} from "react";
import {withHtml, Html} from "../../../lib";
import {TAG_NAMES} from "../../constants";
import {testSet, runTestSets, Container} from "./testHarness";
// =========== TEST SETS ===========

// Tests to verify attributes with the same name replace parent values (excludes "className" attributes)
function replaceAttributeTestSets(htmlTagName) {
    const isHtmlTag = htmlTagName === TAG_NAMES.HTML;
    const isHeadTag = htmlTagName === TAG_NAMES.HEAD;
    const isBodyTag = htmlTagName === TAG_NAMES.BODY;
    const isAppTag = htmlTagName === TAG_NAMES.APP;

    const createHtmlHOC = langCode => {
        return withHtml(() => (
            <html {...(isHtmlTag ? {lang: langCode} : {})}>
                {(!isHtmlTag && createElement(htmlTagName, {lang: langCode})) || null}
            </html>
        ))(Container);
    };

    // This test is NOT run when the htmlTagName === HTML
    const createHeadHOC = langCode => {
        return withHtml(() => createElement(htmlTagName, {lang: langCode}))(Container);
    };

    const createHtml = langCode => {
        return ({children}) => (
            <Html {...(isHtmlTag ? {lang: langCode} : {})}>
                <head {...(isHeadTag ? {lang: langCode} : {})} />
                <app {...(isAppTag ? {lang: langCode} : {})}>
                    <div>{children}</div>
                </app>
            </Html>
        );
    };

    const createHtmlWithBody = langCode => {
        return ({children}) => (
            <Html {...(isHtmlTag ? {lang: langCode} : {})}>
                <head {...(isHeadTag ? {lang: langCode} : {})} />
                <body {...(isBodyTag ? {lang: langCode} : {})}>
                    <app {...(isAppTag ? {lang: langCode} : {})}>
                        <div>{children}</div>
                    </app>
                </body>
            </Html>
        );
    };

    const componentFactory = createComponent => {
        return {
            createRoot: () => createComponent("Root"),
            createTopSibling: () => createComponent("TopSibling"),
            createBottomSibling: () => createComponent("BottomSibling"),
            createTopSiblingChild: () => createComponent("TopSiblingChild"),
            createBottomSiblingChild: () => createComponent("BottomSiblingChild"),
            createLastChild: () => createComponent("Rendered")
        };
    };

    const testSetName = `replace ${htmlTagName}Attributes`;
    const testSets = [
        // withHtml() HOC tests
        testSet(testSetName, "withHtml > html > head", componentFactory(createHtmlHOC)),

        // <Html> component tests
        testSet(testSetName, "Html > head | body > app", componentFactory(createHtmlWithBody))
    ];

    if (!isHtmlTag) {
        // withHtml() HOC tests
        testSets.push(testSet(testSetName, "withHtml > head", componentFactory(createHeadHOC)));
    }

    if (!isBodyTag) {
        // <Html> component tests
        testSet(testSetName, "Html > head | app", componentFactory(createHtml));
    }

    return testSets;
}

runTestSets(
    replaceAttributeTestSets("html"),
    replaceAttributeTestSets("head"),
    replaceAttributeTestSets("body"),
    replaceAttributeTestSets("app")
);
