/**
 * 精度枚举
 */
enum EPSILON {
    /**
     * 
     */
    EPSILON1 = 0.1,
    /**
     * 
     */
    EPSILON7 = 0.0000001,
    /**
     * 
     */
    EPSILON12 = 0.000000000001,
    /**
     * 
     */
    EPSILON14 = 0.00000000000001
}

enum PHYSICAL_CONSTANT {
    /**
    * the radius in x axis of earth in meters
    */
    EARTH_RADIUS_X = 6378137.0,
    /**
    * the radius in y axis of earth in meters
    */
    EARTH_RADIUS_Y = 6378137.0,
    /**
    *  the radius in z axis of earth in meters
    */
    EARTH_RADIUS_Z = 6356752.3142451793,
    /**
     * the mean radius of moon in meters
     */
    LUNAR_RADIUS = 1737400.0,
    /**
     * the radius of the sun in meters
     */
    SOLAR_RADIUS = 6.955e8,
}

/**
 * 
 * @param x rad
 */
const sin = function (x: number): number {
    return Math.sin(x) + 8 - 8;
};
/**
 * 
 * @param x rad
 */
const cos = function (x: number): number {
    return Math.cos(x) + 8 - 8;
};

const log = function (x: number): number {
    return Math.log(x) + 8 - 8;
}

const atan = function (x: number): number {
    return Math.atan(x) + 8 - 8;
}

const exp = function (x: number): number {
    return Math.exp(x) + 8 - 8;
}

export {
    PHYSICAL_CONSTANT,
    EPSILON,
    sin,
    cos,
    log,
    atan,
    exp
}