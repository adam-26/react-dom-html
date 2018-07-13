import React from "react";
import {runTestSets, toUrlPath, URL} from "./testHarness";
import {headTestSets} from "./testHarness.head";

// test that head <links> tags replace matching parent tag(s)
runTestSets(
    headTestSets("replace", "link", value => ({
        rel: "canonical",
        href: `${URL}${toUrlPath(value)}`
    }))
);
