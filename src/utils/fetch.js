/**
 * @function
 */
const isNode = require("./isNode"),
    nativeFetch = isNode?require("node-fetch"):fetch;

module.exports = nativeFetch;