

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

    render(scene){
        //
        const gl = this._gl;
    }

}

module.exports = WebGLRenderer;