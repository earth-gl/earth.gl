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

module.exports = {
    PHYSICAL_CONSTANT: PHYSICAL_CONSTANT
}