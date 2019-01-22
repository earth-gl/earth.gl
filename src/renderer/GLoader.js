
const fetch = require("./../utils/fetch"),
    glslify = require("glslify"),
    isNode = require("../utils/isNode"),
    GProgram = require("./GProgram"),
    GBuffer = require("./GBuffer"),
    GUniform = require("./GUniform"),
    GLTFLoader = require("./../loader/GLTFLoader");
//shaders 
const fragText = isNode ? glslify.file("./../shader/glsl-earth-gl-gltf-fs.glsl") : require("./../shader/glsl-earth-gl-gltf-fs.glsl");
const vertText = isNode ? glslify.file("./../shader/glsl-earth-gl-gltf-vs.glsl") : require("./../shader/glsl-earth-gl-gltf-vs.glsl");
/**
 * https://github.com/shrekshao/minimal-gltf-loader/blob/21a758c0ebc8f62e053682344610392a39012a36/src/minimal-gltf-loader.js#L1106
 * polyfill for node
 * @param {String} url 
 * @param {Function} cb 
 */
const request = function (url, cb) {
    const image = new Image();
    image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, image.width, image.height);
        //}{ use image-raub for testing, the ctx._data typedArray, and type is Uint8Array
        cb(null, ctx._data);
    };
    image.onerror = function (err) {
        cb(err);
    };
    image.src = url;
};
/**
 * @class
 */
class GLoader {
    /**
     * 
     * @param {String} root 
     * @param {String} modelFilename 
     */
    constructor(root, modelFilename) {
        /**
         * 
         */
        this.root = root || "http://139.129.7.130/models/DamagedHelmet/glTF/";
        /**
         * 
         */
        this.modelFilename = modelFilename || "DamagedHelmet.gltf";
        /**
         * @type {WebGLRenderingContext}
         */
        this._gl = null;
        /**
         * @type {GProgram}
         */
        this._program = null;
        /**
         * gltf scene
         */
        this._scene = null;
        /**
         * gltf nodes
         */
        this._nodes = null;
        /**
         * gltf extensions
         */
        this.extensions = null;
        /**
         * gltf extras
         */
        this.extras = null;
    }
    /**
     * 
     * @param {WebGLRenderingContext} gl 
     */
    init(gl) {
        /**
         * set gl context
         */
        this._gl = gl;
        /**
         * initial request
         */
        this._initialRequest();
    }
    /**
     * 
     */
    _initialRequest() {
        const that = this,
            root = this.root,
            modelFilename = this.modelFilename;
        fetch(root + modelFilename, {
            responseType: "json"
        }).then(response => {
            return response.json();
        }).then(json => {
            const loader = new GLTFLoader(root, json, { requestImage: request });
            loader.load().then(gltf => {
                that._scene = gltf.scenes[gltf.scene];
                that._nodes = that._scene.nodes;
                that._initComponents();
            });
        });
    }
    /**
     * 
     */
    _initComponents() {
        const gl = this._gl,
            scene = this._scene,
            nodes = this._nodes;
        const program = this._program = new GProgram(gl, vertText, fragText);
        program.useProgram();
        //
        for (var i = 0, leni = nodes.length || 0; i < leni; i++)
            for (var j = 0, lenj = nodes[i].meshes.length || 0; j < lenj; j++) {
                var mesh = nodes[i].meshes[j];
                for (var k = 0, lenk = mesh.length; k < lenk; k++) {
                    var Object3D = mesh[k];
                }
            }
        //
        const verticesBuffer = this._verticesBuffer = new GBuffer(program, gl.ARRAY_BUFFER, gl.STATIC_DRAW, "a_position");
        // transform data
        verticesBuffer.bindBuffer();
        verticesBuffer.bufferData(new Float32Array(this._vertices));
        verticesBuffer.linkAndEnableAttribPointer(3, gl.FLOAT, false, 0, 0);
        // transform index data
        const indexBuffer = this._indicesBuffer = new GBuffer(program, gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW);
        indexBuffer.bindBuffer();
        indexBuffer.bufferData(new Uint16Array(this._indices));
        //
        this._u_projectionMatrix = new GUniform(program, "u_projectionMatrix");
        this._u_viewMatrix = new GUniform(program, "u_viewMatrix");
        this._u_modelMatrix = new GUniform(program, "u_modelMatrix");
    }

    render(camera) {

    }

}

module.exports = GLoader;