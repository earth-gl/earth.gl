/**
 * 定义webgl类型数组规范
 * https://github.com/AnalyticalGraphicsInc/cesium/blob/master/Source/Core/Math.js
 */
const PHYSICAL_CONSTANT = {
    /**
     * the radius in x axis of earth in meters
     */
    EARTH_RADIUS_X: 6378137.0,
    /**
    * the radius in y axis of earth in meters
    */
    EARTH_RADIUS_Y: 6378137.0,
    /**
    *  the radius in z axis of earth in meters
    */
    EARTH_RADIUS_Z: 6356752.3142451793,
    /**
     * the mean radius of moon in meters
     */
    LUNAR_RADIUS: 1737400.0,
    /**
     * the radius of the sun in meters
     */
    SOLAR_RADIUS: 6.955e8,
    /**
     * 2*pi
     */
    TWO_PI: 2.0 * Math.PI,
};

/**
 * This enumerated type is used in determining where, relative to the frustum, an
 * object is located. The object can either be fully contained within the frustum (INSIDE),
 * partially inside the frustum and partially outside (INTERSECTING), or somwhere entirely
 * outside of the frustum's 6 planes (OUTSIDE).
 *
 */
const INTERSECT_CONSTANT = {
    /**
     * Represents that an object is not contained within the frustum.
     */
    OUTSIDE: -1,
    /**
     * Represents that an object intersects one of the frustum's planes.
     */
    INTERSECTING: 0,
    /**
     * Represents that an object is fully within the frustum.
     */
    INSIDE: 1
};

module.exports = {
    PHYSICAL_CONSTANT,
    INTERSECT_CONSTANT
};