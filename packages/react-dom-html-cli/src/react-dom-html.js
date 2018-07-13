#!/usr/bin/env

/*
This is a very simple CLI utility to simplify creating
html files using react-dom-html. It requires an input template
and output path.

Example usage:
react-dom-html generateHtml templates/inputTemplate.js output/generated.html

 */

const fs = require("fs");
const path = require("path");
const program = require("commander");
const pkg = require("../package.json");
const reactDomHtmlServer = require("react-dom-html/server");
require("babel-register");

function resolvePath(value) {
    return path.resolve(value);
}

let command;
let resolvedInputFile;
let resolvedOutputPath;

program
    .version(pkg.version, "-v, --version")
    .command("generateHtml <inputTemplate> <outputPath>")
    .description("Generates a html file")
    .action(function action(inputTemplate, outputPath, cmd) {
        command = cmd._name;
        resolvedInputFile = resolvePath(inputTemplate);
        resolvedOutputPath = resolvePath(outputPath);
    });

program.parse(process.argv);

if (!command) {
    process.stderr.write(
        "ERROR: A command is required, currently on 'generateHtml' is supported. " +
            "Use -h to view all options.\n"
    );

    return process.exit(1);
}

if (!resolvedInputFile || !fs.existsSync(resolvedInputFile)) {
    process.stderr.write("ERROR: Input file does not exist: '" + resolvedInputFile + "'\n");
    return process.exit(1);
}

if (!resolvedOutputPath) {
    process.stderr.write("ERROR: Output path is required.\n");
    return process.exit(1);
}

let requiredInput;
let hasError = false;

try {
    requiredInput = require(resolvedInputFile);
} catch (e) {
    hasError = true;
    throw e;
} finally {
    if (hasError) {
        process.stdout.write(
            "\n********** FAILED TO LOAD HTML TEMPLATE **********\n" +
                " - Could not load html template file. This is probably " +
                "caused by an error in your babel configuration.\n\n"
        );
    }
}

let html;
try {
    const {appElement, ...htmlOptions} = requiredInput.default || requiredInput;
    const renderOptions = {
        ...htmlOptions,
        allowAppContainerChildren: true
    };

    html = reactDomHtmlServer.renderHtmlToStaticMarkup(appElement, renderOptions);
    if (htmlOptions.includeDocType === true) {
        html = reactDomHtmlServer.HTML5_DOCTYPE + html;
    } else if (typeof htmlOptions.includeDocType === "string") {
        html = htmlOptions.includeDocType + html;
    }
} catch (e) {
    hasError = true;
    throw e;
} finally {
    if (hasError) {
        process.stdout.write(
            "\n********** FAILED TO GENERATE HTML **********\n" +
                " - Could not generate html from the input template.\n\n"
        );
    }
}

fs.writeFileSync(resolvedOutputPath, html, "utf8");
process.stdout.write("SUCCESS: html file written to " + resolvedOutputPath + "\n");
process.exit(0);
