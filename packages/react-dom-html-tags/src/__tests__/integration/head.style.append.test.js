import React from "react";
import {runTestSets} from "./testHarness";
import {headTestSets} from "./testHarness.head";

// test that head <style> tags are appended
runTestSets(
    headTestSets(
        "append",
        "style",
        value => ({children: `.myStyle{color:${value}}`}),
        "string children"
    ),

    headTestSets(
        "append",
        "style",
        value => ({dangerouslySetInnerHTML: {__html: `.myStyle{color:${value}}`}}),
        "dangerouslySetInnerHTML prop"
    )
);
