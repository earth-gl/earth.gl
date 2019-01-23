/**
 * @class
 */
class GPrimitive{

    constructor(gltf,p){
        /**
         * 
         */
        this.p = p;
        /**
         * 
         */
        this.gltf = gltf;
        /**
         * 
         */
        this.attributes = p.attributes;
        /**
         * accessor id
         */
        this.indices = p.indices !== undefined ? p.indices : null;
        /**
         * 
         */
        this.extensions = p.extensions !== undefined ? p.extensions : null;
        /**
         * 
         */
        this.extras = p.extras !== undefined ? p.extras : null;
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
    _initAttrib(){
        const p = this.p;
        if (p.extensions !== undefined) {
            if (p.extensions.gl_avatar !== undefined) {
                if (p.extensions.gl_avatar.attributes) {
                    for (const attribName in p.extensions.gl_avatar.attributes ) {
                        this.attributes[attribName] = p.extensions.gl_avatar.attributes[attribName];
                    }
                }
            }
        }
    }
    /**
     * 
     */
    _initAccessor(){
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
        for (const attribName in this.attributes ) {
            this.attributes[attribName] = gltf.accessors[this.attributes[attribName]];
        }
    }
    /**
     * 
     */
    _initMaterial(){
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