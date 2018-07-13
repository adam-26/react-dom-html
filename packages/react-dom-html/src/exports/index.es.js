if (process.env.NODE_ENV === "production") {
    module.exports = require(__dirname + "/index.production.min.es.js");
} else {
    module.exports = require(__dirname + "/index.development.es.js");
}
