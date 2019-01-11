const { INTERSECT_CONSTANT } = require("./../utils/constant");
/**
 * @class
 */
class CullingVolume {
    /**
     * 
     */
    constructor() {
        /**
         * @typedef {import("./Plane")} Plane
         * @type {Plane[]}
         */
        this.planes = [];
    }
    /**
     * @typedef {import("./../core/BoundingSphere")} BoundingSphere
     * @param {BoundingSphere} boundingSphere 
     * @returns {Intersect}
     */
    computeVisibility(boundingSphere) {
        const planes = this.planes;
        var intersecting = false;
        for (var k = 0, len = planes.length; k < len; ++k) {
            const plane = planes[k];
            var result = boundingSphere.intersectPlane(plane);
            if (result === INTERSECT_CONSTANT.OUTSIDE) {
                return INTERSECT_CONSTANT.OUTSIDE;
            } else if (result === INTERSECT_CONSTANT.INTERSECTING) {
                intersecting = true;
            }
        }
        return intersecting ? INTERSECT_CONSTANT.INTERSECTING : INTERSECT_CONSTANT.INSIDE;
    }
}

module.exports = CullingVolume;