

/**
 * @class WebGLRenderer
 */
class WebGLRenderer{

    /**
     * 
     * @param {Object} options 
     * @param {WebGLRenderingContext} options.gl 
     */
    constructor(options){
        /**
         * @type {WebGLRenderingContext}
         */
        this._gl = options.gl;
    }

}

module.exports = WebGLRenderer;