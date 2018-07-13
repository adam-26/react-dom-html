// @flow
import type {ElementType} from "./flowTypes";

export const DEFAULT_APP_ELEMENT_ID = "app";

function defaultTo(getter, value) {
    if (typeof getter === "function") {
        return getter();
    }

    return value;
}

export function getAppContainerProps(rootElement?: ElementType = null, options?: Object = {}) {
    const {appContainerTagName, appContainerId} = options;
    const type = rootElement === null ? null : rootElement.type;
    const elementId =
        appContainerId || defaultTo(type && type.getAppContainerId, DEFAULT_APP_ELEMENT_ID);

    return {
        tagName: appContainerTagName || defaultTo(type && type.getAppContainerTagName, "div"),
        id: elementId,
        querySelector: `#${elementId}`
    };
}
