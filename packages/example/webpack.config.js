const path = require("path");
const WebpackAssetsManifest = require("webpack-assets-manifest");

module.exports = {
    entry: "./src/index.js",
    output: {
        path: path.resolve("build"),
        filename: "[name]-[hash].js"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: "babel-loader"
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: "style-loader",
                        options: {
                            attrs: { "data-react-dom-html-tags": false }
                        }
                    },
                    { loader: "css-loader" }
                ]
            }
        ]
    },
    plugins: [
        new WebpackAssetsManifest({
            // Options go here
        })
    ]
};
