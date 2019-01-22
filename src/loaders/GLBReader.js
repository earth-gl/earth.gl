const textDecoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-8") : null;

const extraByteMap = [1, 1, 1, 1, 2, 2, 3, 0];

const stringFromUTF8Array = function (data) {
    const count = data.length;
    let str = "";

    for (let index = 0; index < count;) {
        let ch = data[index++];
        if (ch & 0x80) {
            let extra = extraByteMap[(ch >> 3) & 0x07];
            if (!(ch & 0x40) || !extra || ((index + extra) > count))
                return null;

            ch = ch & (0x3F >> extra);
            for (; extra > 0; extra -= 1) {
                const chx = data[index++];
                if ((chx & 0xC0) !== 0x80)
                    return null;

                ch = (ch << 6) | (chx & 0x3F);
            }
        }

        str += String.fromCharCode(ch);
    }
    return str;
};

const readString = function (buffer, offset, byteLength) {
    if (textDecoder) {
        const arr = new Uint8Array(buffer, offset, byteLength);
        return textDecoder.decode(arr);
    } else {
        const arr = new Uint8Array(buffer, offset, byteLength);
        return stringFromUTF8Array(arr);
    }
};
/**
 * @class
 */
class GLBReader {

    constructor() {

    }
    /**
     * @param {ArrayBuffer} glb 
     * @param {Number} glbOffset 
     * @returns {Object}
     */
    static read(glb, glbOffset) {
        const dataView = new DataView(glb, glbOffset),
            version = dataView.getUint32(4, true);
        if (version === 1) {
            return this._readV1(dataView, glbOffset);
        } else if (version === 2) {
            return this._readV2(dataView, glbOffset);
        } else {
            throw new Error("Unsupported glb version : " + version);
        }
    }
    /**
     * reference:
     * https://github.com/KhronosGroup/glTF/tree/master/extensions/1.0/Khronos/KHR_binary_glTF
     * 
     * @param {DataView} dataView 
     * @param {Number} glbOffset 
     */
    static _readV1(dataView, glbOffset) {
        const length = dataView.getUint32(8, true);
        const contentLength = dataView.getUint32(12, true);
        if (length !== dataView.buffer.byteLength - glbOffset) {
            throw new Error("Length in GLB header is inconsistent with glb's byte length.");
        }
        const json = readString(dataView.buffer, 20 + glbOffset, contentLength);
        return {
            json: JSON.parse(json),
            glbBuffer: {
                byteOffset: 20 + glbOffset + contentLength,
                buffer: dataView.buffer
            }
        };
    }
    /**
     * 
     * @param {DataView} dataView 
     * @param {Number} glbOffset 
     */
    static _readV2(dataView, glbOffset) {
        //const totalLength = dataView.getUint32(8, true);
        throw new Error("GLB v2 not implemented..." + dataView + glbOffset);
    }

}

module.exports = GLBReader;