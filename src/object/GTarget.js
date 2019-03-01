/**
 * @class
 */
class GTarget{
    /**
     * 
     * @param {Object} options 
     * @param {string} options.nodeID
     * @param {string} options.path
     * @param {string} [options.extensions]
     * @param {string} [options.extras]
     */
    constructor(options){
        /**
         * @type {String|Number}
         */
        this.nodeID = options.node !== undefined ? options.node : null ;  //id, to be hooked up to object later
        /**
         * @type {String}
         */
        this.path = options.path;     //required, string
        /**
         * @type {string}
         */
        this.extensions = options.extensions !== undefined ? options.extensions : null;
        /**
         * @type {string}
         */
        this.extras = options.extras !== undefined ? options.extras : null;
    }
}

module.exports = GTarget;