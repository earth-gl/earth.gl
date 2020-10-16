const rangeValue = function (value, min, max) {
    let v = value > max ? max : value;
    v = v < min ? min : v;
    return v;
}

module.exports = rangeValue;