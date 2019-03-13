const { EPSILON7 } = require('./../utils/revise');
/**
 * @class
 */
class BoundingSphere {
    /**
     * @param {Vec3} center , the center of the bounding sphere
     * @param {Number} radius , the radius of bounding sphere
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
     * 
     * @param {Vec3} position 
     */
    distance(position) {
        return Math.max(position.sub(boundSphere.center).len(), EPSILON7);
    }
}

module.exports = BoundingSphere;