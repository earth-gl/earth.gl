const GPrimitive = require('./GPrimitive');
/**
 * 
 */
class GMesh{
    /**
     * 
     * @param {String|Number} meshID 
     * @param {Object} resource
     * @param {Object} [resource.accessors]
     * @param {Object} [resource.materials]
     * @param {Object} options 
     */
    constructor(resource, options){
        /**
         * @type {String}
         */
        this.name = options.name !== undefined ? options.name : null;
        /**
         * 
         */
        this.resource = resource;
        /**
         * @type {GPrimitives[]}
         */
        this.primitives = [];   // required
        /**
         * 
         */
        this.boundingBox = null;
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
         * process primitives
         */
        this._processPrimitives(options.primitives);
    }
    /**
     * 
     */
    _processPrimitives(primitives){
        const resource = this.resource;
        for (var i = 0, len = primitives.length; i < len; ++i) {
            const primitiveJson = primitives[i];
            const primitive = new GPrimitive(resource, primitiveJson);
            this.primitives.push(primitive);
        }
    }
}

module.exports = GMesh;