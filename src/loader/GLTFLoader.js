const requestImage = require('./../utils/requestImage'),
    fetch = require('./../utils/fetch'),
    Camera = require('./../camera/Camera'),
    //objects
    GNode = require('./../object/GNode'),
    GMesh = require('./../object/GMesh'),
    GMaterial = require('./../object/GMaterial'),
    GAccessor = require('./../object/GAccessor'),
    GBufferView = require('./../object/GBufferView'),
    //renderer
    GSampler = require('./../renderer/GSampler');
/**
 * @author yellow date 2019/1/29
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
        /**
         * 
         */
        if (options.uri) {
            this._baseUri = this._getBaseUri(options.uri);
        }
        /**
         * 
         */
        if (gltf.accessors) {
            this._accessors = new Array(gltf.accessors.length);
        }
        /**
         * 
         */
        if (gltf.bufferViews) {
            this._bufferViews = new Array(gltf.bufferViews.length);
        }
        /**
         * 
         */
        if (gltf.scenes) {
            this._scenes = new Array(gltf.scenes.length);   // store Scene object
        }
        /**
         * 
         */
        if (gltf.nodes) {
            this._nodes = new Array(gltf.nodes.length);    // store Node object
        }
        /**
         * 
         */
        if (gltf.meshes) {
            this._meshes = new Array(gltf.meshes.length);    // store mesh object
        }
        /**
         * 
         */
        if (gltf.materials) {
            this._materials = new Array(gltf.materials.length);  // store material object
        }
        /**
         * 
         */
        if (gltf.textures) {
            this._textures = new Array(gltf.textures.length);
        }
        /**
         * 
         */
        if (gltf.samplers) {
            this._samplers = new Array(gltf.samplers.length);
        }
        /**
         * 
         */
        if (gltf.images) {
            this._images = new Array(gltf.images.length);
        }
        /**
         * 
         */
        if (gltf.skins) {
            this._skins = new Array(gltf.skins.length);
        }
        /**
         * 
         */
        if (gltf.animations) {
            this._animations = new Array(gltf.animations.length);
        }
        /**
         * 
         */
        if (gltf.cameras) {
            this._cameras = new Array(gltf.cameras.length);
        }
        /**
         * initial resource
         */
        this._initialization();
    }
    /**
     * 
     */
    _initialization() {
        const json = this._json,
            baseUri = this._baseUri;
        //glb reader
        //if(json.buffer instanceof ArrayBuffer){ }
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
     * @returns {Promise}
     */
    load(program) {
        const tasks = this.tasks,
            that = this;
        return Promise.all(tasks).then(() => {
            that._postprocess(program);
            return that._scenes;
        });
    }
    /**
     * 
     * @param {String} uri 
     * @returns {String}
     */
    _getBaseUri(uri) {
        let basePath = '';
        const i = uri.lastIndexOf('/');
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
            responseType: 'arraybuffer'
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
            for (let i = 0, len = glTF.cameras.length; i < len; i++) {
                glTF.cameras[i] = new Camera(this.glTF.json.cameras[i]);
            }
        }
        // bufferviews
        if (glTF.bufferViews) {
            for (let i = 0, len = glTF.bufferViews.length; i < len; i++) {
                const bJson = glTF.bufferViews[i];
                this._bufferViews[i] = new GBufferView(
                    gl,
                    this._buffers[bJson.buffer],
                    bJson.byteLength,
                    {
                        bufferType: bJson.target,
                        drawType: gl.STATIC_DRAW,
                        byteOffset: bJson.byteOffset,
                        byteStride: bJson.byteStride
                    });
            }
        }
        //accessors
        if (glTF.accessors) {
            for (let i = 0, len = glTF.accessors.length; i < len; i++) {
                const aJson = glTF.accessors[i];
                const bvid = aJson.bufferView;
                const bufferView = this._bufferViews[bvid];
                this._accessors[i] = new GAccessor(
                    program,
                    bufferView,
                    aJson.componentType,
                    aJson.type,
                    aJson.count,
                    {
                        byteOffset: aJson.byteOffset,
                        normalized: aJson.normalized,
                        min: aJson.min,
                        max: aJson.max
                    });
            }
        }
        //materials
        if (glTF.materials) {
            for (let i = 0, len = glTF.materials.length; i < len; i++) {
                const mJson = glTF.materials[i];
                this._materials[i] = new GMaterial(mJson);
            }
        }
        //samplers
        if (glTF.samplers) {
            for (let i = 0, len = glTF.samplers.length; i < len; i++) {
                const sJson = glTF.samplers[i];
                this._samplers[i] = new GSampler(sJson);
            }
        }
        //textures
        if (glTF.textures) {
            for (let i = 0, len = glTF.textures.length; i < len; i++) {
                //const tJson = glTF.textures[i];
                //this._textures[i] = new GTexture(tJson);
            }
        }
        //mesh
        if (glTF.meshes) {
            for (let i = 0, len = glTF.meshes.length; i < len; i++) {
                const mJson = glTF.meshes[i];
                this._meshes[i] = new GMesh(i, mJson, {
                    json: glTF,
                    accessors: this._accessors,
                    materials: this._materials
                });
            }
        }
        //node
        if (glTF.nodes) {
            for (let i = 0, len = glTF.nodes.length; i < len; i++) {
                const nJson = glTF.nodes[i];
                this._nodes[i] = new GNode(i, nJson, {
                    meshes: this._meshes
                });
            }
        }
        //node: hook up children
        for (let i = 0, len = this._nodes.length; i < len; i++) {
            const node = this._nodes[i];
            for (let j = 0, lenj = node.children ? node.children.length : 0; j < lenj; j++) {
                node.children[j] = this._nodes[node.children[j]];
            }
        }
        //create scene }{debug
        if (glTF.scenes) {
            for (let i = 0, len = glTF.scenes.length; i < len; i++) {
                const sJson = glTF.scenes[i];
                const nodes = new Array(sJson.nodes.length);
                for (let j = 0, len = sJson.nodes.length; j < len; j++) {
                    nodes[i] = this._nodes[sJson.nodes[i]];
                }
                this._scenes[i] = {
                    name: sJson.name,
                    nodes: nodes
                };
            }
        }
        //
    }
}

module.exports = GLTFLoader;