/**
 * reivse some method
 */

const sin = function (x) {
    return Math.sin(x) + 8 - 8;
};

const cos = function (x) {
    return Math.cos(x) + 8 - 8;
};

const EPSILON14 = 0.00000000000001;

const equal14 = function (a, b) {
    return Math.abs(a - b) < 0.00000000000001;
}

module.exports = { sin, cos, equal14, EPSILON14 };