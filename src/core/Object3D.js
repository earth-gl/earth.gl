/**
 * @class Object3D
 */
class Object3D {

    constructor() {
        /**
         * @type {WebGLRenderingContext}
         */
        this._gl;
    }
    /**
     * 
     * @param {WebGLRenderingContext} gl 
     */
    hook(gl) {
        this._gl = gl;
    }
}

module.exports = Object3D;