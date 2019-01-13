const Rectangle = require("./Rectangle"),
    MAX_RECTANGLE = require("./Rectangle").MAX_VALUE,
    terrainTileSchema = require("./QuadtreeTileSchema").CESIUM_TERRAIN;
/**
 * 瓦片，记录瓦片的rectangle等信息
 */
class QuadtreeTile {

    /**
     * @param {Number} options.x
     * @param {Number} options.y
     * @param {Number} options.level
     * @param {Number} [options.url]
     * @param {QuadtreeTile} [options.parent]
     */
    constructor(options) {
        /**
         * set default
         * @typedef {import("./QuadtreeTileSchema")} QuadtreeTileSchema
         * @type {QuadtreeTileSchema}
         */
        this._quadtreeTileSchema = terrainTileSchema;
        /**
         * @type {Number}
         */
        this._x = options.x;
        /**
         * @type {Number}
         */
        this._y = options.y;
        /**
         * @type {Number}
         */
        this._level = options.level;
        /**
         * @type {QuadtreeTile}
         */
        this._parent = options.parent;
        /**
         * @type {Rectangle}
         */
        this._boundary = this._calcuteBoundary(this._x, this._y, this._level);
    }
    /**
     * @type {Rectangle}
     */
    get boundary(){
        return this._boundary;
    }
    /**
     * 
     * @param {*} x 
     * @param {*} y 
     * @param {*} level 
     * @returns {Rectangle}
     */
    _calcuteBoundary(x, y, level) {
        const rectangle = MAX_RECTANGLE,
            tileSchema = this._quadtreeTileSchema,
            xTiles = tileSchema.getNumberOfXTilesAtLevel(level),
            yTiles = tileSchema.getNumberOfYTilesAtLevel(level),
            xTileWidth = rectangle.width / xTiles,
            yTileHeight = rectangle.height / yTiles,
            west = x * xTileWidth + rectangle.west,
            east = (x + 1) * xTileWidth + rectangle.west,
            north = rectangle.north - y * yTileHeight,
            south = rectangle.north - (y + 1) * yTileHeight;
        return new Rectangle(west, south, east, north);
    }
}

module.exports = QuadtreeTile;