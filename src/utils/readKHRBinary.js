/**
 * create textDecoder
 */
const textDecoder = require('./textDecoder');

const readString = function (buffer, offset, byteLength) {
    const arr = new Uint8Array(buffer, offset, byteLength);
    return textDecoder.decode(arr);
}

const readKHRBinary = function (buffer, byteOffset = 0) {
    const dataView = new DataView(buffer, byteOffset);
    //glb and binary gltf version at the same position
    //https://github.com/KhronosGroup/glTF/tree/master/extensions/1.0/Khronos/KHR_binary_glTF
    //https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#glb-file-format-specification
    const version = dataView.getUint32(4, true);
    const length = dataView.getUint32(8, true);
    const contentLength = dataView.getUint32(12, true);
    if (length !== dataView.buffer.byteLength - byteOffset) throw new Error('Length in GLB header is inconsistent with glb\'s byte length.');
    if (version === 1) {
        //KHR_binary_glTF
        const json = readString(dataView.buffer, 20 + byteOffset, contentLength);
        return {
            json: JSON.parse(json),
            subglb: {
                byteOffset: 20 + byteOffset + contentLength,
                buffer: dataView.buffer
            }
        }
    } else {
        return null;
    }
}

module.exports = readKHRBinary;