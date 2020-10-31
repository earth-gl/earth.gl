import { Vec3 } from "kiwi.matrix";
import { Ellipsoid } from "./Ellipsoid";

/**
 * 有向向量
 */
class Ray {
    /**
     * 
     */
    private _startpoint: Vec3;
    /**
     * 
     */
    private _endpoint: Vec3;
    /**
     * 
     * @param startpoint 向量起点
     * @param endpoint 向量终点
     */
    constructor(startpoint: Vec3, endpoint: Vec3) {
        this._startpoint = startpoint.clone();
        this._endpoint = endpoint.clone();
    }
    /**
     * 百分比打断向量，返回起点->终点的向量
     * @param t 
     */
    at(t: number): Vec3 {
        return this._endpoint.clone().scale(t).add(this._startpoint);
    }
    /**
     * 计算射线与地球椭球体表面的相交位置
     * @param {*} plane 
     */
    intersectSphere(sphere: Ellipsoid): Vec3 {
        const v = new Vec3().set(0, 0, 0).sub(this._startpoint);
        //if( x2 + y2 > r2, 则不在球面)
        const tca = v.dot(this._endpoint);
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

export { Ray }