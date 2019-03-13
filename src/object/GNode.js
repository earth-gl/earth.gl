
const { Mat4, Quat, Vec3 } = require('kiwi.matrix');
/**
 * @class
 */
class GNode {
    /**
     * 
     * @param {String|Number} nodeID 
     * @param {Object} resources
     * @param {mesh[]} [resources.meshes]
     * @param {mesh[]} [resources.accessors]
     * @param {Object} options
     * 
     */
    constructor(nodeID, resources, options) {
        /**
         * @type {Object}
         */
        this.nodeJson = options;
        /**
         * @type {Number}
         */
        this.nodeID = nodeID;
        /**
         * @type {String}
         */
        this.name = options.name !== undefined ? options.name : null;
        /**
         * 
         */
        this.camera = options.camera !== undefined ? options.camera : null;
        /**
         * @type {Node[]}
         */
        this.children = options.children || [];  // init as id, then hook up to node object later
        /**
         * reference:https://github.com/KhronosGroup/glTF/issues/605
         * in gltf2.0 node only has one mesh
         */
        this.mesh = options.mesh !== undefined || options.meshes ? resources.meshes[options.mesh !==undefined? options.mesh:options.meshes[0]] : null;
        /**
         * init as id, then hook up to skin object later
         */
        this.skinIdx = options.skin !== undefined ? options.skin : null;
        /**
         * @type {GSkin}
         */
        this.skin = null;
        /**
         * 
         */
        this.weights = options.weights !== undefined ? options.weights : null;
        /**
         * 
         */
        this.extensions = options.extensions !== undefined ? options.extensions : null;
        /**
         * 
         */
        this.extras = options.extras !== undefined ? options.extras : null;
        /**
         * axis aligned bounding box, not need to apply node transform to aabb
         */
        this.aabb = null;
        /**
         * create a identity matrix to store the trans data
         */
        this.matrix = new Mat4().identity();
        /**
         * initial model matrix
         */
        this._initialMatrix();
    }
    /**
     * calcute matrix
     */
    _initialMatrix() {
        const options = this.nodeJson;
        if (options.matrix) {
            const matrix = options.matrix,
                modelMatrix = new Mat4().set(...matrix);
            this.rotation = modelMatrix.getRotation();
            this.translation = modelMatrix.getTranslation();
            this.scale = modelMatrix.getScaling();
        } else {
            const rotation = options.rotation || [0.0, 0.0, 0.0, 1.0],
                translation = options.translation || [ 0.0, 0.0, 0.0],
                scale = options.scale || [1.0, 1.0, 1.0];
            this.rotation = new Quat().set(...rotation),
            this.translation = new Vec3().set(...translation),
            this.scale = new Vec3().set(...scale);
        }
        //update model matrix
        this.updateModelMatrix();
    }
    /**
     * 
     * @param {*} rotation 
     * @param {*} translation 
     * @param {*} scale 
     */
    updateModelMatrix(){
        const rotation = this.rotation,
            translation = this.translation,
            scale = this.scale;
        //from rotation and translation
        const modelMatrix = Mat4.fromRotationTranslation(rotation, translation);
        modelMatrix.scale(scale);
        //create rotation and translation
        this.modelMatrix = modelMatrix;
    }
}

module.exports = GNode;