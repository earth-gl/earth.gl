/**
 * assign kiwi.gl object to be an unique id in the global
 * @author yellow 2017/5/26
 */

const isObject = require('./isObject'),
    isString = require('./isString'),
    _prefix = '_earth.gl_',
    _prefixId = _prefix + 'id_';
/**
 * the seed of id
 */
let i = 1;
/**
 * get uniqueId and count++
 * @param {String} prefix 
 */
const getId = (prefix) => {
    return (prefix || _prefixId) + '_' + (i++);
};
/**
 * 
 * @param {Object} obj 
 * @param {String} id 
 */
const setId = (obj, id) => {
    if (isObject(obj) && isString(id)) {
        obj._kiwi_gl_id_ = id;
        return id;
    }
    return null;
}
/**
 * get the unique id
 * @method stamp
 * @param {Object} obj 
 * @return {String} error if returned 'null'
 */
const stamp = (obj, prefix = _prefix) => {
    if (!obj) return null;
    return !obj._earth_gl_id_ ? setId(obj, getId(prefix)) : obj._earth_gl_id_;
};

module.exports = stamp;