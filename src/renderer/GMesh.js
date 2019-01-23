const GPrimitive = require("./GPrimitive");
/**
 * 
 */
class GMesh{
    /**
     * 
     * @param {String|Number} meshID 
     * @param {Object} options 
     */
    constructor(meshID, options, resource){
        /**
         * @type {Number}
         */
        this.meshID = meshID;
        /**
         * @type {String}
         */
        this.name = options.name !== undefined ? options.name : null;
        /**
         * 
         */
        this.gltf = resource;
        /**
         * @type {GPrimitives[]}
         */
        this.primitives = [];   // required
        /**
         * 
         */
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
         * initial promitives
         */
        this._initial(options.primitives);
    }
    /**
     * 
     */
    _initial(primitives){
        const gltf = this.gltf;
        for (var i = 0, len = primitives.length; i < len; ++i) {
            const pJson = primitives[i];
            const primitive = new GPrimitive(gltf, pJson);
            this.primitives.push(primitive);
        }
    }
}

module.exports = GMesh;