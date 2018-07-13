import React from "react";
import {runTestSets, toUrlPath, URL} from "./testHarness";
import {headTestSets} from "./testHarness.head";

// test that head <noscript> tags are appeneded
runTestSets(
    // String children
    headTestSets("append", "noscript", value => ({children: value}), "string children"),

    // React children
    headTestSets(
        "append",
        "noscript",
        value => ({children: <link rel="stylesheet" href={`${URL}${toUrlPath(value)}.css`} />}),
        "react children"
    ),

    // dangerouslySet children
    headTestSets(
        "append",
        "noscript",
        value => ({dangerouslySetInnerHTML: {__html: value}}),
        "dangerouslySetInnerHTML children"
    )
);
