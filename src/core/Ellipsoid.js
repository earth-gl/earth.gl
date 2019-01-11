const Vec3 = require("kiwi.matrix").Vec3,
    { PHYSICAL_CONSTANT } = require("./../utils/constant"),

/**
 * @author
 */
class Ellipsoid {

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
    }

    get radii() {
        return this._radii;
    }

    get maximumRadius() {
        return Math.max(this.x, this.y, this.z);
    }
}

/**
 * @type {Ellipsoid}
 */
Ellipsoid.WGS84 = new Ellipsoid(PHYSICAL_CONSTANT.EARTH_RADIUS_X, PHYSICAL_CONSTANT.EARTH_RADIUS_Y, PHYSICAL_CONSTANT.EARTH_RADIUS_Z);

module.exports = Ellipsoid;