const requestImage = require("./../utils/requestImage"),
    fetch = require("./../utils/fetch");

const Camera = require("./../camera/Camera"),
    GAccessor = require("./../renderer/GAccessor"),
    GBuffer = require("./../renderer/GBuffer");
/**
 * @class
 */
class GLTFLoader {
    /**
     * 
     * @param {*} gltf 
     * @param {Object} [options]
     * @param {Function} [options.requestImage] 
     * @param {String} options.uri
     */
    constructor(gltf, options = {}) {
        /**
         * json settings
         */
        this._json = gltf;
        /**
         * scene id
         */
        this.defaultScene = gltf.scene !== undefined ? gltf.scene : 0;
        /**
         * version id
         */
        this.version = Number(gltf.asset.version);
        /**
         * requestImage function
         */
        this.requestImage = options.requestImage || requestImage;
        /**
         * 
         */
        this._buffers = {};
        /**
         * 
         */
        this._images = {};
        /**
         * 
         */
        this.extensions = gltf.extensions !== undefined ? gltf.extensions : null;
        /**
         * 
         */
        this.extras = gltf.extras !== undefined ? gltf.extras : null;


        if (options.uri) {
            this._baseUri = this._getBaseUri(options.uri);
        }
        if (gltf.accessors) {
            this.accessors = new Array(gltf.accessors.length);
        }
        if (gltf.bufferViews) {
            this.bufferViews = new Array(gltf.bufferViews.length);
        }
        if (gltf.scenes) {
            this.scenes = new Array(gltf.scenes.length);   // store Scene object
        }
        if (gltf.nodes) {
            this.nodes = new Array(gltf.nodes.length);    // store Node object
        }
        if (gltf.meshes) {
            this.meshes = new Array(gltf.meshes.length);    // store mesh object
        }
        if (gltf.materials) {
            this.materials = new Array(gltf.materials.length);  // store material object
        }
        if (gltf.textures) {
            this.textures = new Array(gltf.textures.length);
        }
        if (gltf.samplers) {
            this.samplers = new Array(gltf.samplers.length);
        }
        if (gltf.images) {
            this.images = new Array(gltf.images.length);
        }
        if (gltf.skins) {
            this.skins = new Array(gltf.skins.length);
        }
        if (gltf.animations) {
            this.animations = new Array(gltf.animations.length);
        }
        if (gltf.cameras) {
            this.cameras = new Array(gltf.cameras.length);
        }
        /**
         * initial resource
         */
        this._initial();
    }
    /**
     * 
     */
    _initial() {
        const json = this._json,
            baseUri = this._baseUri;
        //request buffers
        const fetchArrayBufferPromises = [];
        if (json.buffers) {
            for (const bid in json.buffers) {
                fetchArrayBufferPromises.push(this._fetchArrayBuffer(baseUri + json.buffers[bid].uri, bid));
            }
        }
        //request images
        const fetchImagePromises = [];
        if (json.images) {
            for (const iid in json.images) {
                fetchImagePromises.push(this._fetchImages(baseUri + json.images[iid].uri, iid));
            }
        }
        //
        this.tasks = [].concat(fetchArrayBufferPromises).concat(fetchImagePromises);
    }
    /**
     * @type {GProgram} program
     */
    load(program) {
        const tasks = this.tasks,
            that = this;
        return Promise.all(tasks).then(done => {
            that._postprocess(program);
        });
    }
    /**
     * 
     * @param {String} uri 
     * @returns {String}
     */
    _getBaseUri(uri) {
        let basePath = "";
        const i = uri.lastIndexOf("/");
        if (i !== -1) {
            basePath = uri.substring(0, i + 1);
        }
        return basePath;
    }
    /**
     * 
     * @param {String} url 
     * @param {Number} iid
     * @returns {Promise}
     */
    _fetchImages(url, iid) {
        const fetchImage = this.requestImage,
            that = this;
        return fetchImage(url).then(buffer => {
            that._images[iid] = buffer;
        });
    }
    /**
     * @param {Number} bid
     * @returns {Promise}
     */
    _fetchArrayBuffer(url, bid) {
        const that = this;
        return fetch(url, {
            responseType: "arraybuffer"
        }).then(response => {
            return response.arrayBuffer();
        }).then(buffer => {
            that._buffers[bid] = buffer;
        });
    }
    /**
     * https://github.com/shrekshao/minimal-gltf-loader/blob/21a758c0ebc8f62e053682344610392a39012a36/src/minimal-gltf-loader.js#L1005
     */
    _postprocess(program) {
        const glTF = this._json,
            gl = program._gl;
        // cameras
        if (glTF.cameras) {
            for (var i = 0, len = glTF.cameras.length; i < len; i++) {
                glTF.cameras[i] = new Camera(this.glTF.json.cameras[i]);
            }
        }
        // bufferviews
        if (glTF.bufferViews) {
            for (i = 0, len = glTF.bufferViews.length; i < len; i++) {
                const bufferViewJson = glTF.bufferViews[i];
                this.bufferViews[i] = new GBuffer(program, bufferViewJson.target, gl.STATIC_DRAW, this._buffers[bufferViewJson.buffer]);
            }
        }
        //accessors
        if(glTF.accessors){
            for (i = 0, len = glTF.accessors.length; i < len; i++) {
                const bufferView = this.bufferViews[this.glTF.json.accessors[i].bufferView];
                const accessorsJson = glTF.accessors[i];
                this.accessors[i] = new GAccessor(accessorsJson.componentType,accessorsJson.byteOffset,accessorsJson.normalized,accessorsJson.count,accessorsJson.type,bufferView);
            }
        }
    }
}

module.exports = GLTFLoader;