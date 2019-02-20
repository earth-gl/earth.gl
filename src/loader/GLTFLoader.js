const requestImage = require('./../utils/requestImage'),
    { isBase64, base64ToArrayBuffer } = require('./../utils/typedArray'),
    fetch = require('./../utils/fetch'),
    Camera = require('./../camera/Camera'),
    //objects
    GNode = require('./../object/GNode'),
    GMesh = require('./../object/GMesh'),
    GMaterial = require('./../object/GMaterial'),
    GAccessor = require('./../object/GAccessor'),
    GBufferView = require('./../object/GBufferView'),
    GAnimation = require('./../object/GAnimation'),
    //renderer
    GSampler = require('./../renderer/GSampler');
/**
 * https://github.com/KhronosGroup/glTF-Sample-Models/tree/master/2.0
 * @author yellow date 2019/1/29
 * @class
 */
class GLTFLoader {
    /**
     * 
     * @param {*} gltfJson 
     * @param {Object} [options]
     * @param {Function} [options.requestImage] 
     * @param {String} options.uri
     */
    constructor(gltfJson, options = {}) {
        /**
         * json settings
         */
        this._gltfJson = gltfJson;
        /**
         * scene id
         */
        this.defaultScene = gltfJson.scene !== undefined ? gltfJson.scene : 0;
        /**
         * version id
         */
        this.version = Number(gltfJson.asset.version);
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
        this.extensions = gltfJson.extensions !== undefined ? gltfJson.extensions : null;
        /**
         * 
         */
        this.extras = gltfJson.extras !== undefined ? gltfJson.extras : null;
        /**
         * 
         */
        if (options.uri) {
            this._baseUri = this._getBaseUri(options.uri);
        }
        /**
         * 
         */
        if (gltfJson.accessors) {
            this._accessors = new Array(gltfJson.accessors.length);
        }
        /**
         * 
         */
        if (gltfJson.bufferViews) {
            this._bufferViews = new Array(gltfJson.bufferViews.length);
        }
        /**
         * 
         */
        if (gltfJson.scenes) {
            this._scenes = new Array(gltfJson.scenes.length);   // store Scene object
        }
        /**
         * 
         */
        if (gltfJson.nodes) {
            this._nodes = new Array(gltfJson.nodes.length);    // store Node object
        }
        /**
         * 
         */
        if (gltfJson.meshes) {
            this._meshes = new Array(gltfJson.meshes.length);    // store mesh object
        }
        /**
         * 
         */
        if (gltfJson.materials) {
            this._materials = new Array(gltfJson.materials.length);  // store material object
        }
        /**
         * 
         */
        if (gltfJson.textures) {
            this._textures = new Array(gltfJson.textures.length);
        }
        /**
         * 
         */
        if (gltfJson.samplers) {
            this._samplers = new Array(gltfJson.samplers.length);
        }
        /**
         * 
         */
        if (gltfJson.images) {
            this._images = new Array(gltfJson.images.length);
        }
        /**
         * 
         */
        if (gltfJson.skins) {
            this._skins = new Array(gltfJson.skins.length);
        }
        /**
         * 
         */
        if (gltfJson.animations) {
            this._animations = new Array(gltfJson.animations.length);
        }
        /**
         * 
         */
        if (gltfJson.cameras) {
            this._cameras = new Array(gltfJson.cameras.length);
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
        const json = this._gltfJson,
            baseUri = this._baseUri;
        //glb reader
        // if(json.buffer instanceof ArrayBuffer){ }
        //request buffers
        const fetchArrayBufferPromises = [];
        if (json.buffers) {
            for (const bid in json.buffers) {
                const rawStr = json.buffers[bid].uri;
                if (isBase64(rawStr)) {
                    fetchArrayBufferPromises.push(this._fetchArrayBufferFormBase64(rawStr, bid));
                } else {
                    fetchArrayBufferPromises.push(this._fetchArrayBuffer(baseUri + rawStr, bid));
                }
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
        const defaultScene = this.defaultScene,
            tasks = this.tasks,
            that = this;
        return Promise.all(tasks).then(() => {
            that._postprocess(program);
            return {
                scene: that._scenes[defaultScene],
                nodes: that._nodes,
                animations: that._animations
            };
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
     * 
     */
    _fetchArrayBufferFormBase64(url, bid) {
        const that = this;
        return fetch(url).then(response => {
            return response.arrayBuffer();
        }).then(buffer => {
            that._buffers[bid] = buffer;
        });
    }
    /**
     * https://github.com/shrekshao/minimal-gltf-loader/blob/21a758c0ebc8f62e053682344610392a39012a36/src/minimal-gltf-loader.js#L1005
     */
    _postprocess(program) {
        const GLTF = this._gltfJson,
            gl = program._gl;
        // cameras
        if (GLTF.cameras) {
            for (let i = 0, len = GLTF.cameras.length; i < len; i++) {
                GLTF.cameras[i] = new Camera(this.glTF.json.cameras[i]);
            }
        }
        // bufferviews
        if (GLTF.bufferViews) {
            for (let i = 0, len = GLTF.bufferViews.length; i < len; i++) {
                const bufferViewJson = GLTF.bufferViews[i];
                this._bufferViews[i] = new GBufferView(
                    gl,
                    this._buffers[bufferViewJson.buffer],
                    bufferViewJson.byteLength,
                    {
                        bufferType: bufferViewJson.target,
                        drawType: gl.STATIC_DRAW,
                        byteOffset: bufferViewJson.byteOffset,
                        byteStride: bufferViewJson.byteStride
                    });
            }
        }
        //accessors
        if (GLTF.accessors) {
            for (let i = 0, len = GLTF.accessors.length; i < len; i++) {
                const accessorJson = GLTF.accessors[i];
                const bvid = accessorJson.bufferView;
                const bufferView = this._bufferViews[bvid];
                this._accessors[i] = new GAccessor(
                    program,
                    bufferView,
                    accessorJson.componentType,
                    accessorJson.type,
                    accessorJson.count,
                    {
                        byteOffset: accessorJson.byteOffset,
                        normalized: accessorJson.normalized,
                        min: accessorJson.min,
                        max: accessorJson.max
                    });
            }
        }
        //materials
        if (GLTF.materials) {
            for (let i = 0, len = GLTF.materials.length; i < len; i++) {
                const materialJson = GLTF.materials[i];
                this._materials[i] = new GMaterial(materialJson);
            }
        }
        //samplers
        if (GLTF.samplers) {
            for (let i = 0, len = GLTF.samplers.length; i < len; i++) {
                const samplerJson = GLTF.samplers[i];
                this._samplers[i] = new GSampler(samplerJson);
            }
        }
        //textures
        if (GLTF.textures) {
            for (let i = 0, len = GLTF.textures.length; i < len; i++) {
                //const tJson = glTF.textures[i];
                //this._textures[i] = new GTexture(tJson);
            }
        }
        //mesh
        if (GLTF.meshes) {
            for (let i = 0, len = GLTF.meshes.length; i < len; i++) {
                const meshJson = GLTF.meshes[i];
                this._meshes[i] = new GMesh(i, {
                    json: GLTF,
                    accessors: this._accessors,
                    materials: this._materials
                }, meshJson);
            }
        }
        //node
        if (GLTF.nodes) {
            for (let i = 0, len = GLTF.nodes.length; i < len; i++) {
                const nJson = GLTF.nodes[i];
                this._nodes[i] = new GNode(i, {
                    meshes: this._meshes
                }, nJson);
            }
        }
        //animations
        if (GLTF.animations) {
            for (let i = 0, len = GLTF.animations.length; i < len; i++) {
                const animJson = GLTF.animations[i];
                this._animations[i] = new GAnimation({
                    accessors: this._accessors
                }, animJson);
            }
        }
        //node: hook up children
        for (let i = 0, len = this._nodes.length; i < len; i++) {
            const node = this._nodes[i];
            for (let j = 0, lenj = node.children ? node.children.length : 0; j < lenj; j++) {
                const childNodeId = node.children[j];
                node.children[j] = this._nodes[childNodeId];
            }
        }
        //create scene
        if (GLTF.scenes) {
            for (let i = 0, len = GLTF.scenes.length; i < len; i++) {
                const sJson = GLTF.scenes[i];
                const nodes = new Array(sJson.nodes.length);
                for (let j = 0, len = sJson.nodes.length; j < len; j++) {
                    nodes[j] = this._nodes[sJson.nodes[j]];
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