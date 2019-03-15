/**
 * 
 */
const { Vec3, Mat4 } = require('kiwi.matrix'),
    forEach = require('../utils/forEach'),
    BoundingSphere = require('../core/BoundingSphere'),
    B3DMLoader = require('../loader/B3DMLoader'),
    { EPSILON7 } = require('../utils/revise');
/**
 * @author
 * @class
 */
class G3DTiles {
    /**
     * @typedef {import("../camera/PerspectiveCamera")} PerspectiveCamera
     * @param {Object} options 
     * @param {String} options.rootPath
     * @param {string} options.name
     */
    constructor(options) {
        /**
         * @type {String}
         */
        this.rootPath = options.rootPath;
        /**
         * @type {String}
         */
        this.name = options.name;
        /**
         * @type {WebGLRenderingContext}
         */
        this.gl = null;
        /**
         * @type {PerspectiveCamera}
         */
        this.camera = null;
        /**
         * @type {Number}
         */
        this._maximumScreenSpaceError = 0;
        /**
         * @type {Object} 3dtile json
         */
        this.json = null;
        /**
         * @type {Object}
         */
        this.b3dms = {};
    }
    /**
     * @typedef {import("../camera/PerspectiveCamera")} PerspectiveCamera
     * @typedef {import("./GGlobal")} Global
     * @param {WebGLRenderingContext} gl 
     * @param {Global} global 
     */
    _init(gl, global) {
        this.gl = gl;
        this.camera = global._camera;
        this.global = global;
        global.on('zoomend loaded mouseup', this._updateTiles3DByDistanceError, this);
        this._requestData();
    }
    /**
     * 
     */
    _requestData() {
        const url = this.rootPath + this.name,
            that = this;
        fetch(url, {
            responseType: 'json'
        }).then(response => {
            return response.json();
        }).then(json => {
            that.json = json;
        });
    }
    /**
     * 
     */
    _processJson(json) {
        const that = this;
        const gl = this.gl;
        const global = this.global;
        const maximumScreenSpaceError = this._maximumScreenSpaceError;
        const liter = function (tile, parentPath) {
            const geometricError = tile.geometricError;
            const array = tile.boundingVolume.sphere;
            const boundSphere = new BoundingSphere(new Vec3().set(...array), array[3]);
            const error = that._spaceError(boundSphere, geometricError);
            if (error > maximumScreenSpaceError) {
                //1.cache 
                const content = tile.content;
                if (content && that._isJsonUri(content.url)) {
                    //json
                    const url = parentPath + content.url;
                    fetch(url, {
                        responseType: 'json'
                    }).then(response => {
                        return response.json();
                    }).then(json => {
                        liter(json.root, that._getParentPath(url));
                    });
                } else if (content && that._isB3dmUri(content.url)) {
                    const url = parentPath + content.url;
                    const key = that._getb3dmKey(url);
                    if(!that.b3dms[key]) {
                        const geoTransMatrix = Mat4.fromVec3Translation(boundSphere.center).rotateX(Math.PI/2);
                        const b3dm = new B3DMLoader(url, {
                            vertical: false,
                            matrix: geoTransMatrix
                        });
                        b3dm._init(gl, global);
                        that.b3dms[key] = b3dm;
                    }
                }
                //2.foreach children
                if (tile.children) {
                    for (let i = 0, len = tile.children.length; i < len; i++) {
                        liter(tile.children[i], parentPath);
                    }
                }
            }
        }
        //start liter 3dtile
        liter(json.root, that.rootPath);
    }
    /**
     * 
     */
    _isJsonUri(uri) {
        return uri.indexOf('json') !== -1;
    }
    /**
     * 
     */
    _isB3dmUri(uri) {
        return uri.indexOf('b3dm') !== -1;
    }
    /**
     * 
     * @param {*} url 
     */
    _getParentPath(url) {
        const i = url.lastIndexOf('/');
        return url.substr(0, i + 1);
    }
    /**
     * 
     */
    _getb3dmKey(url) {
        const i = url.lastIndexOf('/');
        return url.substr(i + 1, url.length - i - 6);
    }
    /**
     * @typedef {import("../core/BoundingSphere")} BoundingSphere
     * @param {BoundingSphere} boundSphere 
     */
    _spaceError(boundSphere, geometricError) {
        const camera = this.camera;
        //1 calcute distance to center
        const rawDistance = boundSphere.distance(camera.position.clone());
        const distance = rawDistance < boundSphere.radius ? EPSILON7 : rawDistance - boundSphere.radius;
        //2.use came sseDenominator
        const sseDenominator = camera.sseDenominator;
        const error = (geometricError * camera.height) / (distance * sseDenominator);
        return error;
    }
    /**
     * 
     */
    _updateTiles3DByDistanceError() {
        const json = this.json;
        if (json === null) return;
        this._processJson(json);
    }

    render(camera, t) {
        forEach(this.b3dms, (b3dm, i, key) => {
            b3dm.render(camera, t);
        }, this);
    }
}

module.exports = G3DTiles;