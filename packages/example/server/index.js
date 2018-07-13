require("ignore-styles");
const babelRegister = require("babel-register");
const express = require("express");
const path = require("path");

babelRegister({
    ignore: /\/(build|node_modules)\//,
    // presets: ["react-app"]
    presets: ["env", "react", "flow"],
    plugins: [
        "transform-object-rest-spread",
        "transform-class-properties",
        ["transform-react-remove-prop-types", { removeImport: true }],
        [
            "styled-components",
            {
                ssr: true
            }
        ]
    ]
});

function renderRequest(render, req, res) {
    if (typeof req.query.stream !== "undefined") {
        console.log("renderToStream");
        render.streamResponse(req, res);
    } else {
        console.log("renderToString");
        render.stringResponse(req, res);
    }
}

const app = express();

// Application
const render = require("./render");
app.get("/", function(req, res) {
    renderRequest(render, req, res);
});

// Static resources
app.use(express.static(path.resolve(__dirname, "..", "build")));

app.listen(3000, () => {
    console.log("Listening on port 3000...");
});

app.on("error", function(error) {
    if (error.syscall !== "listen") {
        throw error;
    }

    var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

    switch (error.code) {
        case "EACCES":
            console.error(bind + " requires elevated privileges");
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(bind + " is already in use");
            process.exit(1);
            break;
        default:
            throw error;
    }
});
