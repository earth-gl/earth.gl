
//
const fetch = require('./../utils/fetch'),
    isNode = require('./../utils/isNode'),
    GProgram = require('./GProgram'),
    GLTFLoader = require('./../loaders/GLTFLoader');
//shaders 
const fragText = isNode ? require('glslify').file('./../shader/standard-fs.glsl') : require('./../shader/standard-fs.glsl');
const vertText = isNode ? require('glslify').file('./../shader/standard-vs.glsl') : require('./../shader/standard-vs.glsl');
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
        this.root = root || 'http://139.129.7.130/models/DamagedHelmet/glTF/';
        /**
         * 
         */
        this.modelFilename = modelFilename || 'DamagedHelmet.gltf';
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
        this._scenes = null;
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
            responseType: 'json'
        }).then(response => {
            return response.json();
        }).then(json => {
            const uri = root + modelFilename;
            const loader = new GLTFLoader(json, {
                uri: uri
            });
            loader.load(program).then(scenes => {
                that._scenes = scenes;
                scenes.forEach(scene => {
                    that._initComponents(scene);
                });
            });
        });
    }
    /**
     * 
     */
    _initComponents(scene) {
        const gl = this._gl,
            nodes = scene.nodes,
            program = this._program;
        program.useProgram();
        //prepare nodes
        nodes.forEach((node) => {
            if (!node.mesh && !node.children) return;
            const mesh = node.mesh;
            mesh.primitives.forEach(primitive => {
                //use vao
                const ext = gl.getExtension('OES_vertex_array_object');
                const vao = ext.createVertexArrayOES();
                ext.bindVertexArrayOES(vao);
                //
                const posAccessor = primitive.attributes['POSITION'];
                const positionBuffer = posAccessor.bufferView;
                //1.bind position buffer
                positionBuffer.bindBuffer();
                positionBuffer.bufferData();
                posAccessor.link('a_position');
                //oes
                ext.bindVertexArrayOES(null);
                //2.bind index buffer
                const indicesBuffer = primitive.indicesBuffer;
                indicesBuffer.bindBuffer();
                //3.draw element
                gl.drawElements(primitive.mode, primitive.indicesLength, primitive.indicesComponentType, primitive.indicesOffset);
            });
        });
        // const verticesBuffer = this._verticesBuffer = new GBuffer(program, gl.ARRAY_BUFFER, gl.STATIC_DRAW, "a_position");
        // // transform data
        // verticesBuffer.bindBuffer();
        // verticesBuffer.bufferData(new Float32Array(this._vertices));
        // verticesBuffer.linkAndEnableAttribPointer(3, gl.FLOAT, false, 0, 0);
        // // transform index data
        // const indexBuffer = this._indicesBuffer = new GBuffer(program, gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW);
        // indexBuffer.bindBuffer();
        // indexBuffer.bufferData(new Uint16Array(this._indices));
        //
        // this._u_projectionMatrix = new GUniform(program, 'u_projectionMatrix');
        // this._u_viewMatrix = new GUniform(program, 'u_viewMatrix');
        // this._u_modelMatrix = new GUniform(program, 'u_modelMatrix');
    }

    render() {

    }

}

module.exports = GLoader;