// @flow
import HtmlReadable from "./HtmlReadable";
import type {ElementType} from "../flowTypes";

export function renderHtmlToNodeStream(element: ElementType = null, options?: Object = {}) {
    return renderToStream("renderHtmlToStaticNodeStream", false, element, options);
}

export function renderHtmlToStaticNodeStream(element: ElementType = null, options?: Object = {}) {
    return renderToStream("renderHtmlToStaticNodeStream", true, element, options);
}

function renderToStream(
    renderFunctionName: string,
    isStaticMarkup: boolean,
    element: ElementType,
    options: Object
) {
    return new HtmlReadable(element, isStaticMarkup, options);
}
