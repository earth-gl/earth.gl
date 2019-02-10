const { Vec2, Vec3 } = require('kiwi.matrix'),
    merge = require('./../utils/merge'),
    Rectangle = require('./Rectangle'),
    WGS84 = require('./Ellipsoid').WGS84,
    WebMercatorProjection = require('./Projection').WebMercatorProjection;
/**
 * https://github.com/AnalyticalGraphicsInc/cesium/blob/f87fbadb79d8410deeb5c3f66228c235344a44f2/Source/Core/WebMercatorTilingScheme.js#L42
 * @class
 */
class QuadtreeTileSchema {
    /**
     * 
     * @param {*} options 
     * @param {Number} xNUmber
     * @param {Number} yNumber
     * @param {GProjection} projection
     * @param {Ellipsoid} ellipsoid
     */
    constructor(options) {
        /**
         * 
         */
        options = merge({}, options);
        /**
         * @type {String}
         */
        this._url = options.url || null;
        /**
         * x direction tiles number at level 0
         */
        this._numberOfLevelZeroTilesX = options.xNUmber || 1;
        /**
         * y direction tiles number at level 0
         */
        this._numberOfLevelZeroTilesY = options.yNumber || 1;
        /**
         * projection
         */
        this._projection = options.projection;
        /**
         * 
         */
        this._ellipsoid = options.ellipsoid || WGS84;
        /**
         * 
         */
        const semimajorAxisTimesPi = this._ellipsoid.maximumRadius * Math.PI;
        /**
         * 
         */
        this._rectangleSouthwestInMeters = new Vec2().set(-semimajorAxisTimesPi, -semimajorAxisTimesPi);
        /**
         * 
         */
        this._rectangleNortheastInMeters = new Vec2().set(semimajorAxisTimesPi, semimajorAxisTimesPi);
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
    /**
     * 将瓦片x,y,level编号计算成投影后的坐标范围, 
     * represent tile boundary in meters
     */
    tileXYToNativeRectangle(x, y, level) {
        var xTiles = this.getNumberOfXTilesAtLevel(level);
        var yTiles = this.getNumberOfYTilesAtLevel(level);
        var xTileWidth = (this._rectangleNortheastInMeters.x - this._rectangleSouthwestInMeters.x) / xTiles;
        var west = this._rectangleSouthwestInMeters.x + x * xTileWidth;
        var east = this._rectangleSouthwestInMeters.x + (x + 1) * xTileWidth;
        var yTileHeight = (this._rectangleNortheastInMeters.y - this._rectangleSouthwestInMeters.y) / yTiles;
        var north = this._rectangleNortheastInMeters.y - y * yTileHeight;
        var south = this._rectangleNortheastInMeters.y - (y + 1) * yTileHeight;
        return new Rectangle(west, south, east, north);
    }
    /**
     * 将瓦片x,y,level编号计算成大地坐标
     * represent tile boundary in radians
     * @param {*} x 
     * @param {*} y 
     * @param {*} level 
     */
    tileXYToRectangle(x, y, level) {
        var nativeRectangle = this.tileXYToNativeRectangle(x, y, level);
        var projection = this._projection;
        var southwest = projection.unproject(new Vec3().set(nativeRectangle.west, nativeRectangle.south, 0));
        var northeast = projection.unproject(new Vec3().set(nativeRectangle.east, nativeRectangle.north, 0));
        return new Rectangle(southwest.longitude, southwest.latitude, northeast.longitude, northeast.latitude);
    }
}

/** 
 * @type {QuadtreeTileSchema}
*/
QuadtreeTileSchema.WEB_MERCATOR_TILING_SCHEME = new QuadtreeTileSchema({
    xNUmber: 1,
    yNumber: 1,
    projection: WebMercatorProjection
});

module.exports = QuadtreeTileSchema;