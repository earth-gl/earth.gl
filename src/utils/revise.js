/**
 * reivse some method
 */

const sin = function (x) {
    return Math.sin(x) + 8 - 8;
};

const cos = function (x) {
    return Math.cos(x) + 8 - 8;
};

const EPSILON1 = 0.1,
    EPSILON7 = 0.0000001,
    EPSILON12 = 0.000000000001,
    EPSILON14 = 0.00000000000001;

const equal14 = function (a, b) {
    return Math.abs(a - b) < 0.00000000000001;
};

const TYPE2NUMOFCOMPONENT = {
    'SCALAR': 1,
    'VEC2': 2,
    'VEC3': 3,
    'VEC4': 4,
    'MAT2': 4,
    'MAT3': 9,
    'MAT4': 16
};

module.exports = { TYPE2NUMOFCOMPONENT, sin, cos, equal14, EPSILON1, EPSILON7, EPSILON12, EPSILON14 };