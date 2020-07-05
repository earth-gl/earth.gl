/**
 * 判断数值是否是2次幂
 * @param {Number} value 
 */
const isPowerOf2 = function (n) {
    return n > 0 && (n & (n - 1)) == 0;
};

module.exports = isPowerOf2;