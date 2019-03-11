/**
 * create textDecoder
 */
const textDecoder = require('./../utils/textDecoder');
/**
 * @class
 */
class GLBLoader {

    constructor() {

    }
    /**
     * 
     * @param {ArrayBuffer} buffer 
     * @param {Number} byteOffset 
     */
    static load(buffer, byteOffset = 0) {
        const dataView = new DataView(buffer, byteOffset);
        // const version = dataView.getUint32(4, true);
        const length = dataView.getUint32(8, true);
        const contentLength = dataView.getUint32(12, true);
        if(length !== dataView.buffer.byteLength - byteOffset) throw new Error('Length in GLB header is inconsistent with glb\'s byte length.');
        const json = GLBLoader.readString(dataView.buffer, 20 + byteOffset, contentLength);
        return {
            json: JSON.parse(json),
            glbBuffer: {
                byteOffset: 20 + byteOffset + contentLength,
                buffer: dataView.buffer
            }
        }
    }

    static readString(buffer, offset, byteLength) {
        const arr = new Uint8Array(buffer, offset, byteLength);
        return textDecoder.decode(arr);
    }

}

module.exports = GLBLoader;