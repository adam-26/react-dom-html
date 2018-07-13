import React from "react";
import {runTestSets, URL} from "./testHarness";
import {headTestSets} from "./testHarness.head";

// test that head <script> tags replace matching parent tag(s)
runTestSets(
    // src attribute
    headTestSets("replace", "script", () => ({src: `${URL}code.js`}), "src prop"),

    // dangerouslySet innerHTML
    headTestSets(
        "replace",
        "script",
        () => ({dangerouslySetInnerHTML: {__html: "function hello(){alert('hi');}"}}),
        "dangerouslySetInnerHTML prop"
    )
);
