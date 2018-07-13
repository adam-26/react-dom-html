// @flow
import {createElement, cloneElement, Children, isValidElement} from "react";
import invariant from "invariant";
import {TAG_NAMES, TITLE_TEMPLATE, HEAD_TAG_KEYS, ATTRIBUTE_KEY_NAMES} from "./constants";
import {warn, message, renderForError} from "./util";

const IS_PROD = process.env.NODE_ENV === "production";

// TODO: Add any attributes that should be case-sensitive that react-dom/server does not correctly render
// TODO: Can this be MOVED to the SERVER directory?
// react-dom doesn't correctly case all attributes on the server
// for some attributes, this is problematic.
// export const SERVER_TAG_MAP = {
//     // server gets this wrong
//     charSet: "charset",
//
//     // required for google metadata
//     hrefLang: "hreflang",
//
//     // other micro-data
//     itemProp: "itemprop",
//     itemType: "itemtype",
//     itemRef: "itemref",
//     itemScope: "itemscope",
//     itemId: "itemid",
// };

// Use react props camel case
export const REACT_PROP_NAMES = {
    CHARSET: "charSet",
    HTTPEQUIV: "httpEquiv",
    ITEM_PROP: "itemProp",
    NAME: "name",
    PROPERTY: "property",
    REL: "rel",
    SRC: "src",
    CANONICAL: "canonical",
    HREF: "href"
};

function resolveAttributes(props?: Object = {}, options?: Object = {}) {
    if (Object.keys(props).length === 0) {
        return;
    }

    const {className, ...attributes} = props;
    if (className) {
        return {
            ...attributes,
            className: className.split(" ") // special-case; append class names
        };
    }

    return attributes;
}

function assignAttributes(target, tagName, props, options) {
    const attributeValues = resolveAttributes(props, options);
    if (attributeValues) {
        return {
            ...target,
            [tagName]: attributeValues
        };
    }

    return target;
}

function resolveHtml(child, htmlState, options) {
    const {children: nestedChildren, ...childProps} = child.props;
    if (nestedChildren && Children.count(nestedChildren) > 0) {
        Children.forEach(nestedChildren, nestedChild => {
            htmlState = resolveHtmlElements(nestedChild, htmlState, options);
        });
    }

    return assignAttributes(htmlState, ATTRIBUTE_KEY_NAMES.HTML, childProps, options);
}

function resolveBody(child, htmlState, options) {
    const {children: nestedChildren, ...childProps} = child.props;
    const childCount = Children.count(nestedChildren);

    // <body> permits a single child, and must be type <app(Container)>
    if (childCount === 1) {
        htmlState = resolveApp(nestedChildren, htmlState, options);
    } else if (childCount !== 0) {
        throw new Error("<body> is only permitted to have a single child, <app>.");
    }

    return assignAttributes(htmlState, ATTRIBUTE_KEY_NAMES.BODY, childProps, options);
}

function resolveApp(child, htmlState, options) {
    // <app> does not permit children
    const {children: nestedChildren, ...childProps} = child.props;
    if (!options.permitAppChildren && Children.count(nestedChildren) !== 0) {
        throw new Error("<app> does not support the use of children.");
    }

    // Do not set "id" value on <app>
    if (typeof childProps.id !== "undefined") {
        warn(
            `Setting 'id=\"${
                childProps.id
            }\"' on the <app> tag may have unintended consequences. You should set the "id" before initial render.`
        );
    }

    return assignAttributes(htmlState, "appAttributes", childProps, options);
}

function isAttributeEqualTo(props, attributeName, lowerCaseValue) {
    const attributeValue = props[attributeName];
    return typeof attributeValue !== "undefined" && attributeValue.toLowerCase() === lowerCaseValue;
}

const LINK_KEY_ATTRIBUTES = [
    REACT_PROP_NAMES.REL,
    REACT_PROP_NAMES.ITEM_PROP,
    REACT_PROP_NAMES.HREF
];

const META_KEY_ATTRIBUTES = [
    REACT_PROP_NAMES.NAME,
    REACT_PROP_NAMES.HTTPEQUIV,
    REACT_PROP_NAMES.PROPERTY,
    REACT_PROP_NAMES.ITEM_PROP
];

function getKeySuffix(props, keyAttributes, tagName) {
    let suffix = "";
    for (let i = 0, len = keyAttributes.length; i < len; i++) {
        const keyAttribute = keyAttributes[i];
        const attributeValue = props[keyAttribute];
        if (attributeValue) {
            suffix += `${keyAttribute}=${attributeValue}`;
        }
    }

    if (suffix === "") {
        throw new Error(
            message(
                `Html <head> contain invalid <${tagName}> tag, ` +
                    `one of the primary props is required: ${keyAttributes.join(", ")}`
            )
        );
    }

    return suffix;
}

function getKey(prefix, suffix?: string = null, applyHashCode?: boolean = false): string {
    if (!suffix) {
        return prefix;
    }

    return `${prefix}:${applyHashCode ? hashCode(suffix) : suffix}`;
}

// Keys CAN be used to determine if tags are considered to be the "same" / define the same data
// - this simplifies appending and merging tags
function assignKey(type, props) {
    if (TAG_NAMES.BASE === type) {
        // Only a single 'base' tag is permitted per document
        return getKey(type);
    }

    if (TAG_NAMES.LINK === type) {
        return getKey(
            type,
            isAttributeEqualTo(props, REACT_PROP_NAMES.REL, REACT_PROP_NAMES.CANONICAL)
                ? // only a single <link rel="canonical" .../> tag is permitted per document
                  REACT_PROP_NAMES.CANONICAL
                : // all other link tags can be appended - get key suffix
                  getKeySuffix(props, LINK_KEY_ATTRIBUTES, type)
        );
    }

    if (TAG_NAMES.META === type) {
        return getKey(
            type,
            typeof props[REACT_PROP_NAMES.CHARSET] !== "undefined"
                ? // Only a single "charset" metatag is permitted per document
                  REACT_PROP_NAMES.CHARSET
                : getKeySuffix(props, META_KEY_ATTRIBUTES, type)
        );
    }

    if (TAG_NAMES.TEMPLATE === type) {
        const {id} = props;
        if (typeof id !== "string" || id.length === 0) {
            warn("<template> requires an `id` attribute.");
        }

        return getKey(type, id || "");
    }

    throw new Error(
        message(
            `"<${type}>" tag is not a valid "<head>" child element. Valid child tag names are: "${HEAD_TAG_KEYS.join(
                '", "'
            )}".`
        )
    );
}

function hashCode(value) {
    // TODO: May need to set a max number of characters to hash, to avoid very long strings from causing performance problems
    // https://stackoverflow.com/questions/6122571/simple-non-secure-hash-function-for-javascript
    let hash = 0;
    for (let i = 0, len = value.length; i < len; i++) {
        const char = value.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }

    return hash;
}

function mapDangerouslySetToState(typeName, typeState, element) {
    const {children, dangerouslySetInnerHTML} = element.props;

    if (!IS_PROD) {
        if (typeof children !== "undefined") {
            warn(`<${typeName}> can not define 'dangerouslySetInnerHTML' and 'children' props.`);
        }
    }

    const key = getKey(typeName, dangerouslySetInnerHTML.__html, true);
    return assignState(typeName, typeState, key, cloneElement(element, {key}));
}

const SCRIPT = TAG_NAMES.SCRIPT;

function assertPropOrDangerouslySet(tagName, propName, propValue, expectedType) {
    if (typeof propValue === "undefined") {
        throw new Error(`<${tagName}> expects a 'dangerouslySetInnerHTML' or '${propName}' prop.`);
    }

    if (expectedType && typeof propValue !== expectedType) {
        throw new Error(`<${tagName}> expects '${propName}' to be a '${expectedType}' type.`);
    }
}

function isDangerouslySetDefined(element) {
    return typeof element.props.dangerouslySetInnerHTML !== "undefined";
}

function mapScriptToState(element, scriptState) {
    const {src} = element.props;
    if (isDangerouslySetDefined(element)) {
        return mapDangerouslySetToState(SCRIPT, scriptState, element);
    }

    assertPropOrDangerouslySet(SCRIPT, REACT_PROP_NAMES.SRC, src, "string");

    const key = getKey(SCRIPT, src);
    assignState(SCRIPT, scriptState, key, cloneElement(element, {key}));
}

const STYLE = TAG_NAMES.STYLE;

function mapStyleToState(element, styleState) {
    const {children, ...styleProps} = element.props;

    if (isDangerouslySetDefined(element)) {
        return mapDangerouslySetToState(STYLE, styleState, element);
    }

    assertPropOrDangerouslySet(STYLE, "children", children, "string");

    const key = getKey(STYLE, children, true);
    return assignState(
        STYLE,
        styleState,
        key,
        createElement(STYLE, {
            ...styleProps,
            key: key,
            dangerouslySetInnerHTML: {__html: children.trim()}
        })
    );
}

const NOSCRIPT = TAG_NAMES.NOSCRIPT;

function mapNoScriptToState(element, noScriptState, options) {
    const {children} = element.props;
    if (isDangerouslySetDefined(element)) {
        return mapDangerouslySetToState(NOSCRIPT, noScriptState, element);
    }

    assertPropOrDangerouslySet(NOSCRIPT, "children", children);

    if (typeof children !== "string") {
        if (!IS_PROD) {
            invariant(
                isValidElement(children),
                "Html head <noscript> element only accepts a string or a react component as children."
            );
        }

        if (options.isServerRender) {
            warn(
                "<noscript> requires children to be a string to hydrate correctly on the client. " +
                    "You can follow the react issue at https://github.com/facebook/react/issues/11423."
            );
        }

        // https://www.w3.org/TR/html5/scripting-1.html#the-noscript-element
        // only link, style and meta tags permitted as children of <noscript> in the <head>
        // Map the <noscript> children while maintaining child element order.
        const childState = {};
        const childKeys = [];
        Children.forEach(children, child => {
            const type = child.type;
            if (type === STYLE) {
                return childKeys.push(mapStyleToState(child, childState));
            }

            if (type === TAG_NAMES.LINK || type === TAG_NAMES.META) {
                return childKeys.push(mapElementToState(type, child, childState));
            }

            throw new Error(
                message(
                    `Element <${type}> is not permitted to be a child of <${NOSCRIPT}> ` +
                        `when in the document <${TAG_NAMES.HEAD}>.`
                )
            );
        });

        // Reduce the nested children
        let key = "";
        const noScriptKids = childKeys.reduce((nestedChildren, childKey) => {
            // append the child element key
            key += childKey;

            // append the child element
            nestedChildren.push(childState[childKey]);
            return nestedChildren;
        }, []);

        return assignState(
            NOSCRIPT,
            noScriptState,
            key,
            createElement(
                NOSCRIPT,
                {
                    key: key
                },
                noScriptKids
            )
        );
    }

    // noscript children is a string
    const {children: stringScript, ...noScriptProps} = element.props;
    const key = getKey(NOSCRIPT, stringScript, true);
    assignState(
        NOSCRIPT,
        noScriptState,
        key,
        createElement(NOSCRIPT, {
            ...noScriptProps,
            key: key,
            dangerouslySetInnerHTML: {__html: stringScript}
        })
    );
}

const TITLE = TAG_NAMES.TITLE;
function mapTitleToState(element, titleState, htmlState) {
    const {children: titleText, template, ...titleAttributes} = element.props;
    if (typeof template === "function") {
        htmlState[TITLE_TEMPLATE] = [template];
    } else if (typeof template !== "undefined") {
        throw new Error(message("title template expects a function."));
    }

    // Only a single 'title' tag is permitted per document - always use the same KEY value
    assignState(
        TITLE,
        titleState,
        TITLE,
        createElement(
            TITLE,
            {
                ...titleAttributes,
                key: titleText
            },
            titleText
        )
    );
}

function assignState(tagName, state, key, element) {
    // Use key(s) to determine if there are any conflicting html elements
    if (!IS_PROD) {
        if (Object.keys(state).indexOf(key) !== -1) {
            warn(
                `<head> includes conflicting <${tagName}> tags that will result in only the last element ` +
                    `being rendered. The conflicting element is: ${renderForError(
                        tagName,
                        element.props
                    )}`
            );
        }
    }

    state[key] = element;
    return key;
}

function mapElementToState(childType, child, typeState) {
    // all other elements use the original React element for rendering
    const key = assignKey(childType, child.props);
    return assignState(childType, typeState, key, cloneElement(child, {key}));
}

function resolveHead(child, htmlState, options, allowProps?: boolean = true) {
    const {children: nestedChildren, ...childProps} = child.props;
    if (!allowProps && Object.keys(childProps).length !== 0) {
        warn(
            "The <head> element assigned after render does not accept attributes, " +
                "they can not be hydrated on the client."
        );
    }

    if (nestedChildren) {
        Children.forEach(nestedChildren, nestedChild => {
            const nestedChildType = nestedChild.type;
            const typeState = (htmlState[nestedChildType] = htmlState[nestedChildType] || {});

            if (nestedChildType === TITLE) {
                mapTitleToState(nestedChild, typeState, htmlState);
            } else if (nestedChildType === STYLE) {
                mapStyleToState(nestedChild, typeState);
            } else if (nestedChildType === SCRIPT) {
                mapScriptToState(nestedChild, typeState);
            } else if (nestedChildType === NOSCRIPT) {
                mapNoScriptToState(nestedChild, typeState, options);
            } else {
                // all other elements use the original React element for rendering
                mapElementToState(nestedChildType, nestedChild, typeState);
            }
        });
    }

    return assignAttributes(htmlState, ATTRIBUTE_KEY_NAMES.HEAD, childProps, options);
}

function resolveHtmlElement(children, htmlState, options) {
    const child = Children.only(children);
    const childType = child.type;

    if (childType === TAG_NAMES.HTML) {
        return resolveHtml(child, htmlState, options);
    }

    if (childType === TAG_NAMES.HEAD) {
        return resolveHead(child, htmlState, options);
    }

    if (childType === TAG_NAMES.BODY) {
        return resolveBody(child, htmlState, options);
    }

    if (childType === TAG_NAMES.APP) {
        return resolveApp(child, htmlState, options);
    }

    throw new Error(message(`Invalid html markup, tag "${childType}" is not supported.`));
}

function resolveHtmlElements(htmlElement, htmlState, options) {
    if (!htmlElement || Children.count(htmlElement) === 0) {
        return {};
    }

    return resolveHtmlElement(htmlElement, htmlState, options);
}

export default function mapHtmlToState(htmlElement, options) {
    return resolveHtmlElement(htmlElement, {}, options);
}

export function mapHeadElementToState(headElement, options) {
    return resolveHead(headElement, {}, options, false);
}
