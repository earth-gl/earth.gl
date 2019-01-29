const GBuffer = require('./../renderer/GBuffer');
/**
 * convert type to number  
 * 枚举
 */
const TYPE2NUMOFCOMPONENT = {
    'SCALAR': 1,
    'VEC2': 2,
    'VEC3': 3,
    'VEC4': 4,
    'MAT2': 4,
    'MAT3': 9,
    'MAT4': 16
};
/**
 * 与GBuffer搭配，为Buffer设置attribName的读取方式等
 * @class
 */
class GAccessor {
    /**
     * @example
     * const verticesAccessor = new GAccessor(gProgram, verticesBuffer, gl.FLOAT, "VEC3");
     *
     * @param {GProgram} gProgram
     * @param {GBufferView} gBufferView 
     * @param {Number} componentType  gl.Float or others
     * @param {String} read type, SCALAR, VEC2, VEC3, VEC4, MAT4, MAT3, MAT4
     * @param {Number} count log this accessor need how much data form raw length
     * @param {Object} [options] 记录对原始buffer的处理方法
     * @param {Number} [options.byteOffset]
     * @param {Boolean} [options.normalized]
     * @param {Array} [options.min]
     * @param {Array} [options.max]
     */
    constructor(gProgram, gBufferView, componentType, type, count, options = {}) {
        /**
         * @type {GProgram}
         */
        this._gProgram = gProgram;
        /**
         * @type {WebGLRenderingContext}
         */
        this._gl = gProgram._gl;
        /**
         * @type {GBuffer}
         */
        this._gBufferView = gBufferView;
        /**
         * @type {Number}
         */
        this._componentType = componentType;
        /**
         * @type {String}
         */
        this._type = type;
        /**
         * @type {Number}
         */
        this._count = count;
        /**
         * @type {Number}
         */
        this._byteOffset = options.byteOffset !== undefined ? options.byteOffset : 0;
        /**
         * @type {Number}
         */
        this._byteStride = gBufferView.byteStride || 0;
        /**
         * @type {Boolean}
         */
        this._normalized = options.normalized !== undefined ? options.normalized : false;
        /**
         * 指示attrib读取数据方式, 例如VEC3 表示每个点输入有三个数据，totallength = typeSize * 3
         * @type {Number}
         */
        this._typeSize = TYPE2NUMOFCOMPONENT[type];
        /**
         * attribName location
         * @type {Number}
         */
        this._location = null;
        /**
         * boundingbox min
         */
        this._min = options.min;
        /**
         * boundingbox max
         */
        this._max = options.max;
        /**
         * support buffer bind, buffer data
         * @type {GBuffer}
         */
        this._gBuffer = this._createGBuffer();
    }
    /**
     * 
     */
    _createGBuffer() {
        const gProgram = this._gProgram,
            gBufferView = this._gBufferView,
            componentType = this._componentType,
            typeSize = this._typeSize,
            count = this._count,
            gBuffer = gBufferView.toTypedArray(gProgram, componentType, typeSize, count, 0);
        return gBuffer;
    }
    /**
     * 
     */
    bindBuffer() {
        const gBuffer = this._gBuffer;
        gBuffer.bindBuffer();
    }
    /**
     * 
     */
    bufferData() {
        const gBuffer = this._gBuffer;
        gBuffer.bufferData();
    }
    /**
     * 
     * @param {String} attribName 
     */
    link(attribName) {
        const gProgram = this._gProgram,
            gl = this._gl,
            location = gProgram.ActivateAttributes[attribName];
        //enable vertex attrib 
        gl.vertexAttribPointer(
            location,
            this._typeSize,
            this._componentType,
            this._normalized,
            this._byteStride,
            this._byteOffset
        );
        gl.enableVertexAttribArray(location);
        //store location
        this._location = location;
    }
    /**
     * relink attrib pointer
     */
    relink() {
        const gl = this._gl,
            location = this._location;
        //bind buffer
        this.bindBuffer();
        //turn on attribName
        gl.vertexAttribPointer(
            location,
            this._typeSize,
            this._componentType,
            this._normalized,
            this._byteStride,
            this._byteOffset
        );
        gl.enableVertexAttribArray(location);
    }
}

module.exports = GAccessor;