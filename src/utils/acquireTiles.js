/**
 * https://github.com/AnalyticalGraphicsInc/cesium/blob/22dce1d9aaf480b0cbea6148b05a4c482ce80f00/Source/Core/GeographicTilingScheme.js
 * https://github.com/AnalyticalGraphicsInc/cesium/blob/22dce1d9aaf480b0cbea6148b05a4c482ce80f00/Source/Core/WebMercatorTilingScheme.js
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
    numberOfLevelZeroTilesY = 1;

const getNumberOfXTilesAtLevel = function (level) {
    return numberOfLevelZeroTilesX << level;
}

const getNumberOfYTilesAtLevel = function (level) {
    return numberOfLevelZeroTilesY << level;
}

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
}


