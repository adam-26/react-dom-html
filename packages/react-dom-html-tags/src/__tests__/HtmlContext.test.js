import React from "react";
import HtmlContext from "../HtmlContext";

function createTitleState(titleText) {
    return {
        title: {
            title: titleText
        }
    };
}

function createNestedTitleState(titleText, parent) {
    const ctx = parent.createChildContext();
    ctx.htmlComponentDidMount();
    ctx.setHtmlState(createTitleState(titleText));
    return ctx;
}

function createNewHtmlContext() {
    // HtmlContext requires a parent - for this test just assign another context.
    return new HtmlContext(new HtmlContext());
}

describe("HtmlContext", () => {
    test("returns root leaf", () => {
        const root = createNewHtmlContext();

        createNestedTitleState("Level 1", root);

        expect(root.resolveHtmlState().title.title).toEqual("Level 1");
    });

    test("returns last sibling leaf", () => {
        const root = createNewHtmlContext();

        createNestedTitleState("Level 1", root);
        createNestedTitleState("Level 2", root);

        expect(root.resolveHtmlState().title.title).toEqual("Level 2");
    });

    test("returns last sibling leaf (when parent sibling has child)", () => {
        const root = createNewHtmlContext();

        const level1 = createNestedTitleState("Level 1", root);
        createNestedTitleState("Leaf 1A", level1);

        createNestedTitleState("Level 2", root);

        expect(root.resolveHtmlState().title.title).toEqual("Level 2");
    });

    test("returns last sibling child leaf", () => {
        const root = createNewHtmlContext();

        const level1 = createNestedTitleState("Level 1", root);
        createNestedTitleState("Leaf 1A", level1);

        const level2 = createNestedTitleState("Level 2", root);
        createNestedTitleState("Leaf 2A", level2);

        expect(root.resolveHtmlState().title.title).toEqual("Leaf 2A");
    });

    test("returns last sibling child leaf (when first sibling has children)", () => {
        const root = createNewHtmlContext();

        const level1 = createNestedTitleState("Level 1", root);
        createNestedTitleState("Leaf 1A", level1);
        createNestedTitleState("Leaf 1B", level1);

        const level2 = createNestedTitleState("Level 2", root);
        createNestedTitleState("Leaf 2A", level2);

        expect(root.resolveHtmlState().title.title).toEqual("Leaf 2A");
    });

    test("returns last sibling's last child leaf", () => {
        const root = createNewHtmlContext();

        const level1 = createNestedTitleState("Level 1", root);
        createNestedTitleState("Leaf 1A", level1);
        createNestedTitleState("Leaf 1B", level1);

        const level2 = createNestedTitleState("Level 2", root);
        createNestedTitleState("Leaf 2A", level2);
        createNestedTitleState("Leaf 2B", level2);

        expect(root.resolveHtmlState().title.title).toEqual("Leaf 2B");
    });

    test("returns deeply nested last sibling's last child's last leaf", () => {
        const root = createNewHtmlContext();

        const level1 = createNestedTitleState("Level 1", root);
        const leaf1A = createNestedTitleState("Leaf 1A", level1);
        createNestedTitleState("Leaf 1Ai", leaf1A);
        createNestedTitleState("Leaf 1Aii", leaf1A);
        createNestedTitleState("Leaf 1Aiii", leaf1A);

        const leaf1B = createNestedTitleState("Leaf 1B", level1);
        createNestedTitleState("Leaf 1Bi", leaf1B);
        createNestedTitleState("Leaf 1Bii", leaf1B);
        createNestedTitleState("Leaf 1Biii", leaf1B);

        const level2 = createNestedTitleState("Level 2", root);
        const leaf2A = createNestedTitleState("Leaf 2A", level2);
        createNestedTitleState("Leaf 2Ai", leaf2A);
        createNestedTitleState("Leaf 2Aii", leaf2A);
        createNestedTitleState("Leaf 2Aiii", leaf2A);

        const leaf2B = createNestedTitleState("Leaf 2B", level2);
        createNestedTitleState("Leaf 2Bi", leaf2B);
        createNestedTitleState("Leaf 2Bii", leaf2B);
        createNestedTitleState("Leaf 2Biii", leaf2B);

        expect(root.resolveHtmlState().title.title).toEqual("Leaf 2Biii");
    });
});
