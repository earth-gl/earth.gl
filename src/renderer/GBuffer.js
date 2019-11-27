/**
 * @author yellow date 2019/1/29
 * @class
 */
class GBuffer {
    /**
     * 
     * @param {WebGLRenderingContext} gl 
     * @param {typedArrayBuffer} data 
     * @param {Number} bufferType gl.ARRAY_BUFFER
     * @param {Number} drawType gl.STATIC_DRAW
     */
    constructor(gl, data, bufferType, drawType) {
        /**
         * @type {WebGLRenderingContext}
         */
        this._gl = gl;
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
     * @type {TypedArrayBuffer}
     */
    get typedArrayBuffer(){
        return this._data;
    }
    /**
     * convert the buffer type to Element_Array_Buffer
     */
    toIndexBuffer(){
        const gl = this._gl;
        this._bufferType = gl.ELEMENT_ARRAY_BUFFER;
        return this;
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