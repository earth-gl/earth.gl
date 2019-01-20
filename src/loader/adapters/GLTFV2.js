const defined = require("./../../utils/defined"), 
    Accessor = require("./../bufferReader/Accessor");
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

module.exports = GLTFV2;
