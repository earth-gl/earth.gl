/**
 * 解决 v 值是 0 时，判断错误的情况
 * @function
 */
const defaultValue = function (v) {
    return v !== undefined ? v : null;
}

module.exports = defaultValue;