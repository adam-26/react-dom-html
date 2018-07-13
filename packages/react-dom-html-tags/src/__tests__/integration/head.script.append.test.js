import React from "react";
import {runTestSets, URL} from "./testHarness";
import {headTestSets} from "./testHarness.head";

// test that head <script> tags are appended
runTestSets(
    // src attribute
    headTestSets(
        "append",
        "script",
        value => ({src: `${URL}${value.toLowerCase().replace(" ", "_")}.js`}),
        "src prop"
    ),

    // dangerouslySet innerHtml
    headTestSets(
        "append",
        "script",
        value => ({dangerouslySetInnerHTML: {__html: `function hello(){alert('${value}');}`}}),
        "dangerouslySetInnerHTML prop"
    )
);
