if (process.env.NODE_ENV === "production") {
    module.exports = require("./index.production.min.es.js");
} else {
    module.exports = require("./index.development.es.js");
}
