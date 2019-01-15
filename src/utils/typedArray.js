const decode = require("./decode");
/**
 * Uint16Array length limits
 */
const SIXTY_FOUR_KILOBYTES = 64 * 1024;

const createTypedArrayFromArrayBuffer = function (numberOfVertices, sourceArray, byteOffset, length) {
    if (numberOfVertices >= SIXTY_FOUR_KILOBYTES) {
        return new Uint32Array(sourceArray, byteOffset, length);
    }
    return new Uint16Array(sourceArray, byteOffset, length);
}

const getStringFromTypedArray = function (uint8Array, byteOffset, byteLength) {
    byteOffset = byteOffset || 0;
    byteLength = byteLength || uint8Array.byteLength - byteOffset;
    uint8Array = uint8Array.subarray(byteOffset, byteOffset + byteLength);
    return decode(uint8Array);
}

module.exports = {
    createTypedArrayFromArrayBuffer,
    getStringFromTypedArray
};