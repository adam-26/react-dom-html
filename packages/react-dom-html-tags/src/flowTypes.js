// @flow
import type HtmlMetadata from "./HtmlMetadata";
import type {Node} from "react";

type renderElement = (htmlMetadata: HtmlMetadata) => Node;

export type RootElement = renderElement | Element;
