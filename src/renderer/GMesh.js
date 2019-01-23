/**
 * 
 */
class GMesh{
    /**
     * 
     * @param {String|Number} meshID 
     * @param {Object} options 
     */
    constructor(meshID, options){
        this.meshID = meshID;
        this.name = options.name !== undefined ? options.name : null;
        this.primitives = [];   // required
        // bounding box (runtime stuff)
        this.boundingBox = null;
        // var p, primitive;
        // for (var i = 0, len = options.primitives.length; i < len; ++i) {
        //     p = options.primitives[i];
        //     primitive = new Primitive(curLoader.glTF, p);
        //     this.primitives.push(primitive);
        //     // bounding box related
        //     if (primitive.boundingBox) {
        //         if (!this.boundingBox) {
        //             this.boundingBox = new BoundingBox();
        //         }
        //         this.boundingBox.updateBoundingBox(primitive.boundingBox);
        //     }
        // }
        // if (this.boundingBox) {
        //     this.boundingBox.calculateTransform();
        // }
        // TODO: weights for morph targets
        this.weights = options.weights !== undefined ? options.weights : null;
    
        this.extensions = options.extensions !== undefined ? options.extensions : null;
        this.extras = options.extras !== undefined ? options.extras : null;
    }

}

module.exports = GMesh;