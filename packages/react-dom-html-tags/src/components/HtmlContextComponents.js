import {createContext} from "react";
import HtmlMetadata from "../HtmlMetadata";

// Assign a rootContext to use a default for testing, etc...
const {Provider, Consumer} = createContext(HtmlMetadata.createForClientRender().getRootContext());
export {Provider, Consumer};
