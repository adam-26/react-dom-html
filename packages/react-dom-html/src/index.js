import {renderHtml, hydrateHtml} from "./dom";
import {getAppContainerProps} from "./util";

export {
    renderHtml,
    hydrateHtml,
    // This export is undocumented
    // - it should not be used by other packages
    // - its exported only for internal use
    // - it may be removed at any time
    getAppContainerProps
};
