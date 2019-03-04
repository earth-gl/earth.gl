
/**
 * @class
 */
class GScene{

    /**
     * 
     * @param {*} resource 
     * @param {*} resource.nodes
     * @param {*} options 
     */
    constructor(resource, options){
        /**
         * @type {String}
         */
        this.name = options.name !== undefined ? options.name : null;
        /**
         * @type {GNode[]}
         */
        this.nodes = [];
        /**
         * 
         */
        this.extensions = options.extensions !== undefined ? options.extensions : null;
        /**
         * 
         */
        this.extras = options.extras !== undefined ? options.extras : null;
        /**
         * 
         */
        this.boundingBox = null;
        /**
         * process nodes
         */
        this._processNodes(resource, options);
    }
    /**
     * 
     * @param {*} resource 
     * @param {*} options 
     */
    _processNodes(resource, options){
        const nodes = options.nodes;
        for (var i = 0, len = nodes.length; i < len; i++) {
            this.nodes[i] = resource.nodes[nodes[i]];
        }
    }
}

module.exports = GScene;