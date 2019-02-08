const fetch = require('./../utils/fetch'),
    { GLMatrix, Mat4 } = require('kiwi.matrix'),
    GProgram = require('./GProgram'),
    GUniform = require('./GUniform'),
    WGS84 = require('./../core/Ellipsoid').WGS84,
    Geographic = require('./../core/Geographic'),
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
     * @param {String} root the root url of gltf, as 'http://139.129.7.130/models/DamagedHelmet/glTF/'
     * @param {String} modelFilename the model file name, as 'DamagedHelmet.gltf'
     * @param {Object} [options]
     * @param {Number} [options.lng] 
     * @param {Number} [options.lat]
     * @param {Number} [options.h] represent hight in meters, default is 0
     * @param {Boolean} [options.vertical] object rotate to vertical surface
     */
    constructor(root, modelFilename, options = {}) {
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
         * @type {Number} represent location in degree
         */
        this._lat = options.lat || 0.0;
        /**
         * @type {Number} represent location in degree
         */
        this._lng = options.lng || 0.0;
        /**
         * @type {Number} height
         */
        this._h = options.h || 0.0;
        /**
         * @type {Boolean} model vertical of surface
         */
        this._vertical = options.vertical == undefined ? true : options.vertical;
        /**
         * gltf extensions
         */
        this._extensions = null;
        /**
         * gltf extras
         */
        this._extras = null;
        /**
         * @type {Array}
         */
        this._caches = [];
    }
    /**
     * 
     * @param {WebGLRenderingContext} gl 
     */
    init(gl, gScene) {
        /**
         * set gl context
         */
        this._gl = gl;
        /**
         * @type {GScene}
         */
        this._gScene = gScene;
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
        const vertical = this._vertical,
            lat = this._lat,
            lng = this._lng,
            h = this._h,
            geographic = new Geographic(GLMatrix.toRadian(lng), GLMatrix.toRadian(lat), h), //convert degree to radian
            spaceV3 = WGS84.geographicToSpace(geographic),
            gl = this._gl,
            nodes = scene.nodes,
            caches = this._caches,
            gProgram = this._gProgram;
        //change program
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
                const uProject = new GUniform(gProgram, 'u_projectionMatrix'),
                    uView = new GUniform(gProgram, 'u_viewMatrix'),
                    uModel = new GUniform(gProgram, 'u_modelMatrix');
                //4.translate model matrix
                const translation = spaceV3.clone().add(node.modelMatrix.getTranslation());
                let modelMatrix = node.modelMatrix.clone().setTranslation(translation);
                //rotate to surface vertical
                if (vertical) {
                    //按照经度旋转
                    modelMatrix = modelMatrix.clone().rotateZ(GLMatrix.toRadian(lng - 90));
                    //rotate model matrix
                    modelMatrix = modelMatrix.clone().rotateX(GLMatrix.toRadian(lat));
                }
                //4.cache buffers
                caches.push({
                    //模型矩阵值
                    modelMatrix: modelMatrix.value,
                    uProject: uProject,
                    uView: uView,
                    uModel: uModel,
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
    }
    /**
     * 
     * @param {Camera} camera 
     */
    render(camera) {
        const caches = this._caches,
            gProgram = this._gProgram,
            gl = this._gl;
        gProgram.useProgram();
        for (let i = 0, len = caches.length; i < len; i++) {
            const cache = caches[i];
            const { accessor,
                indicesBuffer,
                mode,
                indicesLength,
                indicesComponentType,
                indicesOffset,
                uProject,
                uView,
                modelMatrix,
                uModel } = cache;
            //relink
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