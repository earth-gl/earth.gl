const Type2NumOfComponent = {
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
class Accessor {
    /**
     * @example
     * const verticesAccessor = this._verticesAccessor = 
     * new GAccessor(
     *   gl.FLOAT, 0, false, 
     *   this._vertices.length, 
     *   "VEC3", verticesBuffer);
     * @param {Number} componentType 
     * @param {Number} byteOffset 
     * @param {Boolean} normalized 
     * @param {Number} count 
     * @param {String} type 
     * @param {GBuffer} gBuffer 
     */
    constructor(componentType, byteOffset, normalized, count, type, gBuffer, min, max) {
        /**
         * @type {GBuffer}
         */
        this.bufferView = gBuffer;
        /**
         * @type {Number}
         */
        this.componentType = componentType;
        /**
         * @type {Number}
         */
        this.byteOffset = byteOffset!==undefined? byteOffset :0;
        /**
         * @type {Number}
         */
        this.byteStride = gBuffer.byteStride;
        /**
         * @type {Boolean}
         */
        this.normalized = normalized!==undefined?normalized:false;
        /**
         * required
         */
        this.count = count;
        /**
         * required
         */
        this.type = type;
        /**
         * 
         */
        this.size = Type2NumOfComponent[type];
        /**
         * 
         */
        this.location = null;
        /**
         * 
         */
        this.min = min;
        /**
         * 
         */
        this.max = max;
    }
    /**
     * 
     * @param {String} attribName 
     */
    link(attribName) {
        const program = this.bufferView._program,
            gl = program._gl,
            location = program.ActivateAttributes[attribName];
        //
        gl.vertexAttribPointer(
            location,
            this.size,
            this.componentType,
            this.normalized,
            this.byteStride,
            this.byteOffset
        );      
        gl.enableVertexAttribArray(location);
        //store location
        this.location = location;
    }
    /**
     * relink attrib pointer
     */
    relink() {
        const program = this.bufferView._program,
            gl = program._gl,
            location = this.location;
        gl.vertexAttribPointer(
            location,
            this.size,
            this.componentType,
            this.normalized,
            this.byteStride,
            this.byteOffset
        );
        gl.enableVertexAttribArray(location);
    }
}

module.exports = Accessor;