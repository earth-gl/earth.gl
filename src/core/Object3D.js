/**
 * 3d 可渲染对象基类
 * @class Object3D
 */
class Object3D {
    /**
     * 
     */
    constructor() {
        /**
         * @type {WebGLRenderingContext}
         */
        this._gl;
    }
    /**
     * 钩子，
     * @param {WebGLRenderingContext} gl 
     */
    hook(gl) {
        this._gl = gl;
    }
    /**
     * 渲染
     */
    render(camera){

    }
}

module.exports = Object3D;