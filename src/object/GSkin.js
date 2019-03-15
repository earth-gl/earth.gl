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
     */
    constructor(resource, options) {
        /**
         * @type {String|Number}
         */
        this.name = options.name !== undefined ? options.name : null;
        /**
         * @type {[]}
         */
        this.joints = (options.joints || []).map(ndx => resource.nodes[ndx]);
        /**
         * @type {Float32Array}
         */
        this.jointMatrixData = new Float32Array(this.joints.length * 16);
        /**
         * @type {GTexture}
         */
        this.jointTexture = null;
        /**
         * @type {Mat4[]}
         */
        this.inverseBindMatrix = [];
        /**
         * @type {Float32Array} rawdatas of matrix
         */
        this.inverseBindMatricesData = options.inverseBindMatrices !== undefined ? resource.accessors[options.inverseBindMatrices].typedArrayBuffer : null;
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
        const joints = this.joints,
            inverseBindMatrix = this.inverseBindMatrix,
            inverseBindMatricesData = this.inverseBindMatricesData;
        for (let i = 0; i < joints.length; i++) {
            const start = i * 16;
            inverseBindMatrix.push(new Mat4().set(...inverseBindMatricesData.slice(start, start + 16)));
        }
    }
    /**
     * update the joint matrix
     */
    _processJonitMatrix(inverseTransformMat4) {
        //create views for each joint and inverseBindMatrix
        const joints = this.joints,
            inverseBindMatrix = this.inverseBindMatrix,
            jointMatrixData = this.jointMatrixData;
        //update joint matrix
        //const inverseTransformMat4 = this.skeleton.modelMatrix.clone().invert();
        //go through each jonit and get its current modelmatrix
        //apply the inverse bind matrices and store the entire result in the texture
        //update jonit matrix 
        for (let i = 0; i < joints.length; i++) {
            const jointNode = joints[i];
            let jmatrix = jointNode.matrix.clone().multiply(inverseBindMatrix[i]);
            jmatrix = inverseTransformMat4.clone().multiply(jmatrix);
            jointMatrixData.set(jmatrix.value,i*16);
        }
    }
}

module.exports = GSkin;