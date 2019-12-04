/**
 * 载入gltf模型，并在earth下渲染
 */
const Object3D = require('./../core/Object3D'),
    defaultValue = require('./../utils/defaultValue'),
    { GLTF } = require('kiwi.gltfloader');
/**
 * https://github.com/axmand/earth.gl/blob/54d01d4dc843754f2acb51b211edb0d2fa6ed87c/src/loader/GLTFLoader.js
 * @typedef {import ('./../Global')} Global
 */
class GLTFLoader extends Object3D {
    /**
     * gltf full filename
     * @example
     * const gltfLoader = new GLTFLoader("http://localhost:5500/examples/GLTFS/BoxAnimated/BoxAnimated.gltf")
     * @param {String} root 
     * @param {Object} option
     * @param {Number} option.lng
     * @param {Number} option.lat
     * @param {Number} [option.h] 离地面高度，默认是 0
     */
    constructor(root, option) {
        super();
        /**
         * @type {Number}
         */
        this.lng = defaultValue(option.lng) || 0;
        /**
         * @type {Number}
         */
        this.lat = defaultValue(option.lat) || 0;
        /**
         * @type {Number}
         */
        this.h = defaultValue(option.h) || 0;
        /**
         * @type {GLTF}
         */
        this.gltf = new GLTF(root);
    }
    /**
     * @param {WebGLRenderingContext} gl 
     * @param {Global} global 
     */
    hook(gl) {
        super.hook(gl);
        this.gltf.load().then((scene)=>{
            //拆解和渲染
        });
    }
}

module.exports = GLTFLoader;

