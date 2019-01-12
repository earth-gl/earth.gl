
const { INTERSECT_CONSTANT } = require("./../utils/constant");

/**
 * @class
 */
class BoundingSphere {
    /**
     * create a ball
     * @param {Vec3} center 
     * @param {Number} radius 
     */
    constructor(center, radius) {
        /**
         * @type {Vec3}
         */
        this.center = center;
        /**
         * @type {Number}
         */
        this.radius = radius;
    }
    /**
     * @typedef {import("./Plane")} Plane
     * @param {Plane} plane 
     */
    intersectPlane(plane) {
        const center = this.center,
            radius = this.radius,
            distance = plane.distance,
            normal = plane.normal;
        const distanceToPlane = normal.clone().dot(center) + distance;
        if (distanceToPlane < -radius)
            return INTERSECT_CONSTANT.OUTSIDE;
        else if (distanceToPlane < radius)
            return INTERSECT_CONSTANT.INTERSECTING;
        else
            return INTERSECT_CONSTANT.INSIDE;
    }
}

module.exports = BoundingSphere;