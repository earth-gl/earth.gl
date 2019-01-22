const Type2NumOfComponent = {
    "SCALAR": 1,
    "VEC2": 2,
    "VEC3": 3,
    "VEC4": 4,
    "MAT2": 4,
    "MAT3": 9,
    "MAT4": 16
};
/**
 * 与GBuffer搭配，为Buffer设置attribName的读取方式等
 * @class
 */
class Accessor {
    /**
     * 
     * @param {*} componentType 
     * @param {*} byteOffset 
     * @param {*} normalized 
     * @param {*} count 
     * @param {*} type 
     * @param {GBuffer} gBuffer 
     */
    constructor(componentType, byteOffset, normalized, count, type, gBuffer) {
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
        this.byteOffset = byteOffset;
        /**
         * @type {Number}
         */
        this.byteStride = gBuffer.byteStride;
        /**
         * 
         */
        this.normalized = normalized;
        /**
         * 
         */
        this.count = count;
        /**
         * 
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
    }
    /**
     * 
     * @param {String} attribName 
     */
    link(attribName) {
        const program = this.bufferView._program,
            gl = program._gl;
        this.location = program.ActivateAttributes[attribName];
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
    /**
     * relink attrib pointer
     */
    relink() {
        const program = this.bufferView._program,
            gl = program._gl;
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