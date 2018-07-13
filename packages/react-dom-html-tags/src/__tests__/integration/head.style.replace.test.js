import React from "react";
import {runTestSets} from "./testHarness";
import {headTestSets} from "./testHarness.head";

// test that head <style> tags replace matching parent tag(s)
runTestSets(
    headTestSets("replace", "style", () => ({children: ".myStyle{color:#fff}"}), "string children"),

    headTestSets(
        "replace",
        "style",
        () => ({dangerouslySetInnerHTML: {__html: ".myStyle{color:#fff}"}}),
        "dangerouslySetInnerHTML prop"
    )
);
