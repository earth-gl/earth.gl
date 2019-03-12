
const readKHRBinary = require('../../utils/readKHRBinary'),
    requestImage = require('../../utils/requestImage');
/**
* @class
*/
class GLTFV1 {
    /**
     * 
     * @param {String} rootPath 
     * @param {Object} json 
     */
    constructor(rootPath, json) {
        /**
         * @type {String} root path of gltf file
         */
        this.rootPath = rootPath;
        /**
         * @type {Object} setting 
         */
        this.json = json;
        /**
         * @type {String} default Id of scene
         */
        this.defaultScene = json.scene !== undefined ? json.scene : 0;
        /**
         * @type {Object}
         */
        this.extensions = json.extensions !== undefined ? json.extensions : null;
        /**
         * @type {Object}
         */
        this.extras = json.extras !== undefined ? json.extras : null;
    }
    /**
     * process resource by uri
     * @returns {Promise[]}
     */
    _processUri() {
        const rootPath = this.rootPath,
            json = this.json;
        //request buffers
        const fetchArrayBufferPromises = [];
        if (json.buffers) {
            for (const bid in json.buffers) {
                const rawStr = json.buffers[bid].uri;
                if (isBase64(rawStr)) {
                    fetchArrayBufferPromises.push(this._fetchArrayBufferFormBase64(rawStr, bid));
                } else {
                    fetchArrayBufferPromises.push(this._fetchArrayBuffer(rootPath + rawStr, bid));
                }
            }
        }
        //request images
        const fetchImagePromises = [];
        if (json.images) {
            for (const iid in json.images) {
                fetchImagePromises.push(this._fetchImages(rootPath + json.images[iid].uri, iid));
            }
        }
        //return arraybuffer collection
        return fetchArrayBufferPromises;
    }
    /**
     * process glb
     */
    _processGlb(glb) {

    }
}

GLTFV1.fromJson = function (rootPath, json) {

}

GLTFV1.fromKHRBinary = function (rootPath, glb) {
    const { json, subglb } = readKHRBinary(glb.buffer, glb.byteOffset);
    const gltfv1 = new GLTFV1(rootPath, json);
    const promises = gltfv1._processGlb(subglb);
    return gltfv1;
}


module.exports = GLTFV1;