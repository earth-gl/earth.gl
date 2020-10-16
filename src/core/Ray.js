const { Vec3 } = require('kiwi.matrix');
/**
 * @class Ray
 */
class Ray {
    /**
     * 
     * @param {Vec3} ori 
     * @param {Vec3} des 
     */
    constructor(ori, des) {
        this.origin = ori.clone();
        this.direction = des.clone();
    }
    /**
     * 
     * @param {Number} t 
     * @param {Vec3} target 
     */
    at(t) {
        return this.direction.clone().scale(t).add(this.origin);
    }
    /**
     * 
     * @param {Vec3} v 
     */
    lookAt(v) {
        this.direction = v.clone();
        this.direction.sub(this.origin).normalize();
    }
    /**
     * 
     * @param {Number} t 
     */
    recast(t) {
        this.origin = this.at(t).clone();
    }
    /**
     * 
     * @param {*} plane 
     */
    intersectSphere(sphere) {
        const v = new Vec3().set(0, 0, 0).sub(this.origin);
        //if( x2 + y2 > r2, 则不在球面)
        const tca = v.dot(this.direction);
        const d2 = v.dot(v) - tca * tca;
        const radius2 = sphere.maximumRadius * sphere.maximumRadius;
        if (d2 > radius2) return null;
        const thc = Math.sqrt(radius2 - d2);
        //t0 = first intersect point - entrance on front of sphere
        const t0 = tca - thc;
        // t1 = second intersect point - exit point on back of sphere
        const t1 = tca + thc;
        // test to see if both t0 and t1 are behind the ray - if so, return null
        if (t0 < 0 && t1 < 0) return null;
        //if t0 is behind the ray:the ray is inside the sphere, so return the second exit point scaled by t1,
        // in order to always return an intersect point that is in front of the ray.
        if (t0 < 0) return this.at(t1);
        // t0 is in front of the ray, so return the first collision point scaled by t0
        return this.at(t0);
    }

}

module.exports = Ray;