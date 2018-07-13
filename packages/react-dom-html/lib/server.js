if (process.env.NODE_ENV === "production") {
    module.exports = require(__dirname + "/server.production.min.js");
} else {
    module.exports = require(__dirname + "/server.development.js");
}
