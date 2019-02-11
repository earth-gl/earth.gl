const fetch = require('./../utils/fetch'),
    { GLMatrix, Vec3 } = require('kiwi.matrix'),
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
            loader.load(program).then(GLTF => {
                //prerocess scene nodes
                that._initComponents(GLTF.scene);
                //store scene
                that._scene = GLTF.scene;
                //store animations
                that._animations = GLTF.animations || [];
            });
        });
    }
    /**
     * 
     */
    _initComponents(scene) {
        const nodes = [], //cache all nodes
            //vertical = this._vertical,
            lat = this._lat,
            lng = this._lng,
            h = this._h,
            geographic = new Geographic(GLMatrix.toRadian(lng), GLMatrix.toRadian(lat), h), //convert degree to radian
            spaceV3 = WGS84.geographicToSpace(geographic),
            sceneNodes = scene.nodes,
            //nodesCache = this._nodesCache,
            gProgram = this._gProgram;
        //change program
        gProgram.useProgram();
        //liter node
        const processNode = (node) => {
            //cache node
            nodes.push(node);
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
            if (node.children.forEach(node => {
                processNode(node);
            }));
        };
        //prepare nodes
        sceneNodes.forEach((node) => {
            node.translation = new Vec3().set(...node.translation.clone().add(spaceV3)._out);
            processNode(node);
            // if(node.mesh){
            //     const mesh = node.mesh;
            //     mesh.primitives.forEach(primitive => {
            //         //1.bind vertex buffer
            //         const posAccessor = primitive.attributes['POSITION'];
            //         posAccessor.bindBuffer();
            //         posAccessor.bufferData();
            //         posAccessor.link('a_position');
            //         //2.bind index buffer
            //         const indicesBuffer = primitive.indicesBuffer;
            //         indicesBuffer.bindBuffer();
            //         indicesBuffer.bufferData();
            //         //3.uniform
            //         const uProject = new GUniform(gProgram, 'u_projectionMatrix'),
            //             uView = new GUniform(gProgram, 'u_viewMatrix'),
            //             uModel = new GUniform(gProgram, 'u_modelMatrix');
            //         //4.cache mesh
            //         primitive.cache = {
            //             uProject: uProject,
            //             uView: uView,
            //             uModel: uModel,
            //             accessor: posAccessor,
            //             indicesBuffer: indicesBuffer,
            //             mode: primitive.mode,
            //             indicesLength: primitive.indicesLength,
            //             indicesComponentType: primitive.indicesComponentType,
            //             indicesOffset: primitive.indicesOffset
            //         };
            //const translation = spaceV3.clone().add(node.modelMatrix.getTranslation());
            //let modelMatrix = node.modelMatrix.clone().setTranslation(translation);
            //rotate to surface vertical
            // if (vertical) {
            //     //按照经度旋转
            //     modelMatrix = modelMatrix.clone().rotateZ(GLMatrix.toRadian(lng - 90));
            //     //rotate model matrix
            //     modelMatrix = modelMatrix.clone().rotateX(GLMatrix.toRadian(lat));
            // }
            // primitivesCache.push({
            //     uProject: uProject,
            //     uView: uView,
            //     uModel: uModel,
            //     accessor: posAccessor,
            //     indicesBuffer: indicesBuffer,
            //     mode: primitive.mode,
            //     indicesLength: primitive.indicesLength,
            //     indicesComponentType: primitive.indicesComponentType,
            //     indicesOffset: primitive.indicesOffset
            // });
            //     });
            // }
        });
        /**
         * process nodes
         */
        this._nodes = nodes;
    }
    _drawNode(node, camera, parentMatrix) {
        //gl context
        const that = this,
            gl = this._gl;
        //update model matrix
        node.updateModelMatrix();
        let matrix = parentMatrix === null ? node.modelMatrix.clone() : parentMatrix.clone().multiply(node.modelMatrix);
        if (node.mesh !== null) {
            const primitives = node.mesh.primitives;
            primitives.forEach(primitive => {
                const primitiveCache = primitive.cache;
                const { vAccessor,
                    indicesBuffer,
                    mode,
                    indicesLength,
                    indicesComponentType,
                    uProject,
                    uView,
                    uModel } = primitiveCache;
                //relink
                vAccessor.relink();
                indicesBuffer.bindBuffer();
                //uniform
                uProject.assignValue(camera.ProjectionMatrix);
                uView.assignValue(camera.ViewMatrix);
                uModel.assignValue(matrix.value);
                //draw elements
                gl.drawElements(mode, indicesLength, indicesComponentType, 0);
            });
        }
        //draw nodes
        node.children.forEach(node => {
            that._drawNode(node, camera, matrix);
        });
    }
    /**
     * 
     * @param {Camera} camera 
     */
    render(camera, timeStamp) {
        const that = this,
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
                        //node.rotation = new Quat().set(...animationSampler._curValue._out);
                        break;
                    case 'translation':
                        //node.translation = new Vec3().set(...animationSampler._curValue.clone().add(spaceV3)._out);
                        break;
                    case 'scale':
                        //node.scale = new Vec3().set(...animationSampler._curValue._out);
                        break;
                    default:
                        break;
                }
            }
        }
        // if (sceneNodes.length > 0) {
        //     that._drawNode(sceneNodes[0], camera, null);
        // }
        //darw scene nodes
        sceneNodes.forEach(node => {
            that._drawNode(node, camera, null);
        });
        //darw nodes
        // for (let key in nodesCache) {
        //     const nodeCache = nodesCache[key],
        //         node = nodeCache.node,
        //         primitivesCache = nodeCache.primitivesCache;
        //     for (let i = 0, len = primitivesCache.length; i < len; i++) {
        //         const primitiveCache = primitivesCache[i];
        //         const { accessor,
        //             indicesBuffer,
        //             mode,
        //             indicesLength,
        //             indicesComponentType,
        //             indicesOffset,
        //             uProject,
        //             uView,
        //             uModel } = primitiveCache;
        //         //update model matrix
        //         node.updateModelMatrix();
        //         //relink
        //         accessor.relink();
        //         indicesBuffer.bindBuffer();
        //         uProject.assignValue(camera.ProjectionMatrix);
        //         uView.assignValue(camera.ViewMatrix);
        //         uModel.assignValue(node.modelMatrix.value);
        //         //draw elements
        //         gl.drawElements(mode, indicesLength, indicesComponentType, indicesOffset);
        //     }
        // }
        // for (let i = 0, len = nodesCache.length; i < len; i++) {
        //     const nodeCache = nodesCache[i];
        //     const { accessor,
        //         indicesBuffer,
        //         mode,
        //         indicesLength,
        //         indicesComponentType,
        //         indicesOffset,
        //         uProject,
        //         uView,
        //         modelMatrix,
        //         uModel } = nodeCache;
        //     //
        //     node
        //     //relink
        //     accessor.relink();
        //     indicesBuffer.bindBuffer();
        //     uProject.assignValue(camera.ProjectionMatrix);
        //     uView.assignValue(camera.ViewMatrix);
        //     uModel.assignValue(modelMatrix);
        //     //draw elements
        //     gl.drawElements(mode, indicesLength, indicesComponentType, indicesOffset);
        // }
    }
}

module.exports = GLoader;