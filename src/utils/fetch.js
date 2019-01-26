/**
 * @function
 */
const isNode = require('./isNode');

const nativeFetch = isNode ? require('node-fetch') : fetch;

module.exports = nativeFetch;