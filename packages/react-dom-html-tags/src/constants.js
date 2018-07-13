export const HEAD_TAG_NAMES = {
    BASE: "base",
    LINK: "link",
    META: "meta",
    NOSCRIPT: "noscript",
    SCRIPT: "script",
    STYLE: "style",
    TITLE: "title",
    TEMPLATE: "template"
};

export const HTML_CHILD_TAG_NAMES = {
    BODY: "body",
    HEAD: "head",
    APP: "app" // special-case: used to style the application container
};

export const TAG_NAMES = {
    HTML: "html",
    ...HTML_CHILD_TAG_NAMES,
    ...HEAD_TAG_NAMES
};

export const ATTRIBUTE_KEY_NAMES = {
    HTML: "htmlAttributes",
    HEAD: "headAttributes",
    BODY: "bodyAttributes",
    APP: "appAttributes"
};

export const ATTRIBUTE_KEYS = Object.keys(ATTRIBUTE_KEY_NAMES).map(key => ATTRIBUTE_KEY_NAMES[key]);

export const ELEMENT_ATTRIBUTE_TUPLES = [
    [TAG_NAMES.HTML, ATTRIBUTE_KEY_NAMES.HTML],
    [TAG_NAMES.HEAD, ATTRIBUTE_KEY_NAMES.HEAD],
    [TAG_NAMES.BODY, ATTRIBUTE_KEY_NAMES.BODY],
    [TAG_NAMES.APP, ATTRIBUTE_KEY_NAMES.APP]
];

export const TITLE_TEMPLATE = "titleTemplate";

export const NON_TAG_KEYS = ATTRIBUTE_KEYS.concat([TITLE_TEMPLATE]);

export const HTML_CHILD_TAG_KEYS = Object.keys(HTML_CHILD_TAG_NAMES).map(
    key => HTML_CHILD_TAG_NAMES[key]
);

export const HEAD_TAG_KEYS = Object.keys(HEAD_TAG_NAMES).map(key => HEAD_TAG_NAMES[key]);
