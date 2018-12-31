
const merge = require("./../utils/merge");

const CONTEXT_OPTIONS = {
    alpha: false,
    depth: true,
    stencil: true,
    antialias: false,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    failIfMajorPerformanceCaveat: false
};

/**
 * @class Scene
 */
class Scene {

    /**
     * 
     * @param {Object} [options]
     * @param {Canvas} options.canvas
     * @param {Object} [options.contextOptions]
     * @param {Boolean} [options.shadow=false]
     */
    constructor(options) {
        /**
         * @type {Canvas}
         */
        this._canvas = options.canvas;
        /**
         * @type {Object}
         */
        this._contextOptions = merge(CONTEXT_OPTIONS, options.contextOptions || {});
        /**
         * 
         */
        this._shadow = options.shadow ||false;
    }

}

module.exports = Scene;