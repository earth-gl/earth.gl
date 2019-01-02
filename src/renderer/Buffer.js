/**
 * @typedef {import("./Program")} Program
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
class Buffer {
    /**
     * Creates an instance of Buffer.
     * @param {Program} program 
     * @param {Number} bufferType 
     * @param {number} drawType gl.STATIC_DRAW 
     * @param {string} attribName 
     * @memberof Buffer
     */
    constructor(program, bufferType, drawType, attribName) {
        /**
         * @type {Program}
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
         * @type {String}
         */
        this._attribName= attribName;
    }

    /**
     * 
     * @param {number} type gl.ARRAY_BUFFER
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
    bufferData(arr){
        const gl = this._gl,
            bufferType = this._bufferType,
            drawType = this._drawType;
            gl.bufferData(bufferType, new Float32Array(arr), drawType);
    }

    /**
     * enable attrib pointer
     */
    _vertexAttriPointer(size,type,normalize,stride,offset){
        const gl = this._gl;
        
    }

    _createBuffer() {
        const gl = this._gl;
        const buffer = gl.createBuffer();
        return buffer;
    }

}

module.exports = Buffer;