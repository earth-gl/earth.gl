/**
 * @class
 */
class GTarget{
    /**
     * 
     * @param {Object} options 
     */
    constructor(options){
        this.nodeID = options.node !== undefined ? options.node : null ;  //id, to be hooked up to object later
        this.path = options.path;     //required, string
        this.extensions = options.extensions !== undefined ? options.extensions : null;
        this.extras = options.extras !== undefined ? options.extras : null;
    }
}

module.exports = GTarget;