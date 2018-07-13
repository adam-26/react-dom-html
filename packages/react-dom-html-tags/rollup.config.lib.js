import * as p from "path";
import babel from "rollup-plugin-babel";
import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import replace from "rollup-plugin-replace";
import uglify from "rollup-plugin-uglify";
import filesize from "rollup-plugin-filesize";

const copyright = `/*
 * Copyright ${new Date().getFullYear()} @adam-26.
 * Copyrights licensed under the MIT License.
 * See the accompanying LICENSE file for terms.
 */
`;

const libOptions = {
    banner: copyright,
    exports: "named"
};

const plugins = [
    babel({
        babelrc: false,
        presets: [
            [
                "env",
                {
                    modules: false
                }
            ],
            "react",
            "flow"
        ],
        plugins: [
            "transform-object-rest-spread",
            "transform-class-properties",
            ["transform-react-remove-prop-types", {removeImport: true}],
            "minify-dead-code-elimination",
            "external-helpers"
        ]
    }),
    nodeResolve({
        jsnext: true
    }),
    commonjs({
        sourcemap: true
    }),
    filesize()
];

const productionPlugins = [
    replace({
        "process.env.NODE_ENV": JSON.stringify("production")
    })
]
    .concat(plugins)
    .concat([
        uglify({
            warnings: false
            // TODO: parse multiple times - how to remove dead code?
            // TODO: Retain copyright
        })
    ]);

const externals = [
    "exenv",
    "react",
    "react-dom",
    "react-dom/server",
    "react-dom-html",
    "react-dom-html/server",
    "hoist-non-react-statics",
    "react-display-name",
    "react-script-tag",
    "hoist-non-react-statics",
    "invariant",
    "prop-types",
    "stream"
];

//         === SERVER PACKAGING NOTES ===
// For release, replace core files with the package name
// - this is required for SSR to use same react CONTEXT symbols
//   as components and have the SSR use context correctly
// - the FULL "src/index.js" file path MUST be used here and in source code
//   so that the paths are correctly resolved
// - the file path(s) MUST be defined as "externals" AND "outputs.paths"
const reactDomHtmlTagsImportPath = p.resolve("src", "index.js");
const serverExternals = externals.concat(["react-dom-html-tags", reactDomHtmlTagsImportPath]);

const serverOptions = {
    paths: {
        [reactDomHtmlTagsImportPath]: "react-dom-html-tags"
    }
};

export default [
    {
        input: p.resolve("src/index.js"),
        output: [
            {
                file: "lib/index.development.js",
                format: "cjs",
                ...libOptions
            },
            {
                file: "lib/index.development.es.js",
                format: "es",
                ...libOptions
            }
        ],
        external: externals,
        plugins: plugins.concat([
            replace({
                "process.env.NODE_ENV": JSON.stringify("development")
            })
        ])
    },
    {
        input: p.resolve("src/index.js"),
        output: [
            {
                file: "lib/index.production.min.js",
                format: "cjs",
                ...libOptions
            },
            {
                file: "lib/index.production.min.es.js",
                format: "es",
                ...libOptions
            }
        ],
        external: externals,
        plugins: productionPlugins
    },
    {
        input: p.resolve("src/server/index.js"),
        output: [
            {
                file: "lib/server.development.js",
                format: "cjs",
                ...libOptions,
                ...serverOptions
            }
        ],
        plugins: plugins,
        external: serverExternals
    },
    {
        input: p.resolve("src/server/index.js"),
        output: [
            {
                file: "lib/server.production.min.js",
                format: "cjs",
                ...libOptions,
                ...serverOptions
            }
        ],
        plugins: productionPlugins,
        external: serverExternals
    }
];
