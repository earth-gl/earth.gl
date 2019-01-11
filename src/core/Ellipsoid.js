const { Vec3 } = require("kiwi.matrix"),
    { PHYSICAL_CONSTANT } = require("./../utils/constant");
/**
 * @class
 */
class Ellipsoid {
    /**
     * 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} z 
     */
    constructor(x, y, z) {
        /**
         * @type {Number}
         */
        this.x = x;
        /**
         * @type {Number}
         */
        this.y = y;
        /**
         * @type {Number}
         */
        this.z = z;
        /**
         * @type {Vec3}
         */
        this._radii = new Vec3().set(x, y, z);
        /**
         * 
         */
        this._oneOverRadii = new Vec3().set(1 / x, 1 / y, 1 / z);
    }
    /**
     * @type {Vec3}
     */
    get radii() {
        return this._radii;
    }
    /**
     * @type {Vec3}
     */
    get oneOverRadii() {
        return this._oneOverRadii;
    }
    /**
     * @type {Number}
     */
    get maximumRadius() {
        return Math.max(this.x, this.y, this.z);
    }
}

/**
 * @type {Ellipsoid}
 */
Ellipsoid.WGS84 = new Ellipsoid(PHYSICAL_CONSTANT.EARTH_RADIUS_X, PHYSICAL_CONSTANT.EARTH_RADIUS_Y, PHYSICAL_CONSTANT.EARTH_RADIUS_Z);

module.exports = Ellipsoid;