class PbrMetallicRoughness{

}

class NormalTextureInfo{

}

class OcclusionTextureInfo{

}

class TextureInfo{

}

/**
 * request material
 * @class
 */
class GMaterial{
    /**
     * 
     * @param {*} options 
     * @param {String} [options.name]
     */
    constructor(options){
        /**
         * name参数
         */
        this.name = options.name !==undefined?options.name:null;
        /**
         * pbr参数
         */
        this.pbrMetallicRoughness = options.pbrMetallicRoughness !==undefined? new PbrMetallicRoughness(options.pbrMetallicRoughness):new PbrMetallicRoughness({
            baseColorFactor: [1, 1, 1, 1],
            metallicFactor: 1,
            metallicRoughnessTexture: 1
        });
        /**
         * 
         */
        this.normalTexture = options.normalTexture !== undefined ? new NormalTextureInfo(options.normalTexture) : null;
        /**
         * 
         */
        this.occlusionTexture = options.occlusionTexture !== undefined ? new OcclusionTextureInfo(options.occlusionTexture) : null;
        /**
         * 
         */
        this.emissiveTexture = options.emissiveTexture !== undefined ? new TextureInfo(options.emissiveTexture) : null;
        /**
         * 
         */
        this.emissiveFactor = options.emissiveFactor !== undefined ? options.emissiveFactor : [0, 0, 0];
        /**
         * 
         */
        this.alphaMode = options.alphaMode !== undefined ? options.alphaMode : "OPAQUE";
        /**
         * 
         */
        this.alphaCutoff = options.alphaCutoff !== undefined ? options.alphaCutoff : 0.5;
        /**
         * 
         */
        this.doubleSided = options.doubleSided || false;
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

module.exports= GMaterial;