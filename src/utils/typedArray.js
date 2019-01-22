const decode = require("./decode");
//Uint16Array length limits
const SIXTY_FOUR_KILOBYTES = 64 * 1024;
// TODO: get from gl context
var ComponentType2ByteSize = {
    5120: 1, // BYTE
    5121: 1, // UNSIGNED_BYTE
    5122: 2, // SHORT
    5123: 2, // UNSIGNED_SHORT
    5126: 4  // FLOAT
};
/**
 * https://github.com/shrekshao/minimal-gltf-loader/blob/21a758c0ebc8f62e053682344610392a39012a36/src/minimal-gltf-loader.js#L1189
 * @param {*} buffer 
 * @param {*} byteOffset 
 * @param {*} countOfComponentType 
 * @param {*} componentType 
 */
const arrayBuffer2TypedArray = function(buffer, byteOffset, countOfComponentType, componentType){
    switch(componentType) {
        // @todo: finish
        case 5122: return new Int16Array(buffer, byteOffset, countOfComponentType);
        case 5123: return new Uint16Array(buffer, byteOffset, countOfComponentType);
        case 5124: return new Int32Array(buffer, byteOffset, countOfComponentType);
        case 5125: return new Uint32Array(buffer, byteOffset, countOfComponentType);
        case 5126: return new Float32Array(buffer, byteOffset, countOfComponentType);
        default: return null; 
    }
}

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