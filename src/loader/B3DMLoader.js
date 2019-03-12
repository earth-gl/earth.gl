const GLTFLoader = require('./GLTFLoader');
/**
 * load b3dm (3dtiles)
 * @class
 */
class B3DMLoader {
    /**
     * @param {String} url 
     * @param {Object} options 
     */
    constructor(url, options) {
        this.featureTable = null;
        this.batchTable = null;
        this.url = url;
        this.gltf = {};
    }
    /**
     * @typedef {import("./../scene/Global")} Global
     * @param {WebGLRenderingContext} gl 
     * @param {Global} global 
     */
    _init(gl, global) {
        this._initialRequest(gl, global);
    }
    /**
     * @typedef {import("./../scene/Global")} Global
     * @param {WebGLRenderingContext} gl 
     * @param {Global} global 
     */
    _initialRequest(gl, global) {
        const that = this,
            url = this.url;
        fetch(url, {
            responseType: 'arraybuffer'
        }).then(response => {
            return response.arrayBuffer()
        }).then(b3dm => {
            const components = that._readB3DM(b3dm);
            const rootUrl = url.substring(0, url.lastIndexOf('/'));
            const gltf = new GLTFLoader(rootUrl, components.khrbinary);
            gltf._init(gl, global);
        });
    }
    /**
     * @param {ArrayBuffer} b3dm 
     */
    _readB3DM(b3dm) {
        const view = new DataView(b3dm);
        const version = view.getUint32(4, true);
        if (version !== 1) throw new Error('Unsupported b3dm version : ' + version);
        const length = view.getUint32(8, true);
        if (length !== b3dm.byteLength) throw new Error('Length in b3dm header is inconsistent with b3dm\'s byte length.');
        let headerLength = 0;
        const versions = [20, 24, 28];
        for (let i = 0; i < versions.length; i++) {
            const magic = view.getUint32(versions[i], true);
            if (magic === 1179937895) {
                headerLength = versions[i];
                break;
            }
        }
        if (headerLength === 0) {
            throw new Error('Unsupported b3dm header length.');
        }
        let featJSONLength = 0,
            featBinLength = 0,
            batchJSONLength = 0,
            batchBinLength = 0;
        if (headerLength === 20) {
            // legacy version of b3dm data with 20 bytes header
            batchJSONLength = view.getUint32(12, true);
            batchBinLength = view.getUint32(16, true);
        } else if (headerLength === 24) {
            // legacy version of b3dm data with 24 bytes header
            batchJSONLength = view.getUint32(12, true);
            batchBinLength = view.getUint32(16, true);
            batchLength = view.getUint32(20, true);
        } else {
            //standard
            featJSONLength = view.getUint32(12, true);
            featBinLength = view.getUint32(16, true);
            batchJSONLength = view.getUint32(20, true);
            batchBinLength = view.getUint32(24, true);
        }

        const khrbinary = {
            buffer: b3dm,
            byteOffset: headerLength + featJSONLength + featBinLength + batchJSONLength + batchBinLength
        };

        return {
            khrbinary
        }
    }

    _readFeatureTable(b3dm, featJSONLength, featBinLength) {

    }

    _readBatchTable(b3dm, batchJSONLength, batchBinLength) {

    }
}

module.exports = B3DMLoader;