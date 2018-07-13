import React from "react";
import ReactDOM from "react-dom";
import ReactTestUtils from "react-dom/test-utils";
import {renderHtml, hydrateHtml, Html} from "../../";

// TODO: add karma non-deterministic tests

const appContainerId = "app";
const appContainerSelector = `#${appContainerId}`;

const APP_COMPONENT = <div id="content">App</div>;
const RENDER_HTML = '<div id="content">App</div>';
const HYDRATE_HTML = '<div data-reactroot="" id="content">App</div>';

const REACT_ATTR_MAP = {
    className: "class"
};

function appendServerNode(parent) {
    const child = document.createElement("div");
    child.setAttribute("data-reactroot", "");
    child.setAttribute("id", "content");
    child.textContent = "App";

    parent.appendChild(child);
}

function assertDOMAttr(selector, attrName, expectedValue) {
    const domNode = document.querySelector(selector);
    expect(domNode.getAttribute(REACT_ATTR_MAP[attrName] || attrName)).to.equal(expectedValue);
}

function assertDOMProps(selector, elementProps) {
    if (elementProps === null) {
        return;
    }

    Object.keys(elementProps).forEach(elementProp =>
        assertDOMAttr(selector, elementProp, elementProps[elementProp])
    );
}

class TestHarnessComponent extends React.Component {
    constructor(props, context) {
        super(props, context);
        const {elementName, elementProps} = props;

        this.state = {
            html: {},
            head: {},
            body: {},
            app: {}
        };

        // Initial value
        this.state[elementName] = elementProps;
    }

    updateMetadata(e) {
        e.preventDefault();

        // Update the state
        const {elementName} = this.props;
        this.setState(e.data === null ? {[elementName]: {}} : {[elementName]: e.data});
    }

    render() {
        const {forwardedRef, children} = this.props;
        const {html, head, body, app} = this.state;

        return (
            <Html {...html}>
                <head {...head}>
                    <title>Test</title>
                </head>
                <body {...body}>
                    <app {...app}>
                        <button onClick={e => this.updateMetadata(e)} ref={forwardedRef}>
                            button
                        </button>
                        {children}
                    </app>
                </body>
            </Html>
        );
    }
}

const TestHarness = React.forwardRef((props, ref) => (
    <TestHarnessComponent {...props} forwardedRef={ref} />
));

const runTest = (elementName, elementPropSets, done) => {
    let button;
    const elementSelector = elementName === "app" ? appContainerSelector : elementName;

    // Append a "null" value to ensure DOM attributes are reset after test
    elementPropSets.push(null);

    const assertAttributeValues = initialProps => {
        setTimeout(() => {
            assertDOMProps(elementSelector, initialProps);
            setAndAssert(elementPropSets.shift());
        }, 100);
    };
    const assertAttributeValue = (elementProps, next) => {
        setTimeout(() => {
            assertDOMProps(elementSelector, elementProps);
            next();
        }, 100);
    };
    const setAndAssert = elementProps => {
        ReactTestUtils.Simulate.click(button, {data: elementProps});
        assertAttributeValue(elementProps, () => {
            if (elementPropSets.length) {
                return setAndAssert(elementPropSets.shift());
            }

            done();
        });
    };

    const elementProps = elementPropSets.shift();
    renderHtml(
        <TestHarness
            ref={btn => (button = btn)}
            elementName={elementName}
            elementProps={elementProps}
        />,
        {
            callback: () => {
                assertAttributeValues(elementProps);
            }
        }
    );
};

const runDOMTestSets = (elementName, testSets) => {
    describe(elementName, () => {
        testSets.forEach(testSet => {
            it(`should render attributes '${Object.keys(testSet[0]).join(", ")}'`, done => {
                runTest(elementName, testSet, done);
            });
        });
    });
};

describe("dom", () => {
    let appContainer;

    // Create the "appContainer" and insert it into the document
    const container = document.createElement("div");
    container.setAttribute("id", appContainerId);
    document.querySelector("body").appendChild(container);

    beforeEach(() => {
        appContainer = appContainer || document.querySelector(appContainerSelector);

        // resets DOM after each run
        appContainer.innerHTML = "";
    });

    afterEach(() => {
        // unmount any mounted container nodes
        ReactDOM.unmountComponentAtNode(container);
        ReactDOM.unmountComponentAtNode(appContainer);
    });

    describe("renderHtml", () => {
        it("renders to the default DOM component", done => {
            renderHtml(APP_COMPONENT);
            expect(document.querySelector(appContainerSelector).innerHTML).to.equal(RENDER_HTML);
            done();
        });

        it("renders to a container", done => {
            const testElement = document.createElement("div");
            renderHtml(APP_COMPONENT, {container: testElement});
            expect(testElement.innerHTML).to.equal(RENDER_HTML);

            ReactDOM.unmountComponentAtNode(testElement);
            done();
        });

        it("invokes callback after render", done => {
            renderHtml(APP_COMPONENT, {
                callback: () => {
                    expect(document.querySelector(appContainerSelector).innerHTML).to.equal(
                        RENDER_HTML
                    );
                    done();
                }
            });
        });
    });

    describe("hydrateHtml", () => {
        // hydrateHtml attempts to hydrate the <head> - this won't succeed using karma
        const expectedConsoleErrorCount = 1;
        let consoleErrorSpy;
        beforeEach(() => {
            consoleErrorSpy = sinon.spy(console, "error");
        });

        afterEach(() => {
            consoleErrorSpy.restore();

            // unmount the head
            ReactDOM.unmountComponentAtNode(appContainer);
            ReactDOM.unmountComponentAtNode(document.querySelector("head"));
        });

        it("renders to the default DOM component", done => {
            appendServerNode(appContainer);

            hydrateHtml(APP_COMPONENT, {
                callback: () => {
                    expect(consoleErrorSpy.callCount).to.equal(expectedConsoleErrorCount);
                    expect(document.querySelector(appContainerSelector).innerHTML).to.equal(
                        HYDRATE_HTML
                    );
                    done();
                }
            });
        });

        it("renders to a container", done => {
            const testElement = document.createElement("div");
            appendServerNode(testElement);

            hydrateHtml(APP_COMPONENT, {
                container: testElement,
                callback: () => {
                    expect(testElement.innerHTML).to.equal(HYDRATE_HTML);

                    ReactDOM.unmountComponentAtNode(testElement);
                    done();
                }
            });
        });

        it("invokes callback after render", done => {
            appendServerNode(appContainer);

            hydrateHtml(APP_COMPONENT, {
                callback: () => {
                    expect(document.querySelector(appContainerSelector).innerHTML).to.equal(
                        HYDRATE_HTML
                    );
                    done();
                }
            });
        });
    });

    describe("renderAttributes()", () => {
        let consoleErrorSpy;
        beforeEach(() => {
            consoleErrorSpy = sinon.spy(console, "error");
        });

        afterEach(() => {
            consoleErrorSpy.restore();

            // unmount the head
            ReactDOM.unmountComponentAtNode(appContainer);
            ReactDOM.unmountComponentAtNode(document.querySelector("head"));
        });

        runDOMTestSets("html", [
            [{lang: "en"}, {lang: "de"}, {lang: null}],
            [{amp: "amp"}, {amp: "true"}, {amp: null}],
            [{className: "en"}, {className: "de"}, {className: null}],
            [{lang: "en", amp: "amp"}, {lang: "de", amp: "true"}, {lang: null, amp: null}]
        ]);

        runDOMTestSets("head", [
            [{lang: "en"}, {lang: "de"}, {lang: null}],
            [{title: "head"}, {title: "hovud"}, {lang: null}],
            [{lang: "en", title: "head"}, {lang: "de", title: "hovud"}, {lang: null, title: null}]
        ]);

        runDOMTestSets("body", [
            [{lang: "en"}, {lang: "de"}, {lang: null}],
            [{className: "en"}, {className: "de"}, {className: null}],
            [{lang: "en", title: "head"}, {lang: "de", title: "hovud"}, {lang: null, title: null}]
        ]);

        runDOMTestSets("app", [
            [{lang: "en"}, {lang: "de"}, {lang: null}],
            [{className: "en"}, {className: "de"}, {className: null}],
            [{lang: "en", title: "head"}, {lang: "de", title: "hovud"}, {lang: null, title: null}]
        ]);
    });

    describe("non-deterministic errors", () => {
        let consoleWarnSpy;
        beforeEach(() => {
            consoleWarnSpy = sinon.spy(console, "warn");
        });

        afterEach(() => {
            consoleWarnSpy.restore();

            // unmount the head
            ReactDOM.unmountComponentAtNode(appContainer);
            ReactDOM.unmountComponentAtNode(document.querySelector("head"));
        });

        class TitleComponent extends React.Component {
            constructor(props, context) {
                super(props, context);
                this.state = {title: props.title};
            }

            updateMetadata(e) {
                e.preventDefault();

                // Update the state
                this.setState({title: e.data});
            }

            render() {
                const {forwardedRef, children} = this.props;
                const {title} = this.state;

                return (
                    <Html>
                        <head>
                            <title>{title}</title>
                        </head>
                        <body>
                            <app>
                                <button onClick={e => this.updateMetadata(e)} ref={forwardedRef}>
                                    button
                                </button>
                                {children}
                            </app>
                        </body>
                    </Html>
                );
            }
        }

        const Title = React.forwardRef((props, ref) => (
            <TitleComponent {...props} forwardedRef={ref} />
        ));

        const initApp = (initialProps, callback) => {
            let firstSiblingBtn, lastSiblingBtn, nestedChildBtn;
            const {firstSibling, lastSibling, nestedChild} = initialProps;
            // TODO: Design app to include SIBLINGS and 1 nested child

            renderHtml(
                <React.Fragment>
                    <Title ref={btn => (firstSiblingBtn = btn)} title={firstSibling}>
                        <Title ref={btn => (nestedChildBtn = btn)} title={lastSibling} />
                    </Title>
                    <Title ref={btn => (lastSiblingBtn = btn)} title={nestedChild} />
                </React.Fragment>,
                {
                    callback: () => {
                        callback({firstSiblingBtn, lastSiblingBtn, nestedChildBtn});
                    }
                }
            );
        };

        const assertNonDeterministicBranchs = (warningMessage, expectedWarnings) => {
            // TODO: verify the warning message - use "split" by "\r\n" to assert the branch hints are correct
            const lines = warningMessage.split(/[\r?\n]+/g);
            const branches = lines.slice(1, lines.length - 1);

            expect(branches.length).toEqual(expectedWarnings.length);
            for (let i = 0, len = branches.length; i < len; i++) {
                expect(branches[i]).toEqual(expectedWarnings[i]);
            }
        };

        // NOTE: This test should not be required if a "render post-commit" lifecycle hook is added
        it("should warn on initial render", done => {
            const initialProps = {
                firstSibling: "first sibling",
                lastSibling: "last sibling"
            };

            // TODO: Determine why no WARNING is logged - may need to add "NODE_ENV" for testing in DEV? Or...??? Debug.
            initApp(initialProps, () => {
                assertNonDeterministicBranchs(consoleWarnSpy.args[0][0], [
                    "expected branch messages",
                    "must be defined here"
                ]);
                done();
            });
        });

        it("should warn on first sibling update", done => {
            const initialProps = {
                firstSibling: {title: "first sibling"}
                // lastSibling: {title: "last sibling"}
            };

            initApp(initialProps, ({firstSiblingBtn, lastSiblingBtn, nestedChildBtn}) => {
                ReactTestUtils.Simulate.click(lastSiblingBtn, {data: "last sibling"});
                assertNonDeterministicBranchs(consoleWarnSpy.call[0][0], [
                    "expected branch messages",
                    "must be defined here"
                ]);
                done();
            });
        });

        // TODO: Add remaining tests
        // it("should warn on last sibling update", () => {
        //
        // });
        //
        // it("should warn on nested ancestor update", () => {
        //
        // });
        //
        // // TODO: Determine if this test is needed
        // it("should not warn after componentWillUnmount", () => {
        //
        // });
    });
});
