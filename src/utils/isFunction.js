/**
 * 
 * @param {*} obj 
 * @returns {Boolean}
 */
const isFunction = (obj) => {
    return typeof obj == 'function' || false;
}

module.exports = isFunction;