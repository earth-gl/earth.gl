const fetch = require('./../utils/fetch'),
    GProgram = require('./GProgram'),
    GUniform = require('./GUniform'),
    GLTFLoader = require('./../loader/GLTFLoader');
//shaders 
const fragText = require('./../shader/standard-fs.glsl');
const vertText = require('./../shader/standard-vs.glsl');
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
        this._gProgram = null;
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
        /**
         * @type {Array}
         */
        this.caches = [];
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
        this._gProgram = new GProgram(gl, vertText, fragText);
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
            program = this._gProgram,
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
            caches = this.caches,
            gProgram = this._gProgram;
        gProgram.useProgram();
        //prepare nodes
        nodes.forEach((node) => {
            if (!node.mesh && !node.children) return;
            const mesh = node.mesh;
            mesh.primitives.forEach(primitive => {
                //1.bind vertex buffer
                const posAccessor = primitive.attributes['POSITION'];
                posAccessor.bindBuffer();
                posAccessor.bufferData();
                posAccessor.link('a_position');
                //2.bind index buffer
                const indicesBuffer = primitive.indicesBuffer;
                indicesBuffer.bindBuffer();
                indicesBuffer.bufferData();
                //3.uniform
                //uniform mat4 u_projectionMatrix;
                // uniform mat4 u_viewMatrix;
                // uniform mat4 u_modelMatrix;
                const uProject = new GUniform(gProgram,'u_projectionMatrix'),
                    uView = new GUniform(gProgram,'u_viewMatrix'),
                    uModel = new GUniform(gProgram,'u_modelMatrix');
                //4.cache buffers
                caches.push({
                    //模型矩阵值
                    modelMatrix:node.modelMatrix.value,
                    uProject:uProject,
                    uView:uView,
                    uModel:uModel,
                    accessor: posAccessor,
                    indicesBuffer: indicesBuffer,
                    mode: primitive.mode,
                    indicesLength: primitive.indicesLength,
                    indicesComponentType: primitive.indicesComponentType,
                    indicesOffset: primitive.indicesOffset
                });
                //4.draw element
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
    /**
     * 
     * @param {Camera} camera 
     */
    render(camera) {
        const caches = this.caches,
            gProgram = this._gProgram,
            gl = this._gl;
        gProgram.useProgram();
        for (let i = 0, len = caches.length; i < len; i++) {
            const cache = caches[i];
            const accessor = cache.accessor,
                indicesBuffer = cache.indicesBuffer,
                mode = cache.mode,
                indicesLength = cache.indicesLength,
                indicesComponentType = cache.indicesComponentType,
                indicesOffset = cache.indicesOffset,
                uProject = cache.uProject,
                uView = cache.uView,
                modelMatrix = cache.modelMatrix,
                uModel = cache.uModel;
            accessor.relink();
            indicesBuffer.bindBuffer();
            uProject.assignValue(camera.ProjectionMatrix);
            uView.assignValue(camera.ViewMatrix);
            uModel.assignValue(modelMatrix);
            //draw elements
            gl.drawElements(mode, indicesLength, indicesComponentType, indicesOffset);
        }
    }

}

module.exports = GLoader;