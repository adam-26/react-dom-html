if (process.env.NODE_ENV === "production") {
    module.exports = require("./server.production.min.js");
} else {
    module.exports = require("./server.development.js");
}
