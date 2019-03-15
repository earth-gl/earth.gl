/**
 * @class
 */
class GPrimitive {
    /**
     * 
     * @param {Object} resource 
     * @param {Object} options config form gltf json
     */
    constructor(resource, options) {
        /**
         * 
         */
        this.options = options;
        /**
         * 
         */
        this.resource = resource;
        /**
         * 
         */
        this.attributes = options.attributes;
        /**
         * accessor id
         */
        this.indices = options.indices !== undefined ? options.indices : null;
        /**
         * 
         */
        this.extensions = options.extensions !== undefined ? options.extensions : null;
        /**
         * 
         */
        this.extras = options.extras !== undefined ? options.extras : null;
        /**
         * 
         */
        this._processAttrib(options);
        /**
         * 
         */
        this._processAccessor(resource);
        /**
         * 
         */
        this._processMaterial(resource, options);
    }
    /**
     * 
     */
    _processAttrib(options) {
        if (options.extensions !== undefined) {
            if (options.extensions.gl_avatar !== undefined) {
                if (options.extensions.gl_avatar.attributes) {
                    for (const attribName in options.extensions.gl_avatar.attributes) {
                        this.attributes[attribName] = options.extensions.gl_avatar.attributes[attribName];
                    }
                }
            }
        }
    }
    /**
     * 
     */
    _processAccessor(resource) {
        if (this.indices !== null) {
            this.indicesComponentType = resource.json.accessors[this.indices].componentType;
            this.indicesLength = resource.json.accessors[this.indices].count;
            this.indicesOffset = resource.json.accessors[this.indices].byteOffset || 0;
            this.indicesBuffer = resource.accessors[this.indices]._gBuffer.toIndexBuffer();
        } else {
            // assume 'POSITION' is there
            this.drawArraysCount = resource.json.accessors[this.attributes.POSITION].count;
            this.drawArraysOffset = resource.json.accessors[this.attributes.POSITION].byteOffset || 0;
        }
        for (const attribName in this.attributes) {
            this.attributes[attribName] = resource.accessors[this.attributes[attribName]];
        }
    }
    /**
     * 
     */
    _processMaterial(resource, options) {
        //material
        this.material = options.material !== undefined ? resource.materials[options.material] : null;
        //the option draw mode , gl.Trangles/gl.Points/gl.Line/...
        this.mode = options.mode !== undefined ? options.mode : 4;
        //gl.ARRAY_BUFFER or gl.ELEMENT_BUFFER
        this.targets = options.targets;
    }
}

module.exports = GPrimitive;