
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
        // parmaters assign
        var t = this.top, 
            b = this.bottom, 
            r = this.right, 
            l = this.left,
            n = this.near, 
            f = 1000000000.0;
        // near center
        const nearCenter = direction.clone().scale(n);
        nearCenter.add(position);
        // farCenter
        const farCenter = direction.clone().scale(f);
        farCenter.add(position);
        //planes
        const planes = this._cullingVolume.planes;
        const right = direction.clone().cross(up);
        // Left plane computation
        let normal = right.clone().scale(l);
        normal.add(nearCenter);
        normal.sub(position);
        normal.normalize();
        normal.cross(up);
        normal.normalize();
        planes[0] = Plane.from4(normal.x, normal.y, normal.z, -normal.clone().dot(position));
        //Right plane computation
        normal = right.clone().scale(r);
        normal.add(nearCenter);
        normal.sub(position);
        normal = up.clone().cross(normal);
        normal.normalize();
        planes[1] = Plane.from4(normal.x, normal.y, normal.z,-normal.clone().dot(position));
        //bottom plane computation
        normal = up.clone().scale(b);
        normal.add(nearCenter);
        normal.sub(position);
        normal = right.clone().cross(normal);
        normal.normalize();
        planes[2] = Plane.from4(normal.x, normal.y, normal.z,-normal.clone().dot(position));
        //top plane computation
        normal = up.clone().scale(t);
        normal.add(nearCenter);
        normal.sub(position);
        normal.cross(right);
        normal.normalize();
        planes[3] = Plane.from4(normal.x, normal.y, normal.z,-normal.clone().dot(position));
        //Near plane computation
        normal = direction.clone();
        planes[4] = Plane.from4(normal.x, normal.y, normal.z,-normal.clone().dot(nearCenter));
        //Far plane compution
        normal = direction.clone().negate();
        planes[5] = Plane.from4(normal.x, normal.y, normal.z,-normal.clone().dot(farCenter));
        //return volume
        return this._cullingVolume;
    }
}

module.exports = PerspectiveFrustum;