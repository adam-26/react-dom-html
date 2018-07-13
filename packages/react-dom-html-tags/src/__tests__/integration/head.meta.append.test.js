import React from "react";
import {runTestSets} from "./testHarness";
import {headTestSets} from "./testHarness.head";

// test that head <meta> tags are appended to parent tag(s)
runTestSets(headTestSets("append", "meta", value => ({name: value, content: "meta content"})));
