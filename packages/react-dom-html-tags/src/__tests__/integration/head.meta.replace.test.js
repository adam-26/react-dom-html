import React from "react";
import {runTestSets} from "./testHarness";
import {headTestSets} from "./testHarness.head";

// test that head <meta> tags replace parent tag(s)
runTestSets(headTestSets("replace", "meta", value => ({charSet: value})));
