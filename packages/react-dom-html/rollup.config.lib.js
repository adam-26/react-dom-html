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

const commonPlugins = [
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
    })
];

const devPlugins = commonPlugins.concat([filesize()]);

function buildProductionPlugins(uglifyOptions = {}) {
    return [
        replace({
            "process.env.NODE_ENV": JSON.stringify("production")
        })
    ]
        .concat(commonPlugins)
        .concat([
            uglify({
                ...uglifyOptions,
                warnings: false,
                compress: {
                    passes: 5
                },
                output: {
                    preamble: copyright
                }
            }),
            filesize()
        ]);
}

const productionServerPlugins = buildProductionPlugins();

const productionClientPlugins = buildProductionPlugins({
    // TODO: This breaks the production build -> look @ adding documentation for closure compiler
    // mangle: {
    //     reserved: ["renderHtml", "hydrateHtml", "exports", "querySelector", "render", "hydrate", "getAppContainerProps"],
    //     properties: {
    //         reserved: ["renderHtml", "hydrateHtml", "querySelector", "render", "hydrate", "getAppContainerProps"]
    //     },
    //     toplevel: true
    // }
});

const externals = [
    "exenv",
    "react",
    "react-dom",
    "react-dom/server",
    "hoist-non-react-statics",
    "react-display-name",
    "react-script-tag",
    "hoist-non-react-statics",
    "invariant",
    "prop-types",
    "stream"
];

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
        plugins: devPlugins.concat([
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
        plugins: productionClientPlugins
    },
    {
        input: p.resolve("src/server/index.js"),
        output: [
            {
                file: "lib/server.development.js",
                format: "cjs",
                ...libOptions
            }
        ],
        plugins: devPlugins,
        external: externals
    },
    {
        input: p.resolve("src/server/index.js"),
        output: [
            {
                file: "lib/server.production.min.js",
                format: "cjs",
                ...libOptions
            }
        ],
        plugins: productionServerPlugins,
        external: externals
    }
];
