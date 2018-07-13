import {mount} from "../enzyme"; // Mount works w/createPortal() client rendering
import React from "react";
import {withHtml, Html, HtmlMetadata, withHtmlProvider} from "../../../lib";
import {renderHtmlToString, renderHtmlToStaticMarkup} from "../../../lib/server";

function verifySnapshotsAndReturn(html, metadata, element) {
    const attributes = metadata.isServerRender()
        ? metadata.getServerAttributes(element)
        : metadata.getAttributes();

    const components = metadata.getHeadComponents();

    expect(html).toMatchSnapshot();
    expect(attributes).toMatchSnapshot();
    expect(components).toMatchSnapshot();

    return {
        html,
        attributes,
        components
    };
}

function verifyClientRender(element) {
    const md = HtmlMetadata.createForClientRender();
    const rootElement = withHtmlProvider(element, md);

    // Create an appContainer node for mounting the app
    const appContainerNode = global.document.createElement("div");
    global.document.body.appendChild(appContainerNode);

    if (!appContainerNode) {
        throw new Error("No appContainer node :(");
    }

    // note: client tests require an assigned "appContainer"
    md.setAppContainer(appContainerNode);

    const tree = mount(rootElement, {attachTo: appContainerNode});

    const result = verifySnapshotsAndReturn(tree.html(), md, element);

    // Cleanup
    tree.unmount();
    tree.detach();
    global.document.body.removeChild(appContainerNode);
    return result;
}

function verifyServerStringRender(element) {
    const md = HtmlMetadata.createForServerStringRender();
    const tree = renderHtmlToString(element, {htmlMetadata: md});

    return verifySnapshotsAndReturn(tree, md, element);
}

function verifyServerStaticStringRender(element) {
    const md = HtmlMetadata.createForServerStringRender();
    const tree = renderHtmlToStaticMarkup(element, {htmlMetadata: md});

    return verifySnapshotsAndReturn(tree, md, element);
}

// ============= TEST CONFIGURATION UTILS =============
function verifyTestOutputs(testResults) {
    const {
        html: expectedHtml,
        attributes: expectedAttributes,
        components: expectedComponents
    } = testResults[0];

    testResults.forEach(({html, attributes, components}) => {
        expect(html).toEqual(expectedHtml);
        expect(attributes).toEqual(expectedAttributes);

        // Verify the react components are equal
        // - '.toEqual' did not return expected results w/react elements
        const keys = Object.keys(components);
        const expectedKeys = Object.keys(expectedComponents);
        expect(keys).toEqual(expectedKeys);

        keys.forEach(key => {
            const keyComponents = components[key];
            const expectedKeyComponents = expectedComponents[key];

            // Verify type
            expect(keyComponents).toHaveLength(expectedKeyComponents.length);

            // Verify props
            keyComponents.forEach((component, idx) => {
                const expectedComponent = expectedKeyComponents[idx];
                expect(component.type).toBe(expectedComponent.type);
                expect(component.props).toEqual(expectedComponent.props);
            });
        });
    });
}

function composeTests(environmentName, renderFuncName, renderMethod, tests) {
    return tests.reduce((testSets, [testDescription, testName, componentBuilders]) => {
        const testDescriptors = Array.isArray(testDescription)
            ? [environmentName, renderFuncName].concat(testDescription)
            : [environmentName, renderFuncName, testDescription];

        testSets.push([testDescriptors, testName, renderMethod, componentBuilders]);
        return testSets;
    }, []);
}

function composeClientRenderTests(testDefinition, testSets) {
    return composeTests("client", "render", verifyClientRender, testDefinition, testSets);
}

function composeServerToStringTests(testDefinition, testSets) {
    return composeTests(
        "server",
        "renderHtmlToString",
        verifyServerStringRender,
        testDefinition,
        testSets
    );
}

function composeServerToStaticStringTests(testDefinition, testSets) {
    return composeTests(
        "server",
        "renderHtmlToStaticMarkup",
        verifyServerStaticStringRender,
        testDefinition,
        testSets
    );
}

function testSet(testSetName, testName, componentBuilder) {
    return [testSetName, testName, componentBuilder];
}

const composeTestMethods = [
    composeClientRenderTests,
    composeServerToStringTests,
    composeServerToStaticStringTests
];

function describeTest(testDescriptors, testName, runTest) {
    return describe(testDescriptors.shift(), () => {
        if (testDescriptors.length === 0) {
            return test(testName, runTest);
        }

        describeTest(testDescriptors, testName, runTest);
    });
}

function runAndVerifyTests(tests, testStructureDescription, testFunc) {
    const testSetResults = [];

    describe(testStructureDescription, () => {
        tests.forEach(([testDescriptors, testName, verifyRender, componentFactory]) => {
            describeTest(testDescriptors.slice(), testName, () => {
                testSetResults.push(verifyRender(testFunc(componentFactory)));
                if (testSetResults.length > 1) {
                    // compare the results - all tests in a testSet should return the same results
                    verifyTestOutputs(testSetResults);
                }
            });
        });
    });
}

function runTestSets(...testSets) {
    describe("integration tests", () => {
        composeTestMethods.forEach(createTests => {
            testSets.forEach(testSet => {
                const tests = createTests(testSet);

                runAndVerifyTests(tests, "root component (1)", componentFactory => {
                    const Root = componentFactory.createLastChild();
                    return <Root>content</Root>;
                });

                runAndVerifyTests(tests, "nested component (2)", componentFactory => {
                    const Root = componentFactory.createRoot();
                    const Nested = componentFactory.createLastChild();

                    return (
                        <Root>
                            <Nested>content</Nested>
                        </Root>
                    );
                });

                runAndVerifyTests(tests, "deeply nested component (3)", componentFactory => {
                    const Root = componentFactory.createRoot();
                    const TopSibling = componentFactory.createTopSibling();
                    const TopSiblingChild = componentFactory.createLastChild();

                    return (
                        <Root>
                            <TopSibling>
                                <TopSiblingChild>content</TopSiblingChild>
                            </TopSibling>
                        </Root>
                    );
                });

                runAndVerifyTests(
                    tests,
                    "root component with nested siblings (3)",
                    componentFactory => {
                        const Root = componentFactory.createRoot();
                        const TopSibling = componentFactory.createTopSibling();
                        const BottomSibling = componentFactory.createLastChild();

                        return (
                            <Root>
                                <TopSibling>sibling a</TopSibling>
                                <BottomSibling>sibling b</BottomSibling>
                            </Root>
                        );
                    }
                );

                runAndVerifyTests(
                    tests,
                    "root component with nested siblings using a fragment (3)",
                    componentFactory => {
                        const Root = componentFactory.createRoot();
                        const TopSibling = componentFactory.createTopSibling();
                        const BottomSibling = componentFactory.createLastChild();

                        return (
                            <Root>
                                <React.Fragment>
                                    <TopSibling>sibling a</TopSibling>
                                    <BottomSibling>sibling b</BottomSibling>
                                </React.Fragment>
                            </Root>
                        );
                    }
                );

                runAndVerifyTests(tests, "sibling components (2)", componentFactory => {
                    const TopSibling = componentFactory.createTopSibling();
                    const BottomSibling = componentFactory.createLastChild();

                    return (
                        <div>
                            <TopSibling>sibling a</TopSibling>
                            <BottomSibling>sibling b</BottomSibling>
                        </div>
                    );
                });

                runAndVerifyTests(
                    tests,
                    "sibling components, top sibling has nested component (3)",
                    componentFactory => {
                        const TopSibling = componentFactory.createTopSibling();
                        const TopSiblingChild = componentFactory.createTopSiblingChild();
                        const BottomSibling = componentFactory.createLastChild();

                        return (
                            <div>
                                <TopSibling>
                                    <TopSiblingChild>sibling a</TopSiblingChild>
                                </TopSibling>
                                <BottomSibling>sibling b</BottomSibling>
                            </div>
                        );
                    }
                );

                runAndVerifyTests(
                    tests,
                    "sibling components, bottom sibling has nested component (3)",
                    componentFactory => {
                        const TopSibling = componentFactory.createTopSibling();
                        const BottomSibling = componentFactory.createBottomSibling();
                        const BottomSiblingChild = componentFactory.createLastChild();

                        return (
                            <div>
                                <TopSibling>sibling a</TopSibling>
                                <BottomSibling>
                                    <BottomSiblingChild>sibling b</BottomSiblingChild>
                                </BottomSibling>
                            </div>
                        );
                    }
                );

                runAndVerifyTests(
                    tests,
                    "sibling components, both siblings have nested component (4)",
                    componentFactory => {
                        const TopSibling = componentFactory.createTopSibling();
                        const TopSiblingChild = componentFactory.createTopSiblingChild();
                        const BottomSibling = componentFactory.createBottomSibling();
                        const BottomSiblingChild = componentFactory.createLastChild();

                        return (
                            <div>
                                <TopSibling>
                                    <TopSiblingChild>sibling a</TopSiblingChild>
                                </TopSibling>
                                <BottomSibling>
                                    <BottomSiblingChild>sibling b</BottomSiblingChild>
                                </BottomSibling>
                            </div>
                        );
                    }
                );
            });
        });
    });
}

const URL = "http://github.com/adam-26/";

function toUrlPath(value) {
    return value.replace(/\s/g, "_").toLowerCase();
}

const Container = ({children}) => <div>{children}</div>;

export {URL, Container, toUrlPath, runTestSets, testSet};
