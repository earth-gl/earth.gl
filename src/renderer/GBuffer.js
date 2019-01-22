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
        this._byteLength = byteLength;
        /**
         * 
         */
        this._stride = byteStride;
        /**
         * 
         */
        this._offset = byteOffset;
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
     * turn on the attribute
     * 制定数据输入方式和输入管道
     * 关联缓冲区对象和position变量
     * 
     * @param {Number} size 
     * @param {Number} type 
     * @param {Boolean} normalize 
     * @param {Number} stride 
     * @param {Number} offset 
     * @param {String} attribName 
     */
    setlink(size, type, normalize, stride, offset, attribName) {
        const gl = this._gl,
            program = this.program,
            attribLocation = program.ActivateAttributes[attribName];
        gl.vertexAttribPointer(attribLocation, size, type, normalize, stride, offset);
        gl.enableVertexAttribArray(attribLocation);
        //store buffer attributes
        this._size = size;
        this._type = type;
        this._normalize = normalize;
        this._stride = stride;
        this._offset = offset;
        this._attribName = attribName;
        this._attribLocation = attribLocation;
    }
    /**
     * 
     */
    relink() {
        const gl = this._gl,
            attribLocation = this._attribLocation,
            size = this._size,
            type = this._type,
            normalize = this._normalize,
            stride = this._stride,
            offset = this._offset;
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