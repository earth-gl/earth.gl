const { Mat4 } = require('kiwi.matrix');
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
        this.joints = (options.joints || []).map(ndx => resource.nodes[ndx]);
        /**
         * 
         */
        this.jointMatrices = [];
        /**
         * @type {Float32Array}
         */
        this.jointData = new Float32Array(this.joints.length * 16);
        /**
         * @type {GTexture}
         */
        this.jointTexture = null;
        /**
         * @type {Mat4[]}
         */
        this.inverseBindMatrices = [];
        /**
         * @type {Float32Array} rawdatas of matrix
         */
        this.inverseBindMatricesData = options.inverseBindMatrices !== undefined ? resource.accessors[options.inverseBindMatrices].typedArrayBuffer : null;
        /**
         * @type {typedArrayBuffer}
         */

        /**
         * 
         * @type {GNode}
         */
        this.skeleton = options.skeleton !== undefined ? resource.nodes[options.skeleton] : null;
        /**
         * 
         */
        this.extensions = options.extensions !== undefined ? options.extensions : null;
        /**
         * 
         */
        this.extras = options.extras !== undefined ? options.extras : null;
        /**
         * process inverse bindmatrix
         */
        this._processMatrix();
    }
    /**
     * 
     */
    _processMatrix() {
        //create views for each joint and inverseBindMatrix
        const inverseBindMatrices = this.inverseBindMatrices,
            inverseBindMatricesData = this.inverseBindMatricesData,
            jointData = this.jointData,
            jointMatrices = this.jointMatrices;
        for (let i = 0; i < this.joints.length; ++i) {
            const start = i * 16;
            inverseBindMatrices.push(new Mat4().set(...inverseBindMatricesData.slice(start, start + 16)));
            jointMatrices.push(new Mat4().set(...jointData.slice(start, start + 16)));
        }
    }
    /**
     * update skin matrix by timestamp
     * @param {Number} t 
     */
    updateSkeleton(t) {
        const joints = this.joints,
            jointMatrices = this.jointMatrices,
            skeleton = this.skeleton,
            modleMatrix = skeleton.modleMatrix,
            inverseBindMatrices = this.inverseBindMatrices,
            modleMatrixInverse = modleMatrix.clone().invert();
        //go through each jonit and get its current modelmatrix
        //apply the inverse bind matrices and store the entire result in the texture
        //update jonit matrix 
        for (let j = 0; j < joints.length; ++j) {
            const joint = joints[j];
            const dst = jointMatrices[j];
            const dist = modleMatrixInverse.clone().multiply(joint.modleMatrix);
            dist.multiply(inverseBindMatrices[j]);
        }
        //todo texture
    }

}

module.exports = GSkin;