// @flow
import invariant from "invariant";
// NOTE: This import will be replaced @ build-time to use "react-dom-html-tags"
import {HtmlMetadata, withHtmlProvider} from "../index.js";
import {getRenderOptions, getAppElement, message, error} from "./serverUtil";
import {
    renderHtmlToNodeStream as renderToNodeStream,
    renderHtmlToStaticNodeStream as renderToStaticNodeStream
} from "react-dom-html/server";
import type {RootElement} from "../flowTypes";

const IS_DEV = process.env.NODE_ENV !== "production";

export function renderHtmlToNodeStream(element: RootElement, options?: Object = {}) {
    return renderToStream("renderHtmlToNodeStream", renderToNodeStream, false, element, options);
}

export function renderHtmlToStaticNodeStream(element: RootElement, options?: Object = {}) {
    return renderToStream(
        "renderHtmlToStaticNodeStream",
        renderToStaticNodeStream,
        true,
        element,
        options
    );
}

function renderToStream(
    renderFunctionName: string,
    renderFunction: (element: mixed) => mixed,
    isStaticMarkup: boolean,
    element: RootElement,
    options?: Object = {}
) {
    const {htmlMetadata} = options;
    if (htmlMetadata) {
        invariant(
            htmlMetadata.isServerStreamRender(),
            message("Invalid `htmlMetadata` instance, not created for server string render.")
        );
    }

    const metadata = htmlMetadata || HtmlMetadata.createForServerStreamRender();

    // Wrap the application with a HtmlProvider
    const rootElement = withHtmlProvider(element, metadata);
    const appElement = getAppElement(rootElement, element);

    const stream = renderFunction(
        rootElement,
        getRenderOptions(renderFunctionName, isStaticMarkup, appElement, metadata, options)
    );

    if (IS_DEV) {
        stream.on("end", () => {
            // TODO:: TEST THIS - verify it works as expected
            if (!metadata.didRenderCorrectHeadFragment()) {
                error(
                    `The wrong head fragment was rendered. ` +
                        `Stream rendering can not determine the head fragment, you need to define a ` +
                        `\`static getHeadFragment()\` function on the root element or pass it as an ` +
                        `option \`{ headFragment: HeadFragmentComponent }\` to "${renderFunctionName}".`
                );
            }
        });
    }

    return stream;
}
