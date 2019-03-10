const GLTFLoader = require('./GLTFLoader');
/**
 * load b3dm (3dtiles)
 * @class
 */
class B3DMLoader {
    /**
     * @param {String} uri 
     * @param {Object} options 
     */
    constructor(uri, options) {
        this.featureTable = null;
        this.batchTable = null;
        this.gltf = {};
    }
    /**
     * @typedef {import("./../scene/Global")} Global
     * @param {WebGLRenderingContext} gl 
     * @param {Global} global 
     */
    _init(gl, global) {
        this._initialRequest();
    }
    /**
     * @param {String} uri 
     */
    _initialRequest(uri) {
        const that = this;
        fetch(uri, { 
            responseType: 'arraybuffer' 
        }).then(response => {
            return response.arrayBuffer()
        }).then(b3dm => {
            that._readB3DM(uri, b3dm);
        });
    }
    /**
     * @param {ArrayBuffer} b3dm 
     */
    _readB3DM(b3dm){
        const view = new DataView(b3dm);
        const version = view.getUint32(4, true);
        if(version!==1) throw new Error('Unsupported b3dm version : ' + version);
        const length = view.getUint32(8, true);
        if(length !== b3dm.byteLength) throw new Error('Length in b3dm header is inconsistent with b3dm\'s byte length.');
        let headerLength = 0;
        const versions = [20, 24, 28];
    }

}

module.exports = B3DMLoader;