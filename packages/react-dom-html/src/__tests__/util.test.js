import React, {Component} from "react";
import {getAppContainerProps} from "../util";

describe("util", () => {
    describe("getAppContainerProps", () => {
        test("returns defaults", () => {
            const {tagName, id, querySelector} = getAppContainerProps();
            expect(tagName).toBe("div");
            expect(id).toBe("app");
            expect(querySelector).toBe("#app");
        });

        test("returns options", () => {
            const {tagName, id, querySelector} = getAppContainerProps(null, {
                appContainerTagName: "tag_name",
                appContainerId: "i_d"
            });
            expect(tagName).toBe("tag_name");
            expect(id).toBe("i_d");
            expect(querySelector).toBe("#i_d");
        });

        test("returns values using static element methods", () => {
            const TestElement = class Test extends Component {
                static getAppContainerTagName() {
                    return "_tag";
                }

                static getAppContainerId() {
                    return "_id";
                }

                render() {
                    return null;
                }
            };

            const {tagName, id, querySelector} = getAppContainerProps(<TestElement />);
            expect(tagName).toBe("_tag");
            expect(id).toBe("_id");
            expect(querySelector).toBe("#_id");
        });
    });
});
