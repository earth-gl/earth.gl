const defined = require("./../utils/defined"),
    fetch = require("./../utils/fetch"),
    GLBReader = require("./bufferReader/GLBReader"),
    GLTFV1 = require("./adapters/GLTFV1"),
    GLTFV2 = require("./adapters/GLTFV2"),
    Accessor = require("./bufferReader/Accessor");
const canvas = typeof document === "undefined" ? null : document.createElement("canvas");
const modes = ["points", "lines", "line loop", "line strip", "triangles", "triangle strip", "triangle fan"];

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