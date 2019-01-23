/**
 * 
 */
class GSampler{

    constructor(options){
        this.name = options.name !== undefined ? options.name : null;
        this.magFilter = options.magFilter !== undefined ? options.magFilter : null;
        this.minFilter = options.minFilter !== undefined ? options.minFilter : null;
        this.wrapS = options.wrapS !== undefined ? options.wrapS : 10497;
        this.wrapT = options.wrapT !== undefined ? options.wrapT : 10497;
        this.extensions = options.extensions !== undefined ? options.extensions : null;
        this.extras = options.extras !== undefined ? options.extras : null;
        this.sampler = null;
    }

    apply(){

    }

}

module.exports = GSampler;