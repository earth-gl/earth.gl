
const merge = require("./../utils/merge"),
    CullingVolume = require("./CullingVolume");
/**
 * reference:
 * https://github.com/AnalyticalGraphicsInc/cesium/blob/22dce1d9aaf480b0cbea6148b05a4c482ce80f00/Source/Core/PerspectiveOffCenterFrustum.js
 * @class
 */
class PerspectiveFrustum {
    /**
     * 
     * @param {Object} [options] 
     */
    constructor(options) {
        /**
         * @type {Object}
         */
        options = merge({}, options);
        /**
         * 
         */
        this.left = options.left;
        /**
         * 
         */
        this.right = options.right;
        /**
         * 
         */
        this.top = options.top;
        /**
         * 
         */
        this.bottom = options.bottom;
        /**
         * 
         */
        this.near = options.near || 1.0;
        /**
         * 
         */
        this.far = options.far || 500000000.0;
        /**
         * 
         */
        this._cullingVolume = new CullingVolume();
    }
    /**
     * @typedef {import("./CullingVolume")} CullingVolume
     * @param {Vec3} position
     * @param {Vec3} direction
     * @param {Vec3} up
     * @returns {CullingVolume}
     */
    computeCullingVolume(position, direction, up) {
        // parmaters assign
        var t = this.top, b = this.bottom, r = this.right, l = this.left,
            n = this.near, f = this.far;
        // near center
        const nearCenter = direction.clone().scale(n);
        nearCenter.add(position);
        // farCenter
        const farCenter = direction.clone().scale(f);
        farCenter.add(position);
        /**
         * @type {Vec4}
         */
        var plane;
        // Left plane computation, right
        const right = direction.clone().cross(up);
        let normal = right.clone().scale(l);
        normal.add(nearCenter);
        normal.sub(position);
        normal.normalize();
        normal.cross(up);
        normal.normalize();
        const planes = this._cullingVolume.planes;
        //plane0
        plane = planes[0];
        plane.x = normal.x;
        plane.y = normal.y;
        plane.z = normal.z;
        plane.w = -normal.clone().dot(position);
        //Right plane computation
        normal = right.clone().scale(r);
        normal.add(nearCenter);
        normal.sub(position);
        normal = up.clone().cross(normal);
        normal.normalize();
        //plane1
        plane = planes[1];
        plane.x = normal.x;
        plane.y = normal.y;
        plane.z = normal.z;
        plane.w = -normal.clone().dot(position);
        //bootom plane computation
        normal = up.clone().scale(b);
        normal.add(nearCenter);
        normal.sub(position);
        normal = right.clone().cross(normal);
        normal.normalize();
        //plane2
        plane = planes[2];
        plane.x = normal.x;
        plane.y = normal.y;
        plane.z = normal.z;
        plane.w = -normal.clone().dot(position);
        //top plane computation
        normal = up.clone().scale(t);
        normal.add(nearCenter);
        normal.sub(position);
        normal.cross(right);
        normal.normalize();
        //plane3
        plane = planes[3];
        plane.x = normal.x;
        plane.y = normal.y;
        plane.z = normal.z;
        plane.w = -normal.clone().dot(position);
        //plane4
        //Near plane computation
        plane = planes[4];
        plane.x = direction.x;
        plane.y = direction.y;
        plane.z = direction.z;
        plane.w = -direction.clone().dot(nearCenter);
        //plane5
        plane = planes[5];
        plane.x = normal.x;
        plane.y = normal.y;
        plane.z = normal.z;
        plane.w = -normal.clone().dot(farCenter);
        return this._cullingVolume;
    }
}

module.exports = PerspectiveFrustum;