/**
 * @author yellow date 2019/1/29
 * @class
 */
class GBuffer {
    /**
     * 
     * @param {GProgram} gProgram 
     * @param {typedArrayBuffer} data 
     * @param {Number} bufferType gl.ARRAY_BUFFER
     * @param {Number} drawType gl.STATIC_DRAW
     */
    constructor(gProgram, data, bufferType, drawType) {
        /**
         * @type {GProgram}
         */
        this._gProgram = gProgram;
        /**
         * @type {WebGLRenderingContext}
         */
        this._gl = gProgram._gl;
        /**
         * @type {typedArrayBuffer}
         */
        this._data = data;
        /**
         * @type {Number}
         */
        this._bufferType = bufferType;
        /**
         * @type {Number}
         */
        this._drawType = drawType;
        /**
         * @type {WebGLBuffer}
         */
        this._buffer = this._createBuffer();
    }
    /**
     * create webgl buffer
     */
    _createBuffer() {
        const gl = this._gl;
        const buffer = gl.createBuffer();
        return buffer;
    }
    /**
     * active current buffer
     */
    bindBuffer() {
        const gl = this._gl,
            buffer = this._buffer,
            bufferType = this._bufferType;
        gl.bindBuffer(bufferType, buffer);
    }
    /**
     * buffer data to graphic memory
     */
    bufferData() {
        const gl = this._gl,
            bufferType = this._bufferType,
            drawType = this._drawType,
            data = this._data;
        gl.bufferData(bufferType, data, drawType);
    }
}

module.exports = GBuffer;