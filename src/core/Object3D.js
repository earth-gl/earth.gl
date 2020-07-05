/**
 * 3d 可渲染对象基类
 * @typedef {import("./../camera/Camera")} Camera
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
     * 渲染, 指定相机参数渲染
     * @param {Camera} camera
     */
    render(camera){

    }
}

module.exports = Object3D;