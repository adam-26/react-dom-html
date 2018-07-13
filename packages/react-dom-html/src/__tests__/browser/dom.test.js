import React from "react";
import ReactDOM from "react-dom";
import {renderHtml, hydrateHtml} from "../../dom";

const APP_COMPONENT = <div id="content">App</div>;
const RENDER_HTML = '<div id="content">App</div>';
const HYDRATE_HTML = '<div data-reactroot="" id="content">App</div>';

function appendServerNode(parent) {
    const child = document.createElement("div");
    child.setAttribute("data-reactroot", "");
    child.setAttribute("id", "content");
    child.textContent = "App";

    parent.appendChild(child);
}

describe("dom", () => {
    let appContainer;

    // Create the "appContainer" and insert it into the document
    const container = document.createElement("div");
    container.setAttribute("id", "app");
    document.querySelector("body").appendChild(container);

    beforeEach(() => {
        appContainer = appContainer || document.querySelector("#app");

        // resets DOM after each run
        appContainer.innerHTML = "";
    });

    afterEach(() => {
        // unmount any mounted container nodes
        ReactDOM.unmountComponentAtNode(container);
    });

    describe("renderHtml", () => {
        it("renders to the default DOM component", done => {
            renderHtml(APP_COMPONENT);
            expect(document.querySelector("#app").innerHTML).to.equal(RENDER_HTML);
            done();
        });

        it("renders to a container", done => {
            const testElement = document.createElement("div");
            renderHtml(APP_COMPONENT, testElement);
            expect(testElement.innerHTML).to.equal(RENDER_HTML);
            done();
        });

        it("invokes callback after render", done => {
            renderHtml(APP_COMPONENT, null, () => {
                expect(document.querySelector("#app").innerHTML).to.equal(RENDER_HTML);
                done();
            });
        });
    });

    describe("hydrateHtml", () => {
        let consoleErrorSpy;
        beforeEach(() => {
            consoleErrorSpy = sinon.spy(console, "error");
        });

        afterEach(() => {
            consoleErrorSpy.restore();
        });

        it("renders to the default DOM component", done => {
            appendServerNode(appContainer);

            hydrateHtml(APP_COMPONENT);
            expect(consoleErrorSpy.callCount).to.equal(0);
            expect(document.querySelector("#app").innerHTML).to.equal(HYDRATE_HTML);
            done();
        });

        it("renders to a container", done => {
            const testElement = document.createElement("div");
            appendServerNode(testElement);

            hydrateHtml(APP_COMPONENT, testElement);
            expect(consoleErrorSpy.callCount).to.equal(0);
            expect(testElement.innerHTML).to.equal(HYDRATE_HTML);
            done();
        });

        it("invokes callback after render", done => {
            appendServerNode(appContainer);

            hydrateHtml(APP_COMPONENT, null, () => {
                expect(consoleErrorSpy.callCount).to.equal(0);
                expect(document.querySelector("#app").innerHTML).to.equal(HYDRATE_HTML);
                done();
            });
        });
    });
});
