const defined = require("../utils/defined"),
    fetch = require("../utils/fetch"),
    AnimationClip = require("./AnimationClip"),
    GLBReader = require("./bufferReader/GLBReader"),
    Accessor = require("./bufferReader/Accessor");
//
const canvas = typeof document === "undefined" ? null : document.createElement("canvas");
const modes = ["points", "lines", "line loop", "line strip", "triangles", "triangle strip", "triangle fan"];
/**
 * @function
 * @param {String} url 
 * @param {Function} cb 
 */
const requestImage = function(url, cb){
    const image = new Image();
    image.onload = () => {
        if (!canvas) {
            cb(new Error("There is no canvas to draw image!"));
            return;
        }
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, image.width, image.height);
        const imgData = ctx.getImageData(0, 0, image.width, image.height);
        //TODO, retina may need special operations
        cb(null, new Uint8Array(imgData.data));
    };
    image.onerror = function (err) {
        cb(err);
    };
    image.src = url;
};
/**
 * @class
 */
class GLTFV1 {
    /**
     * 
     * @param {*} rootPath 
     * @param {*} gltf 
     */
    constructor(rootPath, gltf) {
        this.rootPath = rootPath;
        this.gltf = gltf;
    }
    /**
     * 
     * @param {*} cb 
     */
    iterateMesh(cb) {
        const meshes = this.gltf.meshes;
        let index = 0;
        for (const p in meshes) {
            cb(p, meshes[p], index++);
        }
    }
    /**
     * 
     * @param {*} cb 
     */
    iterateNode(cb) {
        const nodes = this.gltf.nodes;
        let index = 0;
        for (const p in nodes) {
            cb(p, nodes[p], index++);
        }
    }
    /**
     * 
     * @param {*} cb 
     */
    iterateScene(cb) {
        const scenes = this.gltf.scenes;
        let index = 0;
        for (const p in scenes) {
            cb(p, scenes[p], index++);
        }
    }
    /**
     * 
     * @param {*} nodeJSON 
     * @param {*} meshes 
     */
    createNode(nodeJSON, meshes) {
        // camera	string	The ID of the camera referenced by this node.	No
        // children	string[]	The IDs of this node's children.	No, default: []
        // skeletons	string[]	The ID of skeleton nodes.	No
        // skin	string	The ID of the skin referenced by this node.	No
        // jointName	string	Name used when this node is a joint in a skin.	No
        // matrix	number[16]	A floating-point 4x4 transformation matrix stored in column-major order.	No, default: [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]
        // meshes	string[]	The IDs of the mesh objects in this node.	No
        // rotation	number[4]	The node's unit quaternion rotation in the order (x, y, z, w), where w is the scalar.	No, default: [0,0,0,1]
        // scale	number[3]	The node's non-uniform scale.	No, default: [1,1,1]
        // translation	number[3]	The node's translation.	No, default: [0,0,0]
        // name	string	The user-defined name of this object.	No
        // extensions	object	Dictionary object with extension-specific objects.	No
        // extras	any	Application-specific data.	No
        const node = {};
        if (defined(nodeJSON.name)) node.name = nodeJSON.name;
        if (defined(nodeJSON.children)) node.children = nodeJSON.children;
        if (defined(nodeJSON.jointName)) node.jointName = nodeJSON.jointName;
        if (defined(nodeJSON.matrix)) node.matrix = nodeJSON.matrix;
        if (defined(nodeJSON.rotation)) node.rotation = nodeJSON.rotation;
        if (defined(nodeJSON.scale)) node.scale = nodeJSON.scale;
        if (defined(nodeJSON.translation)) node.translation = nodeJSON.translation;
        if (defined(nodeJSON.extras)) node.extras = nodeJSON.extras;
        if (defined(nodeJSON.meshes)) {
            node.meshes = nodeJSON.meshes.map(m => meshes[m]);
        }
        //TODO 还缺 camera, skeletons, skin, extensions 的解析
        return node;
    }
    /**
     * 
     * @param {*} index 
     */
    getBaseColorTexture(index) {
        const material = this.gltf.materials[index];
        let tech, texId;
        if (material["instanceTechnique"] && material["instanceTechnique"].values) {
            tech = material["instanceTechnique"];
            texId = tech.values["diffuse"];
        } else {
            tech = material;
            texId = tech.values["tex"] || tech.values["diffuse"];
        }
        if (texId === undefined || this.gltf.textures === undefined) {
            return null;
        }
        const texture = this.gltf.textures[texId];
        if (!texture) {
            return null;
        }
        const sampler = this.gltf.samplers[texture.sampler];
        const info = {
            format : texture.format || 6408,
            internalFormat : texture.internalFormat || 6408,
            type : texture.type || 5121,
            sampler,
            source : this.gltf.images[texture.source]
        };
        return info;
    }
    /**
     * 
     */
    getMaterial() {
        return null;
    }
    /**
     * 
     */
    getAnimations() {
        return null;
    }
}

/**
 * @class
 */
class GLTFV2 {
    /**
     * 
     * @param {*} rootPath 
     * @param {*} gltf 
     * @param {*} glbBuffer 
     * @param {*} requestImage 
     */
    constructor(rootPath, gltf, glbBuffer, requestImage) {
        this.rootPath = rootPath;
        this.gltf = gltf;
        this.glbBuffer = glbBuffer;
        this.buffers = {};
        this.requests = {};
        this._requestImage = requestImage;
        this.accessor = new Accessor(rootPath, gltf, glbBuffer);
    }   
    /**
     * 
     * @param {*} cb 
     */
    iterateMesh(cb) {
        const meshes = this.gltf.meshes;
        for (let i = 0; i < meshes.length; i++) {
            cb(i, meshes[i], i);
        }
    }
    /**
     * 
     * @param {*} cb 
     */
    iterateNode(cb) {
        const nodes = this.gltf.nodes;
        for (let i = 0; i < nodes.length; i++) {
            cb(i, nodes[i], i);
        }
    }
    /**
     * 
     * @param {*} cb 
     */
    iterateScene(cb) {
        const scenes = this.gltf.scenes;
        for (let i = 0; i < scenes.length; i++) {
            cb(i, scenes[i], i);
        }
    }
    /**
     * 
     * @param {*} nodeJSON 
     * @param {*} meshes 
     */
    createNode(nodeJSON, meshes) {
        // camera	integer	The index of the camera referenced by this node.	No
        // children	integer [1-*]	The indices of this node's children.	No
        // skin	integer	The index of the skin referenced by this node.	No
        // matrix	number [16]	A floating-point 4x4 transformation matrix stored in column-major order.	No, default: [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]
        // mesh	integer	The index of the mesh in this node.	No
        // rotation	number [4]	The node's unit quaternion rotation in the order (x, y, z, w), where w is the scalar.	No, default: [0,0,0,1]
        // scale	number [3]	The node's non-uniform scale, given as the scaling factors along the x, y, and z axes.	No, default: [1,1,1]
        // translation	number [3]	The node's translation along the x, y, and z axes.	No, default: [0,0,0]
        // weights	number [1-*]	The weights of the instantiated Morph Target. Number of elements must match number of Morph Targets of used mesh.	No
        // name	string	The user-defined name of this object.	No
        // extensions	object	Dictionary object with extension-specific objects.	No
        // extras	any	Application-specific data.	No

        const node = {};
        if (defined(nodeJSON.name)) node.name = nodeJSON.name;
        if (defined(nodeJSON.children)) node.children = nodeJSON.children;
        if (defined(nodeJSON.matrix)) node.matrix = nodeJSON.matrix;
        if (defined(nodeJSON.rotation)) node.rotation = nodeJSON.rotation;
        if (defined(nodeJSON.scale)) node.scale = nodeJSON.scale;
        if (defined(nodeJSON.translation)) node.translation = nodeJSON.translation;
        if (defined(nodeJSON.extras)) node.extras = nodeJSON.extras;
        if (defined(nodeJSON.mesh)) {
            // V2中node的mesh唯一，但为和 V1 保持一致，meshes解析为数组
            node.meshes = [meshes[nodeJSON.mesh]];
        }
        //TODO 还缺 camera, skeletons, skin, extensions, weights 的解析
        return node;
    }
    /**
     * 
     * https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#reference-material
     * As the reference-material describled, we should parse the properties which are pbrMetallicRoughness,normalTextureInfo,occlusionTextureInfo and emissiveTextureInfo
     * 
     * @param {*} index 
     */
    getMaterial(index) {
        const material = this.gltf.materials[index];
        const pbrMetallicRoughness = material.pbrMetallicRoughness;
        const normalTextureInfo = material.normalTexture;
        const occlusionTextureInfo = material.occlusionTexture;
        const emissiveTextureInfo = material.emissiveTexture;
        let promises = [];
        if (pbrMetallicRoughness) {
            promises.push(this._getPbrMetallicRoughness(pbrMetallicRoughness));
        }
        if (normalTextureInfo) {
            promises.push(this._getTextureInfo(normalTextureInfo, "normalTexture"));
        }
        if (occlusionTextureInfo) {
            promises.push(this._getTextureInfo(occlusionTextureInfo, "occlusionTexture"));
        }
        if (emissiveTextureInfo) {
            promises.push(this._getTextureInfo(emissiveTextureInfo, "emissiveTexture"));
        }
        return new Promise((resolve) => {
            Promise.all(promises).then(assets => {
                for (let i = 0; i < assets.length; i++) {
                    material[assets[i].name] = assets[i];
                }
                resolve({material});
            });
        });
    }
    /**
     * pbrmetallicroughness specifaction
     * https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#reference-pbrmetallicroughness
     * 
     * @param {*} pbrMetallicRoughness 
     */
    _getPbrMetallicRoughness(pbrMetallicRoughness) {
        const baseColorTexture = pbrMetallicRoughness.baseColorTexture;
        const metallicRoughnessTexture = pbrMetallicRoughness.metallicRoughnessTexture;
        pbrMetallicRoughness.name = "pbrMetallicRoughness";
        let promises = [];
        if (baseColorTexture) {
            promises.push(this._getTextureInfo(baseColorTexture, "baseColorTexture"));
        }
        if (metallicRoughnessTexture) {
            promises.push(this._getTextureInfo(metallicRoughnessTexture, "metallicRoughnessTexture"));
        }
        return new Promise(resolve => {
            Promise.all(promises).then(assets => {
                for (let i = 0; i < assets.length; i++) {
                    delete assets[i].index;
                    pbrMetallicRoughness[assets[i].name] = assets[i];
                }
                resolve(pbrMetallicRoughness);
            });
        });
    }
    /**
     * textureinfo specifaction
     * https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#reference-normaltextureinfo
     * 
     * @param {*} texInfo 
     * @param {*} name 
     */
    _getTextureInfo(texInfo, name) {
        const index = texInfo.index;
        if (!defined(index)) {
            return null;
        }
        texInfo.name = name;
        const promise = this._getTexture(index);
        return new Promise((resolve) => {
            promise.then(result => {
                texInfo.texture = result;
                delete texInfo.index;
                resolve(texInfo);
            });
        });
    }
    /**
     * get texture by index
     * @param {*} index 
     */
    _getTexture(index) {
        const texture = this.gltf.textures[index];
        if (!texture) {
            return null;
        }
        const image = this.gltf.images[texture.source];//get image object by source index
        const promise = this._loadImage(image);
        return new Promise(resolve => {
            promise.then(data => {
                image.array = data;
                delete image.uri;
                delete image.bufferView;
                texture.image = image;
                const sampler = defined(texture.sampler) ? this.gltf.samplers[texture.sampler] : undefined;
                if (sampler) {
                    texture.sampler = sampler;
                }
                resolve(texture);
            });
        });
    }
    /**
     * 
     * @param {*} source 
     */
    _loadImage(source) {
        if (defined(source.bufferView)) {
            const bufferView = this.gltf.bufferViews[source.bufferView];
            const start = (bufferView.byteOffset || 0) + this.glbBuffer.byteOffset;
            const length = bufferView.byteLength;
            return Promise.resolve(new Uint8Array(this.glbBuffer.buffer, start, length));
        } else {
            //load from external uri
            const file = source.uri;
            let url = file.indexOf("data:image/") === 0 ? file : this.rootPath + "/" + file;
            if (this.requests[url]) {
                // a promise already created
                return this.requests[url].then(() => {
                    return this.buffers[url];
                });
            }
            const promise = this.requests[url] = new Promise((resolve, reject) => {
                this._requestImage(url, (err, data) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    this.buffers[url] = data;
                    resolve(data);
                });
            });
            return promise;
        }
    }
    /**
     * resolved data from accessors for samplers by its item's index
     * @param {*} animations 
     */
    getAnimations(animations) {
        const promises = [];
        animations.forEach(animation => {
            promises.push(this.getSamplers(animation.samplers));
        });
        return Promise.all(promises).then(assets => {
            for (let i = 0; i < assets.length; i++) {
                animations[i].samplers = assets[i];
            }
            return animations;
        });
    }
    /**
     * https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#reference-animation-sampler
     * @param {*} samplers 
     */
    getSamplers(samplers) {
        const promises = [];
        for (let i = 0; i < samplers.length; i++) {
            if (!defined(samplers[i].input) && !defined(samplers[i].output))
                continue;
            promises.push(this.accessor._requestData("input", samplers[i].input));
            promises.push(this.accessor._requestData("output", samplers[i].output));
        }
        return Promise.all(promises).then(assets => {
            for (let i = 0; i < assets.length / 2; i++) {
                samplers[i].input = assets[i * 2];
                samplers[i].output = assets[i * 2 + 1];
                //sampler's default interpolation is 'LINEAR'
                if (!samplers[i].interpolation) {
                    samplers[i].interpolation = "LINEAR";
                }
            }
            return samplers;
        });
    }
}
/**
 * @class
 */
class GLTFLoader {
    constructor(rootPath, gltf, options) {
        this.options = options || {};
        if (gltf.buffer instanceof ArrayBuffer) {
            const { json, glbBuffer } = GLBReader.read(gltf.buffer, gltf.byteOffset);
            this._init(rootPath, json, glbBuffer);
        } else {
            this._init(rootPath, gltf);
        }
    }

    load() {
        // this._initTexture();
        const gltf = this._loadScene();
        const animations = this._loadAnimations();
        return Promise.all([gltf, animations]).then(fullfilled => {
            fullfilled[0].animations = fullfilled[1];
            return fullfilled[0];
        });
    }

    static getAnimationClip(gltf, node, time) {
        return AnimationClip.getModelMarix(gltf, node, time);
    }

    _init(rootPath, gltf, glbBuffer) {
        this.gltf = gltf;
        this.version = gltf.asset ? +gltf.asset.version : 1;
        this.rootPath = rootPath;
        this.glbBuffer = glbBuffer;
        this.buffers = {};
        this.requests = {};
        this.accessor = new Accessor(rootPath, gltf, glbBuffer);
        this.options.requestImage = this.options.requestImage || requestImage;
        this._imageCanvas = document.createElement("canvas");
        if (this.version === 2) {
            this.adapter = new GLTFV2(rootPath, gltf, glbBuffer, this.options.requestImage);
        } else {
            this.adapter = new GLTFV1(rootPath, gltf);
        }
    }

    // _loadImages()

    //V1和V2需要实现的方法
    // iterateMesh, iterateNode,

    _loadScene() {
        return this._loadNodes().then(nodeMap => {
            const scenes = this.scenes = [];
            let defaultScene;
            this.adapter.iterateScene((key, sceneJSON, idx) => {
                const scene = {};
                if (sceneJSON.name) scene.name = sceneJSON.name;
                const nodes = sceneJSON.nodes;
                if (nodes) {
                    const nodes = sceneJSON.nodes.map(n => nodeMap[n]);
                    scene.nodes = nodes.map(node => {
                        const children = node.children;
                        if (!children) {
                            return node;
                        }
                        const childNodes = children.map(c => nodeMap[c]);
                        node.children = childNodes;
                        return node;
                    });
                }
                if (this.gltf.scene === key) {
                    defaultScene = idx;
                }
                scenes.push(scene);
            });
            const gltf = {
                scene : defaultScene,
                scenes : scenes
            };
            if (this.gltf.extensions) {
                gltf.extensions = this.gltf.extensions;
            }
            return gltf;
        });
    }

    _loadNodes() {
        // node -> meshes -> primitives ->
        const promise = this._loadMeshes();
        return promise.then(() => {
            const nodes = this.nodes = {};
            this.adapter.iterateNode((key, nodeJSON) => {
                //TODO 缺少 skin， morgh targets 和 extensions
                const node = this.adapter.createNode(nodeJSON, this.meshes);
                nodes[key] = node;
            });
            return nodes;
        });
    }

    _loadAnimations() {
        const animations = this.gltf.animations;
        const promise = defined(animations) ? this.adapter.getAnimations(animations) : null;
        return promise;
    }

    _loadMeshes() {
        this.meshes = {};
        const promises = [];
        this.adapter.iterateMesh((key, meshJSON) => {
            promises.push(this._loadMesh(meshJSON).then(mesh => {
                this.meshes[key] = mesh;
                return mesh;
            }));
        });
        return Promise.all(promises);
    }

    _loadMesh(mesh) {
        //TODO 解析材质
        const primitives = mesh.primitives; // attributes
        const promises = primitives.map(p => this._loadPrimitive(p));
        return Promise.all(promises);
    }

    _loadPrimitive(primJSON) {
        // Type	Description	Required
        // attributes	object	A dictionary object, where each key corresponds to mesh attribute semantic and each value is the index of the accessor containing attribute's data.	✅ Yes
        // indices	integer	The index of the accessor that contains the indices.	No
        // material	integer	The index of the material to apply to this primitive when rendering.	No
        // mode	integer	The type of primitives to render.	No, default: 4
        // targets	object [1-*]	An array of Morph Targets, each Morph Target is a dictionary mapping attributes (only POSITION, NORMAL, and TANGENT supported) to their deviations in the Morph Target.	No
        // extensions	object	Dictionary object with extension-specific objects.	No
        // extras	any	Application-specific data.	No

        let promises = [];
        const attributes = primJSON.attributes;
        const matPromise = this._loadMaterial(primJSON);
        // to keep it simple, read baseColor texture from gltf.textures directly.
        if (matPromise) promises.push(matPromise);
        let material = null;
        for (const attr in attributes) {
            //e.g.          NORMAL, 0
            const promise = this.accessor._requestData(attr, attributes[attr]);
            if (promise) {
                promises.push(promise);
            }
        }

        if (defined(primJSON.indices)) {
            const promise = this.accessor._requestData("indices", primJSON.indices);
            if (promise) {
                promises.push(promise);
            }
        }

        return Promise.all(promises).then(assets => {
            let indices;
            this.transferables = [];
            const attrData = assets.reduce((accumulator, currentValue) => {
                if (currentValue.material) {
                    material = currentValue.material;
                    if (currentValue.transferables) {
                        currentValue.transferables.forEach(buffer => {
                            if (this.transferables.indexOf(buffer) < 0) {
                                this.transferables.push(buffer);
                            }
                        });
                    }
                } else {
                    if (currentValue.name === "indices") {
                        indices = currentValue.array;
                    } else {
                        accumulator[currentValue.name] = {
                            array : currentValue.array,
                            itemSize :  currentValue.itemSize
                        };
                    }
                    if (this.transferables.indexOf(currentValue.array.buffer) < 0) {
                        this.transferables.push(currentValue.array.buffer);
                    }
                }
                return accumulator;
            }, {});
            const primitive = {
                attributes : attrData,
                material
            };
            if (indices) primitive.indices = indices;
            if (defined(primJSON.mode)) primitive.mode = modes[primJSON.mode];
            if (defined(primJSON.extras)) primitive.extras = primJSON.extras;
            //TODO material 和 targets 没有处理
            return primitive;
        });
    }

    _loadMaterial(primJSON) {
        const material = primJSON.material;
        if (this.version === 2) {
            if (!defined(material)) {
                return null;
            }
            const matPromise = this.adapter.getMaterial(material);
            return matPromise;
        }
        //version 1
        const texture = this.adapter.getBaseColorTexture(material);
        if (!texture) {
            return null;
        }
        const promise = this._loadImage(texture.source);
        return promise.then(image => {
            const transferables = [image.buffer];
            const source = texture.source;
            texture.source = {
                image
            };
            if (source.uri) texture.source.uri = source.uri;
            if (source.name) texture.source.name = source.name;
            if (source.extensions) texture.source.extensions = source.extensions;
            if (source.extras) texture.source.extras = source.extras;
            if (source.mimeType) texture.source.mimeType = source.mimeType;
            if (source.width) texture.source.width = source.width;
            if (source.height) texture.source.height = source.height;
            const result = {
                baseColorTexture : texture
                //TODO 其他材质的读取
            };
            if (material.name) result.name = material.name;
            if (material.extensions) result.extensions = material.extensions;
            if (result.extensions) {
                delete result.extensions["KHR_binary_glTF"];
                delete result.extensions["binary_glTF"];
                if (Object.keys(result.extensions).length === 0) {
                    delete result.extensions;
                }
            }
            if (material.extras) result.extras = material.extras;
            return {
                material : result,
                transferables
            };
        });
    }

    _loadImage(source) {
        if (source.bufferView || source.extensions && (source.extensions["KHR_binary_glTF"] || source.extensions["binary_glTF"])) {
            const binary = source.bufferView ? source : source.extensions["KHR_binary_glTF"] || source.extensions["binary_glTF"];
            if (source.extensions) {
                source.mimeType = binary.mimeType;
                source.width = binary.width;
                source.height = binary.height;
            }
            const bufferView = this.gltf.bufferViews[binary.bufferView];
            const start = (bufferView.byteOffset || 0) + this.glbBuffer.byteOffset;
            const length = bufferView.byteLength;

            return Promise.resolve(new Uint8Array(this.glbBuffer.buffer, start, length));
        } else {
            //load from external uri
            const bin = source.uri;
            const url = this.rootPath + "/" + bin;
            if (this.requests[url]) {
                // a promise already created
                return this.requests[url].then(() => {
                    return new Uint8Array(this.buffers[url]);
                });
            }
            //use fetch, https://www.w3cschool.cn/fetch_api/fetch_api-5uen2ll8.html
            const promise = this.requests[url] = fetch(url,{
                responseType: "arraybuffer"
            }).then(response=>{
                const buffer = response.arrayBuffer();
                this.buffers[url] = buffer;
                return new Uint8Array(buffer);
            });
            return promise;
        }
    }
}

module.exports = GLTFLoader;