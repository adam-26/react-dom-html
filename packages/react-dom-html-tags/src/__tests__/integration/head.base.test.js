import React from "react";
import {runTestSets, toUrlPath, URL} from "./testHarness";
import {headTestSets} from "./testHarness.head";

// test that head <base> tags replace parent tag(s)
runTestSets(headTestSets("replace", "base", value => ({href: `${URL}${toUrlPath(value)}/`})));
