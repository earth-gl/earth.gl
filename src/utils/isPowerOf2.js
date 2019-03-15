const isPowerOf2 = function(value) {
    return (value & (value - 1)) == 0;
};

module.exports = isPowerOf2;