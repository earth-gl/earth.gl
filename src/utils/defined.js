/**
 * exclude the error of value equals zero 
 * @param {*} obj 
 */
const isNil = function(obj) {
    return obj == null;
};

const defined = function(obj) {
    return !isNil(obj);
};

module.exports = defined;