import React from "react";
import {runTestSets, toUrlPath, URL} from "./testHarness";
import {headTestSets} from "./testHarness.head";

// test that head <link> tags are appended to parent tag(s)
runTestSets(
    headTestSets("append", "link", value => ({
        type: "text/css",
        rel: "stylesheet",
        href: `${URL}${toUrlPath(value)}.css`
    }))
);
