const fs = require("fs");
const path = require("path");
const CliTest = require("command-line-test");

describe("react-dom-html-cli", () => {
    describe("HTML template", () => {
        test("generates a html file", done => {
            const CWD = path.resolve(__dirname, "..", "..");
            const cliTest = new CliTest({
                cwd: CWD,
                env: process.env
            });

            cliTest.exec(
                [
                    process.execPath,
                    CWD + "/src/react-dom-html.js",
                    "generateHtml",
                    "demo/reactDomHtmlTemplate.js",
                    "demo/htmlGenerated.html"
                ].join(" "),
                function(err, res) {
                    expect(err).toBe(null);
                    expect(res.error).toBe(null);
                    expect(res.stderr).toBe("");
                    expect(res.stdout.indexOf("SUCCESS") === 0);
                    done();
                }
            );
        });
    });

    describe("HTML API", () => {
        test("generates a html file", done => {
            const CWD = path.resolve(__dirname, "..", "..");
            const cliTest = new CliTest({
                cwd: CWD,
                env: process.env
            });

            cliTest.exec(
                [
                    process.execPath,
                    CWD + "/src/react-dom-html.js",
                    "generateHtml",
                    "demo/reactDomHtmlApi.js",
                    "demo/apiGenerated.html"
                ].join(" "),
                function(err, res) {
                    expect(err).toBe(null);
                    expect(res.error).toBe(null);
                    expect(res.stderr).toBe("");
                    expect(res.stdout.indexOf("SUCCESS") === 0);
                    done();
                }
            );
        });
    });

    test("template output is same for both APIs", () => {
        const apiOutput = fs.readFileSync(path.resolve("demo/apiGenerated.html"), "utf8");
        const htmlOutput = fs.readFileSync(path.resolve("demo/htmlGenerated.html"), "utf8");
        expect(apiOutput).toBe(htmlOutput);
    });
});
