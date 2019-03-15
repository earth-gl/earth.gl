
const readKHRBinary = require('../../utils/readKHRBinary'),
    forEach = require('./../../utils/forEach'),
    requestImage = require('../../utils/requestImage'),
    //objects
    GSkin = require('../../object/GSkin'),
    GNode = require('../../object/GNode'),
    GMesh = require('../../object/GMesh'),
    GScene = require('../../object/GScene'),
    GSampler = require('../../object/GSampler'),
    GTexture = require('../../object/GTexture'),
    GMaterial = require('../../object/GMaterial'),
    GAccessor = require('../../object/GAccessor'),
    GBufferView = require('../../object/GBufferView'),
    GAnimation = require('../../object/GAnimation');
/**
* @class
*/
class GLTFV1 {
    /**
     * 
     * @param {String} rootPath 
     * @param {Object} json 
     */
    constructor(rootPath, json) {
        /**
         * @type {String} root path of gltf file
         */
        this.rootPath = rootPath;
        /**
         * @type {Object} setting 
         */
        this.json = json;
        /**
       * @type {Object}
       */
        this._buffers = {};
        /**
         * @type {Array}
         */
        this._images = {};
        /**
         * @type {Object}
         */
        this._accessors = {};
        /**
         * @type {Array}
         */
        this._bufferViews = {};
        /**
         * @type {Array}
         */
        this._scenes = {};
        /**
         * @type {Array}
         */
        this._nodes = {};
        /**
         * @type {Array}
         */
        this._meshes = {};
        /**
         * @type {Array}
         */
        this._materials = {};
        /**
         * @type {Array}
         */
        this._textures = {};
        /**
         * @type {Array}
         */
        this._samplers = {};
        /**
         * @type {Array}
         */
        this._skins = {};
        /**
         * @type {Array}
         */
        this._animations = {};
        /**
         * @type {Array}
         */
        this._cameras = {};
        /**
         * @type {String} default Id of scene
         */
        this.defaultScene = json.scene !== undefined ? json.scene : 0;
        /**
         * @type {Object}
         */
        this.extensions = json.extensions !== undefined ? json.extensions : null;
        /**
         * @type {Object}
         */
        this.extras = json.extras !== undefined ? json.extras : null;
    }
    /**
     * process resource by uri
     * @returns {Promise[]}
     */
    _processUri() {
        const rootPath = this.rootPath,
            json = this.json;
        //request buffers
        const fetchArrayBufferPromises = [];
        if (json.buffers) {
            for (const bid in json.buffers) {
                const rawStr = json.buffers[bid].uri;
                if (isBase64(rawStr)) {
                    fetchArrayBufferPromises.push(this._fetchArrayBufferFormBase64(rawStr, bid));
                } else {
                    fetchArrayBufferPromises.push(this._fetchArrayBuffer(rootPath + rawStr, bid));
                }
            }
        }
        //request images
        const fetchImagePromises = [];
        if (json.images) {
            for (const iid in json.images) {
                fetchImagePromises.push(this._fetchImages(rootPath + json.images[iid].uri, iid));
            }
        }
        //return arraybuffer collection
        return fetchArrayBufferPromises;
    }
    /**
     * 
     * @param {String} url 
     * @param {Number} iid
     * @returns {Promise}
     */
    _fetchImages(url, iid) {
        const fetchImage = requestImage,
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
     * 
     * @param {*} json 
     * @param {*} gProgram 
     */
    processJson(gltfJson, gProgram) {
        const resourcePromises = this._processUri(),
            gl = gProgram._gl,
            that = this;
        return Promise.all(resourcePromises).then(() => {
            // bufferviews
            if (gltfJson.bufferViews) {
                for (let i = 0, len = gltfJson.bufferViews.length; i < len; i++) {
                    const bufferViewJson = gltfJson.bufferViews[i];
                    const buffer = that._buffers[bufferViewJson.buffer];
                    that._bufferViews[i] = new GBufferView(
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
            if (gltfJson.accessors) {
                for (let i = 0, len = gltfJson.accessors.length; i < len; i++) {
                    const accessorJson = gltfJson.accessors[i];
                    const bvid = accessorJson.bufferView;
                    const bufferView = that._bufferViews[bvid];
                    that._accessors[i] = new GAccessor(
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
            if (gltfJson.materials) {
                for (let i = 0, len = gltfJson.materials.length; i < len; i++) {
                    const materialJson = gltfJson.materials[i];
                    that._materials[i] = new GMaterial(materialJson);
                }
            }
            //samplers
            if (gltfJson.samplers) {
                for (let i = 0, len = gltfJson.samplers.length; i < len; i++) {
                    const samplerJson = gltfJson.samplers[i];
                    that._samplers[i] = new GSampler(samplerJson);
                }
            }
            //textures
            if (gltfJson.textures) {
                for (let i = 0, len = gltfJson.textures.length; i < len; i++) {
                    const tJson = gltfJson.textures[i];
                    that._textures[i] = new GTexture({ samplers: that._samplers, images: that._images }, tJson);
                }
            }
            //mesh
            if (gltfJson.meshes) {
                for (let i = 0, len = gltfJson.meshes.length; i < len; i++) {
                    const meshJson = gltfJson.meshes[i];
                    that._meshes[i] = new GMesh({
                        json: gltfJson,
                        accessors: that._accessors,
                        materials: that._materials
                    }, meshJson);
                }
            }
            //node
            if (gltfJson.nodes) {
                for (let i = 0, len = gltfJson.nodes.length; i < len; i++) {
                    const nJson = gltfJson.nodes[i];
                    that._nodes[i] = new GNode({
                        meshes: that._meshes
                    }, nJson);
                }
            }
            //node: hook up children
            for (let i = 0, len = that._nodes.length; i < len; i++) {
                const node = that._nodes[i];
                for (let j = 0, lenj = node.children ? node.children.length : 0; j < lenj; j++) {
                    const childNodeId = node.children[j];
                    node.children[j] = that._nodes[childNodeId];
                }
            }
            //create scene
            if (gltfJson.scenes) {
                for (let i = 0, len = gltfJson.scenes.length; i < len; i++) {
                    const sJson = gltfJson.scenes[i];
                    that._scenes[i] = new GScene({ nodes: that._nodes }, sJson);
                }
            }
            //animations
            if (gltfJson.animations) {
                for (let i = 0, len = gltfJson.animations.length; i < len; i++) {
                    const animJson = gltfJson.animations[i];
                    that._animations[i] = new GAnimation({
                        accessors: that._accessors
                    }, animJson);
                }
            }
            //skin
            if (gltfJson.skins) {
                for (let i = 0, leni = gltfJson.skins.length; i < leni; i++) {
                    that._skins[i] = new GSkin({ nodes: that._nodes, accessors: that._accessors }, gltfJson.skins[i]);
                }
                //jonit skin
                for (let i = 0, len = that._nodes.length; i < len; i++) {
                    const node = that._nodes[i],
                        skinIdx = node.skinIdx;
                    node.skin = that._skins[skinIdx] || null;
                }
            }
        });
    }
    /**
     * process glb
     */
    processKHRBinary(gltfJson, subglb, gl) {
        //accessors
        if (gltfJson.accessors) {
            forEach(gltfJson.accessors, (accessorJson, i, key) => {
                const bufferViewJson = gltfJson.bufferViews[accessorJson.bufferView],
                    buffer = gltfJson.buffers[bufferViewJson.buffer];
                if (bufferViewJson.buffer === 'binary_glTF' || bufferViewJson.buffer === 'KHR_binary_glTF' || !buffer.uri) {
                    const bufferView = this._bufferViews[key] = new GBufferView(
                        gl,
                        subglb.buffer,
                        bufferViewJson.byteLength,
                        {
                            bufferType:bufferViewJson.target,
                            drawType: gl.STATIC_DRAW,
                            byteOffset: subglb.byteOffset+bufferViewJson.byteOffset,
                            byteStride: bufferViewJson.byteStride
                        });
                    this._accessors[key] = new GAccessor(
                        gl,
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
                }else{
                    //todo load from uri
                }
            }, this);
        }
        //materials
        if (gltfJson.materials) {
            forEach(gltfJson.materials, (materialJson, i, key) => {
                this._materials[key] = new GMaterial(materialJson);
            }, this);
        }
        //samplers
        if(gltfJson.samplers){
            forEach(gltfJson.samplers,(samplerJson, i, key)=>{
                this._samplers[key] = new GSampler(samplerJson);
            },this);
        }
        //textures
        if(gltfJson.textures){
            forEach(gltfJson.textures,(textureJson, i, key)=>{
                this._textures[key] = new GTexture({
                    samplers:this._samplers,
                    images:this._images
                },textureJson);
            },this);
        }
        //meshes
        if (gltfJson.meshes) {
            forEach(gltfJson.meshes,(meshJson, i, key)=>{
                this._meshes[key] = new GMesh(key, {
                    json: gltfJson,
                    accessors: this._accessors,
                    materials: this._materials
                }, meshJson);
            },this);
        }
        //nodes, hook up children
        if(gltfJson.nodes){
            forEach(gltfJson.nodes, (nodeJson, i, key)=>{
                this._nodes[key] = new GNode(key,{
                    meshes: this._meshes
                }, nodeJson);
            },this);
        }
        //nodes hook up
        if(this._nodes.length>0){
            forEach(this._nodes, (node, key)=>{
                forEach(node.children,(childName, i, key)=>{
                    node.children[childName] = this._nodes[childName];
                },this);
            },this);
        }
        //crate scene
        if(gltfJson.scenes){
            forEach(gltfJson.scenes, (sceneJson, i, key)=>{
                this._scenes[key] = new GScene({ nodes: this._nodes }, sceneJson);
            }, this);
        }
        //animations
        if (gltfJson.animations) {
            forEach(gltfJson.animations, (animJson, i, key)=>{
                this._animations[key] = new GAnimation({
                    accessors: this._accessors
                }, animJson);
            },this);
        }
        //skin
        if(gltfJson.skins){

            forEach(gltfJson.skins, (skinJson, i, key)=>{
                this._skins[key] = new GSkin({
                    nodes: this._nodes, 
                    accessors: this._accessors
                }, skinJson, key);
            }, this);

            forEach(this._nodes, (node, i, key)=>{
                const skinIdx = node.skinIdx;
                node.skin = this._skins[skinIdx] || null;
            });
        }

        return new Promise((resolve,reject)=>{
            resolve({
                scene: this._scenes[this.defaultScene],
                animations: this._animations,
                nodes: this._nodes,
                skins: this._skins
            });
        });

    }
}
/**
 * @returns {Promise}
 */
GLTFV1.fromJson = function (rootPath, json, gl) {
    const gltfv1 = new GLTFV1(rootPath, json);
    gltfv1 = new GLTFV1(rootPath, global);
    return gltfv1.processJson(json, gProgram);
}
/**
 * 
 */
GLTFV1.fromKHRBinary = function (rootPath, glb, gl) {
    const { json, subglb } = readKHRBinary(glb.buffer, glb.byteOffset);
    const gltfv1 = new GLTFV1(rootPath, json);
    return gltfv1.processKHRBinary(json, subglb, gl);
}

module.exports = GLTFV1;