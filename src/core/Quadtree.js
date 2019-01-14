const QuadtreeTile = require("./QuadtreeTile"),
    maximumRadius = require("./Ellipsoid").WGS84.maximumRadius,
    terrainTileSchema = require("./QuadtreeTileSchema").CESIUM_TERRAIN;
/**
 * 预建瓦片规则
 * @class
 */
class Quadtree {
    /**
     * @typedef {import("./../camera/PerspectiveCamera")} PerspectiveCamera
     * @param {PerspectiveCamera} camera 
     */
    constructor(camera) {
        /**
         * @typedef {import("./QuadtreeTileSchema")} QuadtreeTileSchema
         * @type {QuadtreeTileSchema}
         */
        this._tileSchema = terrainTileSchema;
        /**
         * @type {PerspectiveCamera}
         */
        this._camera = camera;
        /**
         * get maxiumu geometric error at level 0
         */
        this._geometricError = [];
        /**
         * @type {QuadtreeTile[]}
         */
        this._zeroLevelTiles = [];
        /**
         * initialize geometric errors at each level
         */
        this._initialize();
    }
    /**
     * 
     */
    _initialize() {
        //calcute geometric error
        const geometricError = this._geometricError;
        for (var i = 0; i < 18; i++) geometricError[i] = this._computeMaximumGeometricError(i);
        //calcute tile and rectangle
        this._zeroLevelTiles = this._computeZeroLevelTiles();
    }
    /**
     * 
     */
    _computeMaximumGeometricError(level) {
        const zeroMaximumGeometricError = maximumRadius * 2 * Math.PI * 0.25 / (65 * terrainTileSchema.getNumberOfXTilesAtLevel(level));
        return zeroMaximumGeometricError;
    }
    /**
     * 
     */
    _computeZeroLevelTiles() {
        const tileSchema = this._tileSchema,
            numberOfLevelZeroTilesX = tileSchema.getNumberOfXTilesAtLevel(0),
            numberOfLevelZeroTilesY = tileSchema.getNumberOfYTilesAtLevel(0),
            zeroLevelTiles = [];
        var index = 0;
        for (var y = 0; y < numberOfLevelZeroTilesY; ++y)
            for (var x = 0; x < numberOfLevelZeroTilesX; ++x)
                zeroLevelTiles[index] = new QuadtreeTile({ x: x, y: y, level: 0 });
        return zeroLevelTiles;
    }
    /**
     * 
     */
    contains(){
        
    }

    /**
     * @typedef {import("./QuadtreeTile")} QuadtreeTile
     * @type {QuadtreeTile} quadtreeTile
     */
    spaceError(quadtreeTile) {
        //摄像机位置与瓦片中心的距离
        const center = quadtreeTile.boundary.center;
        const distance = center.scale(maximumRadius);
    }
}

module.exports = Quadtree;