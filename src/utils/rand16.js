/**
 * 获取16位随机数
 */
const rand16 = function () {
    return Math.random().toString().substr(2);
};

module.exports = rand16;