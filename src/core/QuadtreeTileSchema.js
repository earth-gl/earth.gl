const merge = require("./../utils/merge");
/**
 * @class
 */
class QuadtreeTileSchema {
    /**
     * 
     * @param {*} options 
     */
    constructor(options) {
        /**
         * 
         */
        options = merge({},options);
        /**
         * @type {String}
         */
        this._url = options.url || null;
        /**
         * x direction tiles number at level 0
         */
        this._numberOfLevelZeroTilesX = options.xNUmber || 2;
        /**
         * y direction tiles number at level 0
         */
        this._numberOfLevelZeroTilesY = options.yNumber || 1;
    }
    /**
     * 
     * @param {*} level 
     */
    getNumberOfXTilesAtLevel(level) {
        return this._numberOfLevelZeroTilesX << level;
    }
    /**
     * 
     * @param {*} level 
     */
    getNumberOfYTilesAtLevel(level) {
        return this._numberOfLevelZeroTilesY << level;
    }
}

/** 
 * @type {QuadtreeTileSchema}
*/
QuadtreeTileSchema.CESIUM_TERRAIN = new QuadtreeTileSchema(); 

module.exports = QuadtreeTileSchema;