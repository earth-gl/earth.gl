/**
 *  @author }{yellow 2017/4/18
*   @returns {Object} 合并后对象
 *  (Object[, Object, ...]) ->
 *  @param {*} dest 
 */
const merge = function(dest) {
    for (let i = 1; i < arguments.length; i++) {
        const src = arguments[i];
        for (const k in src) {
            dest[k] = src[k];
        }
    }
    return dest;
};

module.exports = merge;