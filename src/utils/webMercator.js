/**
 * reference
 * https://github.com/maptalks/maptalks.js/blob/master/src/geo/projection/Projection.EPSG3857.js
 */

const { PHYSICAL_CONSTANT } = require("./constant"),
    semimajorAxis = Math.max(PHYSICAL_CONSTANT.EARTH_RADIUS_X, PHYSICAL_CONSTANT.EARTH_RADIUS_Y, PHYSICAL_CONSTANT.EARTH_RADIUS_Z),
    rad = Math.PI / 180,
    metersPerDegree = semimajorAxis * rad,
    maxLatitude = 85.0511287798;

const project = function (lat, lng) {
    lat = Math.max(Math.min(maxLatitude, lat), - maxLatitude);
    let c;
    if (lat === 0)
        c = 0;
    else
        c = Math.log(Math.tan((90 + lat) * rad / 2)) / rad;
    return { x: lng * metersPerDegree, y: c * metersPerDegree, };
}

const unproject = function (x, y) {
    rad = this.rad,
        metersPerDegree = this.metersPerDegree;
    let c;
    if (y === 0) {
        c = 0;
    } else {
        c = y / metersPerDegree;
        c = (2 * Math.atan(Math.exp(c * rad)) - Math.PI / 2) / rad;
    }
    return { lng: x / metersPerDegree, lat: c }
}

module.exports = {
    project,
    unproject
}