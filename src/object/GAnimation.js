const GChannel = require('./GChannel'),
    GAnimationSampler = require('./GAnimationSampler');
/**
 * refrenece:
 * https://github.com/shrekshao/minimal-gltf-loader/blob/21a758c0ebc8f62e053682344610392a39012a36/src/minimal-gltf-loader.js#L760
 * @class
 */
class GAnimation {
    /**
     * @param {Object} resource
     * @param {Object} [resource.accessors]
     * @param {Object} options animJson
     */
    constructor(resource, options) {
        /**
         * config Json
         */
        this._animJson = options;
        /**
         * 
         */
        this._resource = resource;
        /**
         * @type {String} name
         */
        this.name = options.name !== undefined ? options.name : null;
        /**
         * animation samplers
         * @type {GAnimationSampler[]}
         */
        this.animationSamplers = [];
        /**
         * @type {GChannel[]}
         */
        this.channels = [];
        /**
         * extension used in webgl
         */
        this.extensions = options.extensions !== undefined ? options.extensions : null;
        /**
         * extras used in webgl
         */
        this.extras = options.extras !== undefined ? options.extras : null;
        /**
         * intial samplers and channels
         */
        this._initial();
    }
    /**
     * 
     */
    _initial() {
        const animJson = this._animJson,
            resource = this._resource;
        //load animationsampler
        for (let i = 0, len = animJson.samplers.length; i < len; i++) {
            const samplerJson = animJson.samplers[i];
            this.animationSamplers[i] = new GAnimationSampler(resource, samplerJson);
        }
        //load channel
        for (let i = 0, len = animJson.channels.length; i < len; i++) {
            const channelJson = animJson.channels[i];
            this.channels[i] = new GChannel({ animationSamplers: this.animationSamplers }, channelJson);
        }
    }
}

module.exports = GAnimation;