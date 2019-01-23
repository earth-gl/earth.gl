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
     * @param {Number} bufferType gl.ARRAY_BUFFER gl.ELEMENT_BUFFER
     * @param {number} drawType gl.STATIC_DRAW gl.DYNAMIC_DRAW
     * @param {Array} typedArrayBufferData
     * @param {Number} byteLength
     * @param {Number} [byteOffset] default 0
     * @param {Number} [byteStride] default 0
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
         * 
         */
        this._data = typedArrayBufferData.slice(this.byteOffset, this.byteOffset + this.byteLength);
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
            drawType = this._drawType;
        const typedArrayBufferData = this._data;
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