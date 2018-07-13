import React from "react";
import {runTestSets, URL} from "./testHarness";
import {headTestSets} from "./testHarness.head";

// test that head <noscript> tags replace matching parent tag(s)
runTestSets(
    // String children
    headTestSets("replace", "noscript", () => ({children: "Enable JavaScript"}), "string children"),

    // React children
    headTestSets(
        "replace",
        "noscript",
        () => ({children: <link rel="stylesheet" href={`${URL}styles.css`} />}),
        "react children"
    ),

    // dangerouslySet children
    headTestSets(
        "replace",
        "noscript",
        () => ({dangerouslySetInnerHTML: {__html: "Enable JavaScript"}}),
        "dangerouslySetInnerHTML prop"
    )
);
