const QuadtreeTile = require("./QuadtreeTile"),
    ellipsoid = require("./Ellipsoid").WGS84,
    maximumRadius = require("./Ellipsoid").WGS84.maximumRadius,
    Eventable = require('./Eventable'),
    quadtreeTileSchema = require("./QuadtreeTileSchema").CESIUM_TERRAIN;
/**
 * 预建瓦片规则
 * @class
 * @fires 'updatedTiles'
 */
class Quadtree extends Eventable {
    /**
     * @typedef {import("./../camera/PerspectiveCamera")} PerspectiveCamera
     * @param {PerspectiveCamera} camera 
     * @param {GScene} gScene
     */
    constructor(camera, gScene) {
        super();
        /**
         * @typedef {import("./QuadtreeTileSchema")} QuadtreeTileSchema
         * @type {QuadtreeTileSchema}
         */
        this._tileSchema = quadtreeTileSchema;
        /**
         * @type {PerspectiveCamera}
         */
        this._camera = camera;
        /**
         * 
         */
        this._gScene = gScene;
        /**
         * if less then maximumScreenSpaceError, the tile should be load
         * @type {Number}
         */
        this._maximumScreenSpaceError = 2;
        /**
         * get maxiumu geometric error at level 0
         */
        this._geometricError = [];
        /**
         * @type {QuadtreeTile[]}
         */
        this._zeroLevelTiles = [];
        /**
         * @type {QuadtreeTile[]}
         */
        this._tileCaches=[];
        /**
         * register events
         */
        this._registerEvents();
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
    _registerEvents() {
        const gScene = this._gScene;
        gScene.on('mouseup', this._updateQuadtreeTileByDistanceError, this);
    }
    /**
     * calctue tileset by distance error
     */
    _updateQuadtreeTileByDistanceError() {
        const that = this;
            camera = this._camera,
            //compare with exist tiles, to achieve new tile
            tileCache = this._titleCache;
        //pick root tile
        const rootTiles = this.pickZeroLevelQuadtreeTiles(camera.position);
        //wait rendering
        const waitRenderingQuadtreeTile = [];
        //liter func, to calcute new tile in distance error
        const liter = function (quadtreeTile) {
            const error = that._spaceError(quadtreeTile);
            if (error > 2)
                for (var i = 0; i < 4; i++)
                    liter(quadtreeTile.children[i])
            else
                waitRenderingQuadtreeTile.push(quadtreeTile);
        }
        //calcute from root tile
        for (var i = 0, len = rootTiles.length; i < len; i++) {
            const tile = rootTiles[i];
            liter(tile);
        }
        //fire updated
        this.fire('updatedTiles', { waitRendering: waitRenderingQuadtreeTile }, true);
    }
    /**
     * 
     */
    _computeMaximumGeometricError(level) {
        const tileSchema = this._tileSchema,
            maximumGeometricError = maximumRadius * 2 * Math.PI * 0.25 / (65 * tileSchema.getNumberOfXTilesAtLevel(level));
        return maximumGeometricError;
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
                zeroLevelTiles[index++] = new QuadtreeTile({ x: x, y: y, level: 0 });
        return zeroLevelTiles;
    }
    /**
     * @type {Vec3}
     * @returns {QuadtreeTile[]} tiles
     */
    pickZeroLevelQuadtreeTiles(cameraSpacePosition) {
        //zero
        const zeroLevelTiles = this._zeroLevelTiles,
            pickedZeroLevelTiles = [];
        //1.转化camera 到椭球体
        const geographic = ellipsoid.spaceToGeographic(cameraSpacePosition);
        //2.计算tile rectangle与 geo coord 相交
        for (var i = 0, len = zeroLevelTiles.length; i < len; i++) {
            const quadtreeTile = zeroLevelTiles[i];
            //3.返回tile
            quadtreeTile.boundary.contain(geographic) ? pickedZeroLevelTiles.push(quadtreeTile) : null;
        }
        return pickedZeroLevelTiles;
    }
    /**
     * @typedef {import("./QuadtreeTile")} QuadtreeTile
     * @type {quadtreeTile} quadtreeTile
     */
    _spaceError(quadtreeTile) {
        //摄像机位置与瓦片中心的距离,距离由两部分构成
        //1.相机在椭球体上的投影点
        const level = quadtreeTile.level,
            camera = this._camera,
            maxGeometricError = this._geometricError[level],
            sseDenominator = camera.sseDenominator,
            height = camera.height,
            cameraSpacePosition = camera.position,
            center = quadtreeTile.boundary.center;
        //2.投影点与目标tile的球面距离+相机距离球面距离
        const spacePostion = ellipsoid.geographicToSpace(center);
        const distance = cameraSpacePosition.clone().sub(spacePostion).len();
        //3.计算error
        const error = (maxGeometricError * height) / (distance * sseDenominator);
        return error;
    }
}

module.exports = Quadtree;