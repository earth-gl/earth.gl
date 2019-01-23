
const {Mat4} = require("kiwi.matrix");
/**
 * @class
 */
class GNode {
    /**
     * 
     * @param {*} nodeID 
     * @param {*} options 
     * @param {Object} resources
     */
    constructor(nodeID, options, resources) {
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
         * @type {Mat4}
         */
        this.modelMatrix = new Mat4().identity();
        // if (options.hasOwnProperty('matrix')) {
        //     for (var i = 0; i < 16; ++i) {
        //         this.matrix[i] = options.matrix[i];
        //     }
        //     this.translation = vec3.create();
        //     mat4.getTranslation(this.translation, this.matrix);
        //     this.rotation = quat.create();
        //     mat4.getRotation(this.rotation, this.matrix);
        //     this.scale = vec3.create();
        //     mat4.getScaling(this.scale, this.matrix);
        // } else {
        //     // this.translation = null;
        //     // this.rotation = null;
        //     // this.scale = null;
        //     this.getTransformMatrixFromTRS(options.translation, options.rotation, options.scale);
        // }
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
        //if (options.extensions !== undefined) {
        //     if (options.extensions.gl_avatar !== undefined && curLoader.enableGLAvatar === true) {
        //         var linkedSkinID = curLoader.skeletonGltf.json.extensions.gl_avatar.skins[options.extensions.gl_avatar.skin.name];
        //         var linkedSkin = curLoader.skeletonGltf.skins[linkedSkinID];
        //         this.skin = new SkinLink(curLoader.glTF, linkedSkin, options.extensions.gl_avatar.skin.inverseBindMatrices);
        //     }
        // }
        // // TODO: morph targets weights
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
        // this.bvh = new BoundingBox();
    }

}

module.exports = GNode;