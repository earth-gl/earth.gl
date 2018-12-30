const Program = require("./Program");


/**
 * 
 */
class Buffer {
    /**
     * 
     * @param {Program} program 
     * @param {number} bufferType 
     * @param {number} attribName 
     * @param {string} attribName 
     */
    constructor(program, bufferType, drawType, attribName) {
        /**
         * use program
         */
        program.useProgram();
        /**
         * 
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
    _vertexAttriPointer(){
        const program = this._program;

    }

    _createBuffer() {
        const gl = this._gl;
        const buffer = gl.createBuffer();
        return buffer;
    }

}

module.exports = Buffer;