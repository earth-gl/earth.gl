/**
 * 判断数值是否是2次幂
 * @param {Number} value 
 */
const isPowerOf2 = function(value) {
    return (value & (value - 1)) == 0;
};

module.exports = isPowerOf2;