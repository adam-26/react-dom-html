import React from "react";
import {runTestSets} from "./testHarness";
import {headTestSets} from "./testHarness.head";

// test that head <template> tags are appended to parent tag(s)
runTestSets(
    headTestSets("append", "template", value => ({
        id: value,
        children: <div>template_{value}</div>
    }))
);
