/**
 * @typedef {import("./GProgram")} GProgram
 */
/**
 * get arrayBuffer ctor type
 */
const getArrayCtor = function(componentType){
    switch (componentType) {
        case 0x1400:
            return Int8Array;
        case 0x1401:
            return Uint8Array;
        case 0x1402:
            return Int16Array;
        case 0x1403:
            return Uint16Array;
        case 0x1404:
            return Int32Array;
        case 0x1405:
            return Uint32Array;
        case 0x1406:
            return Float32Array;
        }
};
/**
 * @module
 * @export
 * @class
 * @example
 * 记录的不是 typedBuffer，而是原始的arrayBuffer
 * var buffer = new GBufferView();
 */
class GBufferView {
    /**
     * Creates an instance of Buffer.
     * 与GAccessor搭配使用
     * @param {WebGLRenderingContext} program 
     * @param {Number} bufferType gl.ARRAY_BUFFER gl.ELEMENT_BUFFER
     * @param {number} drawType gl.STATIC_DRAW gl.DYNAMIC_DRAW
     * @param {Array} typedArrayBufferData
     * @param {Number} byteLength
     * @param {Number} [byteOffset] default 0
     * @param {Number} [byteStride] default 0
     * @memberof Buffer
     */
    constructor(gl, bufferType, drawType, typedArrayBufferData, byteLength, byteOffset, byteStride) {
        /**
         * @type {WebGLRenderingContext}
         */
        this._gl = gl;
        /**
         * @type {WebGLBuffer}
         */
        this._buffer = this._createBuffer();
        /**
         * @type {Number}
         * traget, gl.ARRAY_BUFFER, gl.ELEMENT_BUFFER
         */
        this._bufferType = bufferType;
        /**
         * @type {Number}
         */
        this._drawType = drawType;
        /**
         * required
         */
        this.byteLength = byteLength !== undefined ? byteLength : 0;
        /**
         * 
         */
        this.byteStride = byteStride !== undefined ? byteStride : 0;
        /**
         * 
         */
        this.byteOffset = byteOffset !== undefined ? byteOffset : 0;
        /**
         * @type {TypedArray}
         * this._data = typedArrayBufferData.slice(this.byteOffset, this.byteOffset + this.byteLength);
         */
        this._data = typedArrayBufferData.slice(this.byteOffset, this.byteOffset + this.byteLength);
    }
    /**
     * 
     * @param {*} accessorName 
     * @param {*} arrayBuffer 
     * @param {*} offset 
     */
    _toTypedArray(){
    }
    /**
     * 
     * @param {Number} type gl.ARRAY_BUFFER
     */
    bindBuffer() {
        const gl = this._gl,
            bufferType = this._bufferType,
            buffer = this._buffer;
        gl.bindBuffer(bufferType, buffer);
    }
    /**
     * 
     * @param {Array} arr , mat4,vec3...
     */
    bufferData() {
        const gl = this._gl,
            bufferType = this._bufferType,
            drawType = this._drawType,
            data = this._data;
        gl.bufferData(bufferType, data, drawType);
        // gl.bindBuffer(bufferType,null);
    }
    /**
     * 
     */
    _createBuffer() {
        const gl = this._gl;
        const buffer = gl.createBuffer();
        return buffer;
    }

}

module.exports = GBufferView;