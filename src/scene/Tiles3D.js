/**
 * 
 */
const B3DMLoader = require('../loader/B3DMLoader'),
    { EPSILON7 } = require('./../utils/revise');
/**
 * @author
 * @class
 */
class Tiles3D {
    /**
     * @typedef {import("./../camera/PerspectiveCamera")} PerspectiveCamera
     * @param {Object} options 
     * @param {String} options.url
     */
    constructor(options) {
        /**
         * @type {String}
         */
        this.url = options.url;
        /**
         * @type {WebGLRenderingContext}
         */
        this.gl = null;
        /**
         * @type {PerspectiveCamera}
         */
        this.camera = null;
    }
    /**
     * @typedef {import("./../camera/PerspectiveCamera")} PerspectiveCamera
     * @typedef {import("./../scene/Global")} Global
     * @param {WebGLRenderingContext} gl 
     * @param {Global} global 
     */
    _init(gl, global) {
        this.gl = gl;
        this.camera = global._camera;
        global.on('zoomend loaded mouseup', this._updateTiles3DByDistanceError, this);
        this._requestData();
    }
    /**
     * 
     */
    _requestData(){
        const url = this.url,
            that = this;
        fetch(url, {
            responseType: 'json'
        }).then(response => {
            return response.json();
        }).then(json => {
            that._processJson(json);
        });
    }
    /**
     * 
     */
    _processJson(json){
        const sss = json;
    }
    /**
     * @typedef {import("./../core/BoundingSphere")} BoundingSphere
     * @param {BoundingSphere} boundSphere 
     */
    _spaceError(boundSphere) {
        const camera = this.camera;
        const geometricError = 111;
        //1 calcute distance to center
        const distance = boundSphere.distance(camera.position.clone());
        //2.use came sseDenominator
        const sseDenominator = camera.sseDenominator;
        const error = (geometricError*camera.height)/(distance*sseDenominator);
        return error;
    }
    /**
     * 
     */
    _updateTiles3DByDistanceError(){

    }

}

module.exports = Tiles3D;