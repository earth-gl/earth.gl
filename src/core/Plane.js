const { Vec3 } = require('kiwi.matrix');

/**
 * A plane in Hessian Normal Form defined by
 * ax + by + cz + d = 0
 * where (a, b, c) is the plane's normal
 * d is the signed distance to the plane, 
 * and (x, y, z) is any point on the plane.
 * @class
 */
class Plane {
    /**
     * @param {Vec3} normal 
     * @param {Number} distance 
     */
    constructor(normal, distance) {
        /**
         * @type {Vec3}
         */
        this.normal = normal;
        /**
         * @type {Number}
         */
        this.distance = distance;
    }
}
/**
 * @param {Vec4} v4
 */
Plane.fromVec4 = function (v4) {
    const v3 = new Vec3().set(v4.x, v4.y, v4.z);
    const distance = v4.w;
    return new Plane(v3, distance);
};
/**
 * 
 */
Plane.from4 = function(x,y,z,w){
    const v3 = new Vec3().set(x,y,z);
    const distance = w;
    return new Plane(v3,distance);
};

module.exports = Plane;