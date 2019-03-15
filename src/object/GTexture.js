/**
 * @class
 */
class GTexture{

    /**
     * @param {Object} resource 
     * @param {Object} resource.samplers 
     * @param {Object} resource.images
     * 
     * @param {Object} options 
     * @param {String} options.name
     * @param {String} options.sampler
     * @param {String} options.source
     * @param {String} options.extensions
     * @param {String} options.extras
     */
    constructor(resource,options){
        this.name = options.name !== undefined ? options.name : null;
        this.sampler = options.sampler !== undefined ? resource.samplers[options.sampler] : null;
        this.source = options.source !== undefined ? resource.images[options.source] : null;
        this.extensions = options.extensions !== undefined ? options.extensions : null;
        this.extras = options.extras !== undefined ? options.extras : null;
        // runtime
        this.texture = null;
    }
}

module.exports = GTexture;