const fetch = require('./../utils/fetch'),
    { GLMatrix, Vec3, Quat, Mat4 } = require('kiwi.matrix'),
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
     * @param {Number} [options.scale] scale, default scale: 1000000.0
     */
    constructor(root, modelFilename, options = {}) {
        /**
         * 
         */
        this.root = root;
        /**
         * 
         */
        this.modelFilename = modelFilename;
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
        this._scene = null;
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
         * @type {Number}
         */
        this._scaleV1 = options.scale == undefined ? 1.0 : options.scale;
        /**
         * @type {Vec3}
         */
        this._scaleV3 = new Vec3().set(this._scaleV1, this._scaleV1, this._scaleV1);
        /**
         * gltf extensions
         */
        this._extensions = null;
        /**
         * gltf extras
         */
        this._extras = null;
        /**
         * main scene
         */
        this._scene = null;
        /**
         * @type {Object} key-value, nodeId-nodeCache
         */
        this._nodes = [];
        /**
         * @type {GAnimation[]}
         */
        this._animations = [];
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
         * initial geoTransform
         */
        this._geoTransformMatrix = this._updateGeoTransform();
        /**
         * initial request
         */
        this._initialRequest();
    }
    /**
     * update the geo transform matrix, support (surface vertical) and (surface location)
     */
    _updateGeoTransform() {
        //update the geotransform matrix
        const scaleV3 = this._scaleV3,
            lat = this._lat,
            lng = this._lng,
            h = this._h, //set hight according to the scale 
            geographic = new Geographic(GLMatrix.toRadian(lng), GLMatrix.toRadian(lat), h), //convert degree to radian
            geoTranslation = WGS84.geographicToSpace(geographic),
            geoRotateZ = GLMatrix.toRadian(lng - 90),
            geoRotateX = GLMatrix.toRadian(lat);
        // calcute root matrix
        const matrix = Mat4.fromRotationTranslationScale(new Quat(), geoTranslation, scaleV3);
        //matrix.setTranslation(geoTranslation);
        matrix.rotateZ(geoRotateZ);
        matrix.rotateX(geoRotateX);
        //return the geo matrix
        return matrix;
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
            loader.load(program).then(GLTF => {
                //prerocess scene nodes
                that._initComponents(GLTF.scene);
                //store scene
                that._scene = GLTF.scene;
                //store animations
                that._animations = GLTF.animations || [];
                //store nodes
                that._nodes = GLTF.nodes || [];
            });
        });
    }
    /**
     * 
     */
    _initComponents(scene) {
        const sceneNodes = scene.nodes,
            gProgram = this._gProgram;
        //change program
        gProgram.useProgram();
        //liter node
        const processNode = (node) => {
            //process mesh
            if (node.mesh) {
                const mesh = node.mesh;
                mesh.primitives.forEach(primitive => {
                    //1.bind vertex buffer
                    const vAccessor = primitive.attributes['POSITION'];
                    vAccessor.bindBuffer();
                    vAccessor.bufferData();
                    vAccessor.link('a_position');
                    //2.bind index buffer
                    const indicesBuffer = primitive.indicesBuffer;
                    indicesBuffer.bindBuffer();
                    indicesBuffer.bufferData();
                    //3.uniform
                    const uProject = new GUniform(gProgram, 'u_projectionMatrix'),
                        uView = new GUniform(gProgram, 'u_viewMatrix'),
                        uModel = new GUniform(gProgram, 'u_modelMatrix');
                    //4.cache mesh
                    primitive.cache = {
                        uProject: uProject,
                        uView: uView,
                        uModel: uModel,
                        vAccessor: vAccessor,
                        indicesBuffer: indicesBuffer,
                        mode: primitive.mode,
                        indicesLength: primitive.indicesLength,
                        indicesComponentType: primitive.indicesComponentType
                    };
                });
            }
            //process child node
            if (node.children) {
                node.children.forEach(node => {
                    processNode(node);
                });
            }
        };
        //prepare nodes
        sceneNodes.forEach((node) => {
            processNode(node);
        });
    }
    _drawNode(node, camera, parentMatrix) {
        //gl context
        const that = this,
            gl = this._gl;
        let matrix = parentMatrix === null ? node.modelMatrix.clone() : parentMatrix.clone().multiply(node.modelMatrix);
        if (node.mesh !== null) {
            const primitives = node.mesh.primitives;
            primitives.forEach(primitive => {
                const cache = primitive.cache;
                const {
                    vAccessor,
                    indicesBuffer,
                    mode,
                    indicesLength,
                    indicesComponentType,
                    uProject,
                    uView,
                    uModel
                } = cache;
                //relink
                vAccessor.relink();
                indicesBuffer.bindBuffer();
                //uniform
                uProject.assignValue(camera.ProjectionMatrix);
                uView.assignValue(camera.ViewMatrix);
                uModel.assignValue(matrix.value);
                //uModel.assignValue(matrix.value);
                //draw elements
                gl.drawElements(mode, indicesLength, indicesComponentType, 0);
            });
        }
        //childeren
        if (node.children) {
            //draw nodes
            node.children.forEach(node => {
                that._drawNode(node, camera, matrix);
            });
        }
    }
    /**
     * 
     * @param {Camera} camera 
     */
    render(camera, timeStamp) {
        const that = this,
            geoTransformMatrix = this._geoTransformMatrix,
            gProgram = this._gProgram,
            nodes = this._nodes,
            sceneNodes = this._scene === null ? [] : this._scene.nodes,
            animations = this._animations;
        gProgram.useProgram();
        //apply animations, default runs all animations
        for (let i = 0, len = animations.length; i < len; i++) {
            const animation = animations[i];
            for (let j = 0, len2 = animation.animationSamplers.length; j < len2; j++) {
                const animationSampler = animation.animationSamplers[j];
                animationSampler.update(timeStamp);
            }
            for (let j = 0, len2 = animation.channels.length; j < len2; j++) {
                const channel = animation.channels[j];
                const animationSampler = channel.animationSampler;
                const node = nodes[channel.target.nodeID];
                switch (channel.target.path) {
                    case 'rotation':
                        node.rotation = new Quat().set(...animationSampler._curValue._out);
                        break;
                    case 'translation':
                        node.translation = new Vec3().set(...animationSampler._curValue._out);
                        break;
                    case 'scale':
                        node.scale = new Vec3().set(...animationSampler._curValue._out);
                        break;
                    default:
                        break;
                }
                //update model matrix
                node.updateModelMatrix();
            }
        }
        //draw nodes
        sceneNodes.forEach(node => {
            that._drawNode(node, camera, geoTransformMatrix);
        });
    }
}

module.exports = GLoader;