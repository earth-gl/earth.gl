const fetch = require('./../utils/fetch'),
    { GLMatrix, Vec3, Quat, Mat4 } = require('kiwi.matrix'),
    GProgram = require('./GProgram'),
    GUniform = require('./GUniform'),
    WGS84 = require('./../core/Ellipsoid').WGS84,
    Geographic = require('./../core/Geographic'),
    GLTFLoader = require('./../loader/GLTFLoader');
//shaders 
const standard_fragText = require('./../shader/standard-fs.glsl');
const standard_vertText = require('./../shader/standard-vs.glsl');
const bone_fragText = require('./../shader/bone-fs.glsl');
const bone_vertText = require('./../shader/bone-vs.glsl');
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
     * @param {Number} [options.animId]  default is 0
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
         * @type {GProgram}
         */
        this._gProgram = null;
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
     * 
     */
    _initialRequest() {
        const that = this,
            gl = this._gl,
            root = this.root,
            modelFilename = this.modelFilename;
        fetch(root + modelFilename, {
            responseType: 'json'
        }).then(response => {
            return response.json();
        }).then(json => {
            //create program according to skin
            const gProgram = that._gProgram = json.skins.length > 0 ? new GProgram(gl, bone_vertText, bone_fragText) : new GProgram(gl, standard_vertText, standard_fragText),
                uri = root + modelFilename,
                loader = new GLTFLoader(json, { uri: uri });
            //initalization loader resource
            loader.load(gProgram).then(GLTF => {
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
            gProgram = this._gProgram;
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
                    if(vAccessor){
                        vAccessor.bindBuffer();
                        vAccessor.bufferData();
                        vAccessor.link('a_position');
                    }
                    //2.normal attribute
                    const nAccessor = primitive.attributes['NORMAL'];
                    if(nAccessor){
                        nAccessor.bindBuffer();
                        nAccessor.bufferData();
                        nAccessor.link('a_normal');
                    }
                    //3.skin joints
                    const jAccessor = primitive.attributes['JOINTS_0'];
                    if(jAccessor){
                        jAccessor.bindBuffer();
                        jAccessor.bufferData();
                        jAccessor.link('a_joints_0');
                    }
                    //4.skin weights
                    const wAccessor = primitive.attributes['WEIGHTS_0'];
                    if(wAccessor){
                        wAccessor.bindBuffer();
                        wAccessor.bufferData();
                        wAccessor.link('a_weights_0');
                    }
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
                        attributes:{
                            vAccessor,
                            nAccessor,
                            jAccessor,
                            wAccessor
                        },
                        uniforms:{
                            uProject,
                            uView,
                            uModel
                        },
                        indices:{
                            indicesBuffer,
                            indicesLength: primitive.indicesLength,
                            indicesComponentType:primitive.indicesComponentType
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
        //gl context
        const gl = this._gl,
            matrix = parentMatrix === null ? node.modelMatrix.clone() : parentMatrix.clone().multiply(node.modelMatrix);
        //draw mesh
        if (node.mesh !== null) {
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
                for(let key in attributes) attributes[key]?attributes.relink():null;
                //indices
                indices.indicesBuffer.bindBuffer();
                //uniform
                uniforms.uProject.assignValue(camera.ProjectionMatrix);
                uniforms.uView.assignValue(camera.ViewMatrix);
                uniforms.uModel.assignValue(matrix.value);
                //draw elements
                gl.drawElements(mode, indices.indicesLength, indices.indicesComponentType, 0);
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
     */
    _applySkin(skin, t) {
        const angle = Math.sin(t)*0.8;
        const node = skin.skeleton;
        const inverseTransformMat4 = node.modelMatrix.clone().invert();
        for (let i = 0; i < skin.joints.length; ++i) {
            const jointNode  = skin.joints[i];
            // if there is no matrix saved for this joint
            // rotate it
            //const m = origMatrix.xRotate(t);
            // decompose it back into position, rotation, scale
            // into the joint
            m4.decompose(m, joint.source.position, joint.source.rotation, joint.source.scale);
        }
    }
    /**
     * 
     * @param {Camera} camera 
     */
    render(camera, t) {
        const animId = this._animId,
            geoTransformMatrix = this._geoTransformMatrix,
            gProgram = this._gProgram,
            skins = this._skins,
            sceneNodes = this._scene === null ? [] : this._scene.nodes,
            animations = this._animations;
        if (!gProgram) return;
        //change program
        gProgram.useProgram();
        //apply skin, use 0 to test function
        if (skins[0])
            this._applySkin(skins[0], t);
        //apply animations, default runs animation 0
        if (animations[animId])
            this._applyAnimation(animations[animId], t);
        //draw nodes
        for (let i = 0, len = sceneNodes.length; i < len; i++)
            this._drawNode(sceneNodes[i], camera, geoTransformMatrix);
    }
}

module.exports = GLoader;