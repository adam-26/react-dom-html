// import React from "react";
// import HtmlMetadataProvider from "../components/_HtmlMetadataProvider";
// import HtmlMetadata from "../HtmlMetadata";
// import withHtmlMetadata from "../components/_withHtmlMetadata";
// import {mount} from "./enzyme";
//
// describe("withHtmlMetadata", () => {
//     test("renders metadata defined using HOC option", () => {
//         const Wrapped = () => <div>content</div>;
//         const MdComponent = withHtmlMetadata({
//             getHtmlMetadata: () => ({
//                 title: "this is a title"
//             })
//         })(Wrapped);
//
//         const md = HtmlMetadata.createForClientRender();
//
//         const html = mount(
//             <HtmlMetadataProvider metadata={md}>
//                 <MdComponent />
//             </HtmlMetadataProvider>
//         ).html();
//         expect(html).toBe("<div>content</div>");
//         expect(md._metadataList).toHaveLength(1);
//         expect(md._metadataList[0]).toEqual({title: "this is a title"});
//     });
//
//     test("renders metadata defined using a static function", () => {
//         const Wrapped = () => <div>content</div>;
//         Wrapped.getHtmlMetadata = () => ({
//             title: "this is a title"
//         });
//
//         const MdComponent = withHtmlMetadata()(Wrapped);
//         const md = HtmlMetadata.createForClientRender();
//
//         const html = mount(
//             <HtmlMetadataProvider metadata={md}>
//                 <MdComponent />
//             </HtmlMetadataProvider>
//         ).html();
//         expect(html).toBe("<div>content</div>");
//         expect(md._metadataList).toHaveLength(1);
//         expect(md._metadataList[0]).toEqual({title: "this is a title"});
//     });
//
//     test("renders metadata defined using custom named HOC option", () => {
//         const Wrapped = () => <div>content</div>;
//         const MdComponent = withHtmlMetadata({
//             getMetadataMethodName: "metadata",
//             metadata: () => ({
//                 title: "this is a title"
//             })
//         })(Wrapped);
//
//         const md = HtmlMetadata.createForClientRender();
//
//         const html = mount(
//             <HtmlMetadataProvider metadata={md}>
//                 <MdComponent />
//             </HtmlMetadataProvider>
//         ).html();
//         expect(html).toBe("<div>content</div>");
//         expect(md._metadataList).toHaveLength(1);
//         expect(md._metadataList[0]).toEqual({title: "this is a title"});
//     });
//
//     test("renders metadata defined using a custom named static function", () => {
//         const Wrapped = () => <div>content</div>;
//         Wrapped.metadata = () => ({
//             title: "this is a title"
//         });
//
//         const MdComponent = withHtmlMetadata({
//             getMetadataMethodName: "metadata"
//         })(Wrapped);
//         const md = HtmlMetadata.createForClientRender();
//
//         const html = mount(
//             <HtmlMetadataProvider metadata={md}>
//                 <MdComponent />
//             </HtmlMetadataProvider>
//         ).html();
//         expect(html).toBe("<div>content</div>");
//         expect(md._metadataList).toHaveLength(1);
//         expect(md._metadataList[0]).toEqual({title: "this is a title"});
//     });
// });
