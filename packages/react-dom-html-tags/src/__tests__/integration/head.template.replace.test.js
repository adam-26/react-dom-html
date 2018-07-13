import React from "react";
import {runTestSets} from "./testHarness";
import {headTestSets} from "./testHarness.head";

// test that head <template> tags replace parent tag(s)
runTestSets(
    headTestSets("replace", "template", () => ({
        id: "test_template",
        children: <div>template</div>
    }))
);
