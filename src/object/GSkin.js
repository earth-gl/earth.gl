
/**
 * @class
 */
class GSkin {

    /**
     * 
     * @param {*} resource 
     * @param {[]} resource.nodes
     * @param {[]} resource.accessors
     * @param {*} options 
     * @param {*} skinID 
     */
    constructor(resource, options, skinID) {
        /**
         * @type {String|Number}
         */
        this.name = options.name !== undefined ? options.name : null;
        /**
         * @type {Number}
         */
        this.skinID = skinID;
        /**
         * @type {[]}
         */
        this.joints = options.joints;
        /**
         * @type {GNode}
         */
        this.skeleton = options.skeleton !== undefined ? resource.nodes[options.skeleton] : null;
        /**
         * 
         */
        this.inverseBindMatrices = options.inverseBindMatrices !== undefined ? resource.accessors[options.inverseBindMatrices] : null;
        /**
         * 
         */
        this.jointMatrices = [];
        /**
         * @type {GTexture}
         */
        this.jointTexture = null;
        /**
         * 
         */
        this.extensions = options.extensions !== undefined ? options.extensions : null;
        /**
         * 
         */
        this.extras = options.extras !== undefined ? options.extras : null;
    }
}

module.exports = GSkin;