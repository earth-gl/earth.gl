
const merge = require("./../utils/merge"),
    Plane = require("./Plane"),
    maximumRadius = require("./../core/Ellipsoid").WGS84.maximumRadius,
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
        this.far = options.far || 10000000000.0;
        /**
         * 
         */
        this._cullingVolume = new CullingVolume();
    }
    /**
     * reference:
     * https://github.com/AnalyticalGraphicsInc/cesium/blob/15d5cdeb3331d84b896821b04eefd5ba199994c6/Source/Core/PerspectiveOffCenterFrustum.js#L194
     * @typedef {import("./CullingVolume")} CullingVolume
     * @param {Vec3} position
     * @param {Vec3} direction
     * @param {Vec3} up
     * @returns {CullingVolume}
     */
    computeCullingVolume(position, direction, up) {
        //planes
        const planes = this._cullingVolume.planes;
        // parmaters assign
        var t = this.top, 
            b = this.bottom, 
            r = this.right, 
            l = this.left,
            n = this.near, 
            f = 10000000000.0,
            d = 0.0;
            //f = this.far;
        //right direction
        const right = direction.clone().cross(up);
        // near center
        const nearCenter = direction.clone().scale(n);
        nearCenter.add(position);
        // farCenter
        const farCenter = direction.clone().scale(f);
        farCenter.add(position);
        // Left plane computation
        let normal = right.clone().scale(l);
        normal.add(nearCenter);
        normal.sub(position);
        normal.normalize();
        normal.cross(up);
        normal.normalize();
        d = -normal.clone().dot(position);
        planes[0] = Plane.from4(normal.x, normal.y, normal.z, d);
        //Right plane computation
        normal = right.clone().scale(r);
        normal.add(nearCenter);
        normal.sub(position);
        normal = up.clone().cross(normal);
        normal.normalize();
        d = -normal.clone().dot(position);
        planes[1] = Plane.from4(normal.x, normal.y, normal.z, d);
        //bottom plane computation
        normal = up.clone().scale(b);
        normal.add(nearCenter);
        normal.sub(position);
        normal = right.clone().cross(normal);
        normal.normalize();
        d = -normal.clone().dot(position);
        planes[2] = Plane.from4(normal.x, normal.y, normal.z, d);
        //top plane computation
        normal = up.clone().scale(t);
        normal.add(nearCenter);
        normal.sub(position);
        normal.cross(right);
        normal.normalize();
        d = -normal.clone().dot(position);
        planes[3] = Plane.from4(normal.x, normal.y, normal.z, d);
        //Near plane computation
        normal = direction.clone();
        d = -normal.clone().dot(nearCenter);
        planes[4] = Plane.from4(normal.x, normal.y, normal.z, d);
        //Far plane compution
        normal = direction.clone().negate();
        d = -normal.clone().dot(farCenter);
        planes[5] = Plane.from4(normal.x, normal.y, normal.z, d);
        //return volume
        return this._cullingVolume;
    }
}

module.exports = PerspectiveFrustum;