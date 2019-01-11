/**
 * https://github.com/AnalyticalGraphicsInc/cesium/blob/22dce1d9aaf480b0cbea6148b05a4c482ce80f00/Source/Core/GeographicTilingScheme.js
 * https://github.com/AnalyticalGraphicsInc/cesium/blob/22dce1d9aaf480b0cbea6148b05a4c482ce80f00/Source/Core/WebMercatorTilingScheme.js
 * https://github.com/AnalyticalGraphicsInc/cesium/blob/c36e4d37f9a55993781922887d6acd2ed7f7b54c/Source/Scene/SceneTransforms.js#L71
 * https://blog.csdn.net/popy007/article/details/1797121
 * 
 * https://stackoverflow.com/questions/33237064/get-current-zoom-in-cesium
 * https://gis.stackexchange.com/questions/129903/cesium-3d-determining-the-map-scale-of-the-viewed-globe/144496#144496
 * 
 * computeViewRectangle ：
 * https://github.com/AnalyticalGraphicsInc/cesium/blob/15d5cdeb3331d84b896821b04eefd5ba199994c6/Source/Scene/Camera.js#L3122
 * 
 * 流程：
 * 1. Ray picking
 *  计算相机位置到lookat中心的射线与wgs84椭球，first insert position location,得到视野中心点 position (x,y,z) 
 * 
 * 2. 计算新的near下，视野内可视域边界信息，基于 https://blog.csdn.net/popy007/article/details/1797121
 * 
 * 3. 通过bounding信息，计算瓦片信息，请求对应的瓦片进行加载
 */

const Vec2 = require("kiwi.matrix").Vec2;

const { PHYSICAL_CONSTANT } = require("./constant"),
    createRectangle = require("./createRectangle"),
    { project, unproject } = require("./webMercator"),
    semimajorAxis = Math.max(PHYSICAL_CONSTANT.EARTH_RADIUS_X, PHYSICAL_CONSTANT.EARTH_RADIUS_Y, PHYSICAL_CONSTANT.EARTH_RADIUS_Z),
    rad = Math.PI / 180,
    metersPerDegree = semimajorAxis * rad,
    maxLatitude = 85.0511287798,
    semimajorAxisTimesPi = semimajorAxis * Math.PI,
    rectangleSouthwestInMeters = new Vec2().set(-semimajorAxisTimesPi, -semimajorAxisTimesPi),
    rectangleNortheastInMeters = new Vec2().set(semimajorAxisTimesPi, semimajorAxisTimesPi),
    southwest = unproject(rectangleSouthwestInMeters.x, rectangleSouthwestInMeters.y),
    northeast = unproject(rectangleNortheastInMeters.x, rectangleNortheastInMeters.y),
    rectangle = createRectangle(southwest.lng, southwest.lat, northeast.lng, northeast.lat),
    numberOfLevelZeroTilesX = 1,
    numberOfLevelZeroTilesY = 1,
    ellipsoid = require("./../core/Ellipsoid").WGS84;

const getNumberOfXTilesAtLevel = function (level) {
    return numberOfLevelZeroTilesX << level;
};

const getNumberOfYTilesAtLevel = function (level) {
    return numberOfLevelZeroTilesY << level;
};

/**
 * Transforms a rectangle specified in geodetic radians to the native coordinate system of this tiling scheme.
 * @param {Rectangle} rectangle 
 */
const rectangleToNativeRectangle = function (rectangle) {
    const southwest = rectangle.southwest,
        northeast = rectangle.northeast,
        nativeSouthwest = project(southwest.latitude, southwest.longitude),
        nativeNortheast = project(northeast.latitude, northeast.longitude);
    return createRectangle(nativeSouthwest.x, nativeSouthwest.y, nativeNortheast.x, nativeNortheast.y)
};

/**
 * 
 * @param {Vec3} position 
 * @param {Vec3} direction 
 * @param {Vec3} up 
 */
const computeCullingVolume  = function(position,direction,up){
    var t = this.top;
    var b = this.bottom;
    var r = this.right;
    var l = this.left;
    var n = 1.0;
    var f =  500000000.0;
}

/**
 * @typedef {import ("./../core/Ellipsoid")} Ellipsoid
 * @param {Ellipsoid} ellipsoid 
 */
const computeViewRectangle  = function(){
    
};
