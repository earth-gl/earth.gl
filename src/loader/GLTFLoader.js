const { GLMatrix, Vec3, Quat, Mat4 } = require('kiwi.matrix'),
    isObject = require('./../utils/isObject'),
    GProgram = require('./../renderer/Program'),
    GUniform = require('./../renderer/Uniform'),
    WGS84 = require('./../core/Ellipsoid').WGS84,
    Geographic = require('./../core/Geographic'),
    GLBLoader = require('./GLBLoader'),
    GLTF = require('./../core/GLTF');
//shaders 
const noskin_fragText = require('./../shader/gltf-noskin-fs.glsl');
const noskin_vertText = require('./../shader/gltf-noskin-vs.glsl');
const skin_fragText = require('./../shader/gltf-skin-fs.glsl');
const skin_vertText = require('./../shader/gltf-skin-vs.glsl');
/**
 * @class
 */
class GLoader {
    /**
     * 
     * @param {String} rootUrl the root uri of gltf, as 'http://139.129.7.130/models/DamagedHelmet/glTF/'
     * @param {String|Object} model the model file name or GLB object, as 'DamagedHelmet.gltf' or { buffer, byteOffset }
     * @param {ArrayBuffer} [model.buffer]
     * @param {Number} [model.byteOffset]
     * @param {Object} [options]
     * @param {Number} [options.lng] 
     * @param {Number} [options.lat]
     * @param {Number} [options.h] represent hight in meters, default is 0
     * @param {Boolean} [options.vertical] object rotate to vertical surface
     * @param {Number} [options.scale] scale, default scale: 1000000.0
     * @param {Number} [options.animId]  default is 0
     */
    constructor(rootUrl, model, options = {}) {
        /**
         * @type {String} the root uri of gltf
         */
        this.rootUrl = rootUrl;
        /**
         * @type {String} the model file name
         */
        this.model = model;
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
         * @type {Number}
         */
        this._animId = options.animId || 0;
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
        /**
         * @type {GSkin[]}
         */
        this._skins = [];
    }
    /**
     * @param {WebGLRenderingContext} gl 
     * @param {Global} global object
     */
    _init(gl, global) {
        /**
         * set gl context
         */
        this._gl = gl;
        /**
         * @type {GScene}
         */
        this._global = global;
        /**
         * @type {GProgram}
         */
        this._program = null;
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
     * inital gltf configures
     */
    _initialRequest() {
        const url = this.rootUrl, model = this.model;
        isObject(model) ? this._createGLTFFromGLB(url, model) : this._createGLTFFromJson(url + model);
    }
    /**
     * 
     * @param {*} glb buffer, byteOffset
     */
    _createGLTFFromGLB(gltfUrl,glb) {
        const gl = this._gl, that = this;
        const { json, subglb } = GLBLoader.load(glb.buffer, glb.byteOffset);
        const gProgram = that._program = json.skins && json.skins.length > 0 ? new GProgram(gl, skin_vertText, skin_fragText) : new GProgram(gl, noskin_vertText, noskin_fragText),
            objectLoader = new GLTF(json, { url: gltfUrl, glb: subglb });
        objectLoader.load(gProgram).then(GLTF => {
            //prerocess scene nodes
            that._initComponents(GLTF.scene);
            //store scene
            that._scene = GLTF.scene;
            //store animations
            that._animations = GLTF.animations || [];
            //store nodes
            that._nodes = GLTF.nodes || [];
            //store skins
            that._skins = GLTF.skins || [];
        });
    }
    /**
     * 
     * @param {String} url 
     */
    _createGLTFFromJson(url) {
        const gl = this._gl,
            that = this;
        fetch(url, {
            responseType: 'json'
        }).then(response => {
            return response.json();
        }).then(json => {
            //create program according to skin
            const gProgram = that._program = json.skins && json.skins.length > 0 ? new GProgram(gl, skin_vertText, skin_fragText) : new GProgram(gl, noskin_vertText, noskin_fragText),
                objectLoader = new GLTF(json, { url: url });
            //initalization loader resource
            objectLoader.load(gProgram).then(GLTF => {
                //prerocess scene nodes
                that._initComponents(GLTF.scene);
                //store scene
                that._scene = GLTF.scene;
                //store animations
                that._animations = GLTF.animations || [];
                //store nodes
                that._nodes = GLTF.nodes || [];
                //store skins
                that._skins = GLTF.skins || [];
            });
        });
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
    _initComponents(scene) {
        const sceneNodes = scene.nodes,
            gProgram = this._program;
        //change program
        gProgram.useProgram();
        //liter node
        const processNode = (node) => {
            //process mesh
            if (node.mesh) {
                const mesh = node.mesh;
                mesh.primitives.forEach(primitive => {
                    //1.position attribute
                    const vAccessor = primitive.attributes['POSITION'];
                    if (vAccessor) {
                        vAccessor.bindBuffer();
                        vAccessor.bufferData();
                        vAccessor.link('a_position');
                    }
                    //2.normal attribute
                    // const nAccessor = primitive.attributes['NORMAL'];
                    // if (nAccessor) {
                    //     nAccessor.bindBuffer();
                    //     nAccessor.bufferData();
                    //     nAccessor.link('a_normal');
                    // }
                    //3.skin joints
                    const jAccessor = primitive.attributes['JOINTS_0'];
                    if (jAccessor) {
                        jAccessor.bindBuffer();
                        jAccessor.bufferData();
                        jAccessor.link('a_joints_0');
                    }
                    //4.skin weights
                    const wAccessor = primitive.attributes['WEIGHTS_0'];
                    if (wAccessor) {
                        wAccessor.bindBuffer();
                        wAccessor.bufferData();
                        wAccessor.link('a_weights_0');
                    }
                    //5.bind index buffer
                    const indicesBuffer = primitive.indicesBuffer;
                    indicesBuffer.bindBuffer();
                    indicesBuffer.bufferData();
                    //6.uniform
                    //5.1 skin jontmatrix unifrom
                    const uJoint = new GUniform(gProgram, 'u_jointMatrix');
                    //5.2 camera uniform
                    const uProject = new GUniform(gProgram, 'u_projectionMatrix'),
                        uView = new GUniform(gProgram, 'u_viewMatrix'),
                        uModel = new GUniform(gProgram, 'u_modelMatrix');
                    //4.cache mesh
                    primitive.cache = {
                        attributes: {
                            vAccessor,
                            //nAccessor,
                            jAccessor,
                            wAccessor
                        },
                        uniforms: {
                            uJoint,
                            uProject,
                            uView,
                            uModel
                        },
                        indices: {
                            indicesBuffer,
                            indicesLength: primitive.indicesLength,
                            indicesComponentType: primitive.indicesComponentType
                        },
                        mode: primitive.mode,
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
    /**
     * iter draw node and children
     * @param {*} node 
     * @param {*} camera 
     * @param {*} parentMatrix 
     */
    _drawNode(node, camera, parentMatrix) {
        //gl context, set the node.matrix as a store
        const gl = this._gl,
            geoTransformMatrix = this._geoTransformMatrix.clone(),
            matrix = node.matrix = parentMatrix ? parentMatrix.clone().multiply(node.modelMatrix) : node.modelMatrix.clone();
        if (node.skin) {
            //}{ bug todo
            const skin = node.skin,
                //inverseTransformMat4 = node.modelMatrix.clone().invert();
                inverseTransformMat4 = matrix.clone().invert();
            skin._processJonitMatrix(inverseTransformMat4);
        }
        //draw mesh
        if (node.mesh) {
            const primitives = node.mesh.primitives;
            primitives.forEach(primitive => {
                const cache = primitive.cache;
                const {
                    attributes,
                    uniforms,
                    indices,
                    mode
                } = cache;
                //relink
                const { vAccessor, nAccessor, jAccessor, wAccessor } = attributes;
                vAccessor ? vAccessor.relink() : null;
                nAccessor ? nAccessor.relink() : null;
                jAccessor ? jAccessor.relink() : null;
                wAccessor ? wAccessor.relink() : null;
                //indices
                const { indicesBuffer, indicesLength, indicesComponentType } = indices;
                indicesBuffer.bindBuffer();
                //uniform
                const { uJoint, uProject, uView, uModel } = uniforms;
                uJoint && node.skin ? uJoint.assignValue(node.skin.jointMatrixData) : null;
                uProject ? uProject.assignValue(camera.ProjectionMatrix) : null;
                uView ? uView.assignValue(camera.ViewMatrix) : null;
                uModel ? uModel.assignValue(geoTransformMatrix.multiply(matrix).value) : null;
                //draw elements
                gl.drawElements(mode, indicesLength, indicesComponentType, 0);
            });
        }
        //draw children
        for (let i = 0, len = !node.children ? 0 : node.children.length; i < len; i++)
            this._drawNode(node.children[i], camera, matrix);
    }
    /**
     * 
     * @param {*} animation 
     */
    _applyAnimation(animation, timeStamp) {
        const nodes = this._nodes;
        //channel samplers update
        for (let j = 0, len2 = animation.channels.length; j < len2; j++) {
            const channel = animation.channels[j],
                animationSampler = channel.sampler,
                node = nodes[channel.target.nodeID];
            switch (channel.target.path) {
                case 'rotation':
                    node.rotation = animationSampler.getUpdatedQuaternion(timeStamp);
                    break;
                case 'translation':
                    node.translation = animationSampler.getUpdatedAnimateion(timeStamp);
                    break;
                case 'scale':
                    node.scale = animationSampler.getUpdatedAnimateion(timeStamp);
                    break;
            }
            //update model matrix
            node.updateModelMatrix();
        }
    }
    /**
     * 
     * @param {Camera} camera 
     */
    render(camera, t) {
        const animId = this._animId,
            gProgram = this._program,
            sceneNodes = this._scene === null ? [] : this._scene.nodes,
            animations = this._animations;
        if (!gProgram) return;
        //change program
        gProgram.useProgram();
        //apply animations, default runs animation 0
        if (animations[animId])
            this._applyAnimation(animations[animId], t);
        //draw nodes
        for (let i = 0, len = sceneNodes.length; i < len; i++)
            this._drawNode(sceneNodes[i], camera);
    }
}

module.exports = GLoader;