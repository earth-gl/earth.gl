const requestImage = require('./../utils/requestImage'),
    forEach = require('./../utils/forEach'),
    { isBase64 } = require('./../utils/typedArray'),
    //objects
    GSkin = require('./../object/GSkin'),
    GNode = require('./../object/GNode'),
    GMesh = require('./../object/GMesh'),
    GScene = require('./../object/GScene'),
    GSampler = require('./../object/GSampler'),
    GTexture = require('./../object/GTexture'),
    GMaterial = require('./../object/GMaterial'),
    GAccessor = require('./../object/GAccessor'),
    GBufferView = require('./../object/GBufferView'),
    GAnimation = require('./../object/GAnimation');
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
     * @param {String} options.url
     * @param {Object} [options.glb] indicate the resource arraybuffer
     */
    constructor(gltfJson, options = {}) {
        /**
         * json settings
         */
        this._gltfJson = gltfJson;
        /**
         * @type {Object}
         */
        this._glb = options.glb || null;
        /**
         * scene id
         */
        this.defaultScene = gltfJson.scene !== undefined ? gltfJson.scene : 0;
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
        if (options.url) {
            this._baseUrl = this._getBaseUrl(options.url);
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
        if (!options.glb) this._initializeResource(this._gltfJson, this._baseUrl);
    }
    /**
     * 
     * 
     */
    _initializeResource(json, rootUrl) {
        //request buffers
        const fetchArrayBufferPromises = [];
        if (json.buffers) {
            for (const bid in json.buffers) {
                const rawStr = json.buffers[bid].uri;
                if (isBase64(rawStr)) {
                    fetchArrayBufferPromises.push(this._fetchArrayBufferFormBase64(rawStr, bid));
                } else {
                    fetchArrayBufferPromises.push(this._fetchArrayBuffer(rootUrl + rawStr, bid));
                }
            }
        }
        //request images
        const fetchImagePromises = [];
        if (json.images) {
            for (const iid in json.images) {
                fetchImagePromises.push(this._fetchImages(rootUrl + json.images[iid].uri, iid));
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
        if (this.tasks) {
            return Promise.all(tasks).then(() => {
                that._postgltfprocess(program);
                return {
                    scene: that._scenes[defaultScene],
                    nodes: that._nodes,
                    skins: that._skins,
                    animations: that._animations
                };
            });
        } else {
            return new Promise((resolve, reject) => {
                that._postglbprocess(program);
                resolve({
                    scene: that._scenes[defaultScene],
                    nodes: that._nodes,
                    skins: that._skins,
                    animations: that._animations
                });
            });
        }
    }
    /**
     * 
     * @param {String} url 
     * @returns {String}
     */
    _getBaseUrl(url) {
        let basePath = '';
        const i = url.lastIndexOf('/');
        if (i !== -1) {
            basePath = url.substring(0, i + 1);
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
     * glb store information in accessor,
     * 
     * @param {GProgram} program 
     */
    _postglbprocess(program) {
        const GLTFJSON = this._gltfJson,
            glb = this._glb,
            gl = program._gl;
        forEach(GLTFJSON.accessors, (accessor) => {
            const s = accessor;
        }, this);
    }
    /**
     * https://github.com/shrekshao/minimal-gltf-loader/blob/21a758c0ebc8f62e053682344610392a39012a36/src/minimal-gltf-loader.js#L1005
     */
    _postgltfprocess(program) {
        const GLTFJSON = this._gltfJson,
            gl = program._gl;
        // cameras
        if (GLTFJSON.cameras) {
            for (let i = 0, len = GLTFJSON.cameras.length; i < len; i++) {
                //GLTF.cameras[i] = new Camera(this.glTF.json.cameras[i]);
            }
        }
        // bufferviews
        if (GLTFJSON.bufferViews) {
            for (let i = 0, len = GLTFJSON.bufferViews.length; i < len; i++) {
                const bufferViewJson = GLTFJSON.bufferViews[i];
                const buffer = this._buffers[bufferViewJson.buffer];
                this._bufferViews[i] = new GBufferView(
                    gl,
                    buffer,
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
        if (GLTFJSON.accessors) {
            for (let i = 0, len = GLTFJSON.accessors.length; i < len; i++) {
                const accessorJson = GLTFJSON.accessors[i];
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
        if (GLTFJSON.materials) {
            for (let i = 0, len = GLTFJSON.materials.length; i < len; i++) {
                const materialJson = GLTFJSON.materials[i];
                this._materials[i] = new GMaterial(materialJson);
            }
        }
        //samplers
        if (GLTFJSON.samplers) {
            for (let i = 0, len = GLTFJSON.samplers.length; i < len; i++) {
                const samplerJson = GLTFJSON.samplers[i];
                this._samplers[i] = new GSampler(samplerJson);
            }
        }
        //textures
        if (GLTFJSON.textures) {
            for (let i = 0, len = GLTFJSON.textures.length; i < len; i++) {
                const tJson = GLTFJSON.textures[i];
                this._textures[i] = new GTexture({ samplers: this._samplers, images: this._images }, tJson);
            }
        }
        //mesh
        if (GLTFJSON.meshes) {
            for (let i = 0, len = GLTFJSON.meshes.length; i < len; i++) {
                const meshJson = GLTFJSON.meshes[i];
                this._meshes[i] = new GMesh(i, {
                    json: GLTFJSON,
                    accessors: this._accessors,
                    materials: this._materials
                }, meshJson);
            }
        }
        //node
        if (GLTFJSON.nodes) {
            for (let i = 0, len = GLTFJSON.nodes.length; i < len; i++) {
                const nJson = GLTFJSON.nodes[i];
                this._nodes[i] = new GNode(i, {
                    meshes: this._meshes
                }, nJson);
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
        if (GLTFJSON.scenes) {
            for (let i = 0, len = GLTFJSON.scenes.length; i < len; i++) {
                const sJson = GLTFJSON.scenes[i];
                this._scenes[i] = new GScene({ nodes: this._nodes }, sJson);
            }
        }
        //animations
        if (GLTFJSON.animations) {
            for (let i = 0, len = GLTFJSON.animations.length; i < len; i++) {
                const animJson = GLTFJSON.animations[i];
                this._animations[i] = new GAnimation({
                    accessors: this._accessors
                }, animJson);
            }
        }
        //skin
        if (GLTFJSON.skins) {
            for (let i = 0, leni = GLTFJSON.skins.length; i < leni; i++) {
                this._skins[i] = new GSkin({ nodes: this._nodes, accessors: this._accessors }, GLTFJSON.skins[i], i);
            }
            //jonit skin
            for (let i = 0, len = this._nodes.length; i < len; i++) {
                const node = this._nodes[i],
                    skinIdx = node.skinIdx;
                node.skin = this._skins[skinIdx] || null;
            }
        }
    }
}

module.exports = GLTFLoader;