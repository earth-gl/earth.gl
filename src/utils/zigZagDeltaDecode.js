
const zigZagDecode = function (value) {
    return (value >> 1) ^ (-(value & 1));
}

const zigZagDeltaDecode = function (uBuffer, vBuffer, heightBuffer) {
    var count = uBuffer.length;
    var u = 0;
    var v = 0;
    var height = 0;
    for (var i = 0; i < count; ++i) {
        u += zigZagDecode(uBuffer[i]);
        v += zigZagDecode(vBuffer[i]);
        uBuffer[i] = u;
        vBuffer[i] = v;
        height += zigZagDecode(heightBuffer[i]);
        heightBuffer[i] = height;
    }
}

module.exports = zigZagDeltaDecode;