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
     * @param {GProgram} program 
     * @param {Number} bufferType gl.ARRAY_BUFFER
     * @param {number} drawType gl.STATIC_DRAW 
     * @param {string} attribName "a_position"
     * @memberof Buffer
     */
    constructor(program, bufferType, drawType, attribName) {
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
         * @type {String}
         */
        this._attribName = attribName;
        /**
         * @type {Number}
         */
        this._attribLocation = program.ActivateAttributes[attribName];
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
        gl.bufferData(bufferType, arr, drawType);
    }

    /**
     * turn on the attribute
     * 制定数据输入方式和输入管道
     * 关联缓冲区对象和position变量
     */
    linkPointerAndPosition(size, type, normalize, stride, offset) {
        const gl = this._gl,
            program = this._program,
            attribName = this._attribName,
            attribLocation = this._attribLocation;
        gl.vertexAttribPointer(attribLocation, size, type, normalize, stride, offset);
        gl.enableVertexAttribArray(attribLocation);
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