const GBuffer = require("./GBuffer");
/**
 * @class
 */
class GPrimitive {
    /**
     * 
     * @param {*} gltf 
     * @param {Object} pJson config form gltf json
     */
    constructor(gltf, pJson) {
        /**
         * 
         */
        this.p = pJson;
        /**
         * 
         */
        this.gltf = gltf;
        /**
         * 
         */
        this.attributes = pJson.attributes;
        /**
         * accessor id
         */
        this.indices = pJson.indices !== undefined ? pJson.indices : null;
        /**
         * 
         */
        this.extensions = pJson.extensions !== undefined ? pJson.extensions : null;
        /**
         * 
         */
        this.extras = pJson.extras !== undefined ? pJson.extras : null;
        /**
         * 
         */
        this._initAttrib();
        /**
         * 
         */
        this._initAccessor();
        /**
         * 
         */
        this._initMaterial();
    }
    /**
     * 
     */
    _initAttrib() {
        const p = this.p;
        if (p.extensions !== undefined) {
            if (p.extensions.gl_avatar !== undefined) {
                if (p.extensions.gl_avatar.attributes) {
                    for (const attribName in p.extensions.gl_avatar.attributes) {
                        this.attributes[attribName] = p.extensions.gl_avatar.attributes[attribName];
                    }
                }
            }
        }
    }
    /**
     * 
     * @param {GProgram} program 
     */
    createIndicesBuffer(program){
        const gl = program._gl,
            indices = this.indices,
            indicesComponentType = this.indicesComponentType,
            indicesLength = this.indicesLength,
            indicesOffset = this.indicesOffset,
            bufferData = this.gltf.accessors[indices].bufferView;
        const indicesBuffer = new GBuffer(
            program,indicesComponentType,
            gl.STATIC_DRAW,bufferData,
            indicesLength,indicesOffset,0);
        return indicesBuffer;
    }
    /**
     * 
     */
    _initAccessor() {
        const gltf = this.gltf;
        if (this.indices !== null) {
            this.indicesComponentType = gltf.json.accessors[this.indices].componentType;
            this.indicesLength = gltf.json.accessors[this.indices].count;
            this.indicesOffset = gltf.json.accessors[this.indices].byteOffset || 0;
        } else {
            // assume 'POSITION' is there
            this.drawArraysCount = gltf.json.accessors[this.attributes.POSITION].count;
            this.drawArraysOffset = gltf.json.accessors[this.attributes.POSITION].byteOffset || 0;
        }
        for (const attribName in this.attributes) {
            this.attributes[attribName] = gltf.accessors[this.attributes[attribName]];
        }
    }
    /**
     * 
     */
    _initMaterial() {
        const gltf = this.gltf,
            p = this.p;
        /**
         * 
         */
        this.material = p.material !== undefined ? gltf.materials[p.material] : null;
        /**
         * default: gl.TRIANGLES
         */
        this.mode = p.mode !== undefined ? p.mode : 4;
        /**
         * gl.ARRAY_BUFFER or gl.ELEMENT_BUFFER
         */
        this.targets = p.targets;
    }
}

module.exports = GPrimitive;