
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
         * 
         */
        this.mesh = options.mesh !== undefined ? resources.meshes[options.mesh] : null;
        /**
         * init as id, then hook up to skin object later
         */
        this.skin = options.skin !== undefined ? options.skin : null;
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
         * initial model matrix
         */
        this._initialMatrix();
    }
    /**
     * calcute matrix
     */
    _initialMatrix() {
        const options = this.nodeJson;
        let modelMatrix;
        if (options.matrix) {
            const matrix = options.matrix;
            modelMatrix = new Mat4().set(
                matrix[0], matrix[1], matrix[2], matrix[3],
                matrix[4], matrix[5], matrix[6], matrix[7], matrix[8],
                matrix[9], matrix[10], matrix[11], matrix[12],
                matrix[13], matrix[14], matrix[15]
            );
        } else {
            const translation = options.translation || [ 0.0, 0.0, 0.0],
                rotation = options.rotation || [0.0, 0.0, 0.0, 0.0],
                scale = options.scale || [1000.0, 1000.0, 1000.0];
            const q = new Quat().set(rotation[0], rotation[1], rotation[2], rotation[3]),
                v = new Vec3().set(translation[0], translation[1], translation[2]),
                s = new Vec3().set(scale[0], scale[1], scale[2]);
            modelMatrix = Mat4.fromRotationTranslationScale(q, v, s);
        }
        /**
         * model matrix from rotation traslation and scale
         * @type {Mat4}
         */
        this.modelMatrix = modelMatrix;
    }
    /**
     * init skin
     */
    _initExtension(){
                //if (options.extensions !== undefined) {
        //     if (options.extensions.gl_avatar !== undefined && curLoader.enableGLAvatar === true) {
        //         var linkedSkinID = curLoader.skeletonGltf.json.extensions.gl_avatar.skins[options.extensions.gl_avatar.skin.name];
        //         var linkedSkin = curLoader.skeletonGltf.skins[linkedSkinID];
        //         this.skin = new SkinLink(curLoader.glTF, linkedSkin, options.extensions.gl_avatar.skin.inverseBindMatrices);
        //     }
        // }
        // // TODO: morph targets weights
    }
}

module.exports = GNode;