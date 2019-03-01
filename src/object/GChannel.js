const GTarget = require('./GTarget');
/**
 * @class
 */
class GChannel {
    /**
     * 
     * @param {Object} resource 
     * @param {Object} [resource.animationSamplers]
     * @param {Object} options 
     */
    constructor(resource, options) {
        /**
         * 
         */
        this._resource = resource;
        /**
         * 
         */
        this._channelJson = options;
        /**
         * 
         */
        this.c = options;
        /**
         * @type {GAnimationSampler}
         */
        this.sampler = resource.samplers[options.sampler];
        /**
         * @type {GTarget}
         */
        this.target = new GTarget(options.target);
        /**
         * 
         */
        this.extensions = options.extensions !== undefined ? options.extensions : null;
        /**
         * 
         */
        this.extras = options.extras !== undefined ? options.extras : null;
    }

}

module.exports = GChannel;