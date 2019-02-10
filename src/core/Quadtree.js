const QuadtreeTile = require('./QuadtreeTile'),
    ellipsoid = require('./Ellipsoid').WGS84,
    maximumRadius = require('./Ellipsoid').WGS84.maximumRadius,
    Eventable = require('./Eventable'),
    quadtreeTileSchema = require('./QuadtreeTileSchema').WEB_MERCATOR_TILING_SCHEME;
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
        this._maximumScreenSpaceError = 2.0;
        /**
         * get maxiumu geometric error at level 0
         */
        this._geometricError = [];
        /**
         * @type {QuadtreeTile[]}
         */
        this._zeroLevelTiles = [];
        /**
         * current zoom level
         * @type {Number}
         */
        this._level = 0;
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
        for (var i = 0; i < 24; i++) geometricError[i] = this._computeMaximumGeometricError(i);
        //calcute tile and rectangle
        this._zeroLevelTiles = this._computeZeroLevelTiles();
    }
    /**
     * 
     */
    _registerEvents() {
        const gScene = this._gScene;
        gScene.on('zoomend loaded mouseup', this._updateQuadtreeTileByDistanceError, this);
    }
    /**
     * calctue tileset by distance error
     */
    _updateQuadtreeTileByDistanceError() {
        const that = this,
            camera = this._camera,
            maximumScreenSpaceError = this._maximumScreenSpaceError;
        //current Level
        let level = 0;
        //pick root tile
        const rootTiles = this.pickZeroLevelQuadtreeTiles(camera.position);
        //wait rendering
        const rawQuadtreeTiles = [];
        const renderingQuadtreeTiles = [];
        //liter func, to calcute new tile in distance error
        const liter = function (quadtreeTile) {
            const error = that._spaceError(quadtreeTile);
            if (error > maximumScreenSpaceError)
                for (let i = 0; i < 4; i++)
                    liter(quadtreeTile.children[i]);
            else {
                const litLevel = quadtreeTile.level;
                level = litLevel > level ? litLevel : level;
                rawQuadtreeTiles.push(quadtreeTile);
            }
        };
        //calcute from root tile
        for (let i = 0, len = rootTiles.length; i < len; i++) {
            const tile = rootTiles[i];
            liter(tile);
        }
        //filter level of tile
        for (let i = 0, len = rawQuadtreeTiles.length; i < len; i++) {
            const quadtreeTile = rawQuadtreeTiles[i];
            quadtreeTile.level === level ? renderingQuadtreeTiles.push(quadtreeTile) : null;
        }
        //set current level
        this._level = level;
        //
        this.fire('updatedTiles', { waitRendering: renderingQuadtreeTiles }, true);
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
                zeroLevelTiles[index++] = new QuadtreeTile({
                    x: x,
                    y: y,
                    level: 0,
                    quadtreeTileSchema: tileSchema
                });
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
            bounds = quadtreeTile.boundary.bounds;
        //2.投影点与目标tile的球面距离+相机距离球面距离 bug
        //2019/2/10 修正，改为与四角的距离取最大error
        let err = 0;
        for (let i = 0, len = bounds.length; i < len; i++) {
            const spacePostion = ellipsoid.geographicToSpace(bounds[i]);
            const distance = cameraSpacePosition.clone().sub(spacePostion).len();
            const error = (maxGeometricError * height) / (distance * sseDenominator);
            err = error > err ? error : err;
        }
        return err;
    }
}

module.exports = Quadtree;