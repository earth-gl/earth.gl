
const fetch = require("./../utils/fetch"),
    glslify = require("glslify"),
    isNode = require("../utils/isNode"),
    GProgram = require("./GProgram"),
    GBuffer = require("./GBuffer"),
    GUniform = require("./GUniform"),
    GLTFLoader = require("./../loaders/GLTFLoader");
//shaders 
const fragText = isNode ? glslify.file("./../shader/glsl-earth-gl-gltf-fs.glsl") : require("./../shader/glsl-earth-gl-gltf-fs.glsl");
const vertText = isNode ? glslify.file("./../shader/glsl-earth-gl-gltf-vs.glsl") : require("./../shader/glsl-earth-gl-gltf-vs.glsl");
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
        this._nodes = [];
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
         * 
         */
        this._program = new GProgram(gl, vertText, fragText);
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
            program = this._program,
            modelFilename = this.modelFilename;
        fetch(root + modelFilename, {
            responseType: "json"
        }).then(response => {
            return response.json();
        }).then(json => {
            const uri = root + modelFilename;
            const loader = new GLTFLoader(json,{
                uri:uri
            });
            loader.load(program).then(gltf => {
            //     that._scene = gltf.scenes[gltf.scene];
            //     that._nodes = that._scene.nodes;
            //     that._initComponents();
            });
        });
    }

    _extractMesh(){

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
        nodes.forEach((node)=>{
            if(!node.meshes && !node.chidren) return;
            const meshes = node.children?this._extractMesh(node.chidren):node.meshes;
            meshes.forEach(mesh=>{
                mesh.primitives.forEach(primitive=>{
                    const attributes = {};
                    for(const attr in primitive.attributes){
                        attributes[attr] = primitive.attributes[attr].array;
                    }
                });
            });
        });
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