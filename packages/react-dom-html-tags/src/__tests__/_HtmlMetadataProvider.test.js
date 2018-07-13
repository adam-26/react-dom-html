// import React from "react";
// import {renderToStaticMarkup} from "react-dom/server";
// import HtmlMetadataProvider from "../components/_HtmlMetadataProvider";
// import HtmlMetadata from "../HtmlMetadata";
//
// describe("HtmlMetadataProvider", () => {
//     describe("constructor", () => {
//         test("assigns new metadata", () => {
//             const html = new HtmlMetadataProvider({});
//             expect(html.state.htmlMetadata instanceof HtmlMetadata).toBe(true);
//         });
//
//         test("accepts new metadata", () => {
//             const md = HtmlMetadata.createForClientRender();
//             md.markHydrated = jest.fn();
//
//             const html = new HtmlMetadataProvider({metadata: md});
//
//             expect(html.state.htmlMetadata).toEqual(md);
//             expect(md.markHydrated.mock.calls).toHaveLength(0);
//         });
//
//         test("accepts hydrated metadata", () => {
//             const md = HtmlMetadata.createForClientHydrate();
//             md.markHydrated = jest.fn();
//
//             const html = new HtmlMetadataProvider({metadata: md});
//
//             expect(html.state.htmlMetadata).toEqual(md);
//             expect(md.markHydrated.mock.calls).toHaveLength(1);
//         });
//     });
//
//     describe("componentDidMount", () => {
//         test("invokes state.isMounted()", () => {
//             const md = HtmlMetadata.createForClientRender();
//             md.htmlComponentDidMount = jest.fn();
//             const html = new HtmlMetadataProvider({metadata: md});
//
//             html.componentDidMount();
//
//             expect(md.htmlComponentDidMount.mock.calls).toHaveLength(1);
//         });
//     });
//
//     describe("render", () => {
//         test("returns html chrome", () => {
//             const html = renderToStaticMarkup(<HtmlMetadataProvider>content</HtmlMetadataProvider>);
//             expect(html).toBe("content");
//         });
//     });
// });
