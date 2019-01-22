/**
 * @typedef {import("./GProgram")} GProgram
 */

/**
 * @module
 * @export
 * @class
 * @example
 * var buffer = new Buffer();
 * buffer.bindBuffer();
 * buffer.bufferData();
 */
class GBuffer {
    /**
     * Creates an instance of Buffer.
     * 与GAccessor搭配使用
     * @param {GProgram} program 
     * @param {Number} bufferType gl.ARRAY_BUFFER
     * @param {number} drawType gl.STATIC_DRAW 
     * @param {Array} typedArrayBufferData "a_position"
     * @memberof Buffer
     */
    constructor(program, bufferType, drawType, typedArrayBufferData, byteLength, byteOffset, byteStride) {
        /**
         * @type {GProgram}
         */
        this._program = program;
        /**
         * @type {WebGLRenderingContext}
         */
        this._gl = program._gl;
        /**
         * @type {WebGLBuffer}
         */
        this._buffer = this._createBuffer();
        /**
         * @type {Number}
         */
        this._bufferType = bufferType;
        /**
         * @type {Number}
         */
        this._drawType = drawType;
        /**
         * 
         */
        this.byteLength = byteLength;
        /**
         * 
         */
        this.byteStride = byteStride;
        /**
         * 
         */
        this.byteOffset = byteOffset;
        /**
         * @type {TypedArray}
         * typedArrayBufferData.slice(this._offset,this._offset+this._byteLength);
         */
        this._data = typedArrayBufferData;
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
    bufferData(arr) {
        const gl = this._gl,
            bufferType = this._bufferType,
            drawType = this._drawType;
        const typedArrayBufferData = this._data || arr;
        gl.bufferData(bufferType, typedArrayBufferData, drawType);
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

module.exports = GBuffer;