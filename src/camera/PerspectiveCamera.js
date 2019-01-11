/**
 *
 */
const merge = require('./../utils/merge'), Camera = require('./Camera'),
    Mat4 = require('kiwi.matrix').Mat4, Vec3 = require('kiwi.matrix').Vec3,
    Vec4 = require('kiwi.matrix').Vec4,
    ellipsoid = require("./../core/Ellipsoid").WGS84,
    GLMatrix = require('kiwi.matrix').GLMatrix;

/**
 * This enumerated type is used in determining where, relative to the frustum, an
 * object is located. The object can either be fully contained within the frustum (INSIDE),
 * partially inside the frustum and partially outside (INTERSECTING), or somwhere entirely
 * outside of the frustum's 6 planes (OUTSIDE).
 *
 */
const Intersect = {
    /**
     * Represents that an object is not contained within the frustum.
     */
    OUTSIDE: -1,
    /**
     * Represents that an object intersects one of the frustum's planes.
     */
    INTERSECTING: 0,
    /**
     * Represents that an object is fully within the frustum.
     */
    INSIDE: 1
};

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

class CullingVolume {

    constructor() {
        /**
         * @type {Vec4[6]}
         */
        this.planes = [
            new Vec4(), new Vec4(), new Vec4(), new Vec4(), new Vec4(), new Vec4()
        ];
    }

    /**
     * @param {BoundingSphere} boundingVolume 
     * @returns {Intersect}
     */
    computeVisibility(boundingVolume) {
        const rawPlanes = this.planes;
        var intersecting = false;
        for (var k = 0, len = rawPlanes.length; k < len; ++k) {
            const plane = new Plane(new Vec3().set(rawPlanes[k].x,rawPlanes[k].y,rawPlanes[k].z),rawPlanes[k].w);
            var result = boundingVolume.intersectPlane(plane);
            if (result === Intersect.OUTSIDE) {
                return Intersect.OUTSIDE;
            } else if (result === Intersect.INTERSECTING) {
                intersecting = true;
            }
        }
        return intersecting ? Intersect.INTERSECTING : Intersect.INSIDE;
    }

}

class BoundingSphere {

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

    intersectPlane(plane) {
        const center = this.center,
            radius = this.radius,
            distance = plane.distance,
            normal = plane.normal;
        const distanceToPlane = normal.clone().dot(center) + distance;
        //
        if (distanceToPlane < - radius)
            return Intersect.OUTSIDE;
        else if (distanceToPlane < radius)
            return Intersect.INTERSECTING;
        else
            return Intersect.INSIDE;
    }

}


/**
 * reference:
 * https://github.com/AnalyticalGraphicsInc/cesium/blob/22dce1d9aaf480b0cbea6148b05a4c482ce80f00/Source/Core/PerspectiveOffCenterFrustum.js
 */
class PerspectiveOffCenterFrustum {
    constructor(options) {
        options = merge({}, options);
        this.left = options.left;
        this._left = undefined;
        this.right = options.right;
        this._right = undefined;
        this.top = options.top;
        this._top = undefined;
        this.bottom = options.bottom;
        this._bottom = undefined;
        this.near = options.near || 1.0;
        this._near = this.near;
        this.far = options.far || 500000000.0;
        this._far = this.far;
        this._cullingVolume = new CullingVolume();
    }
    /**
     *
     * @param {Vec3} position
     * @param {Vec3} direction
     * @param {Vec3} up
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
        //
        return this._cullingVolume;
    }
}
/**
 * const viewProjectionMatrix = projectionMatrix * viewMatrix * [objectMatrix]
 */
class PerspectiveCamera extends Camera {
    /**
     *
     * @param {*} fov 与垂面的夹角，使用角度表示
     * @param {*} aspect 视角,一般使用屏幕width/height
     * @param {*} near 近投影面
     * @param {*} far 远投影面
     */
    constructor(fov, aspect, near, far) {
        super();
        this._fov = fov ? fov : 50;
        this._zoom = 1;
        this._near = near ? near : 0.1;
        this._far = far ? far : 2000;
        this._aspect = aspect ? aspect : 1.0;
        this._target = new Vec3().set(0, 0, 0);
        this._position = new Vec3().set(0, 0, 1);
        this._up = new Vec3().set(0, 1, 0);
        //计算volum
        this._offCenterFrustum = new PerspectiveOffCenterFrustum();
        //更新投影矩阵
        this._updateProjectionMatrix();
    }

    /**
     * @param {Array} v,长度为3的数组，分别表示x,y,z
     */
    lookAt(v) {
        this._target.set(v[0], v[1], v[2]);
        this._update();
    }

    /**
     * @param {Array} v,长度为3的数组，分别表示x,y,z
     */
    set position(v) {
        this._position.set(v[0], v[1], v[2]);
        this._update();
    }

    /**
     * @return {Vec3} position vec
     */
    get position() {
        return this._position;
    }

    get target() {
        return this._target;
    }

    /**
     * 返回identityMatrix，一般用作没有指定的modelMatrix填充
     */
    get IdentityMatrix() {
        return new Mat4().identity().value;
    }

    /**
     * 返回投影矩阵
     */
    get ProjectionMatrix() {
        return this._projectionMatrix.value;
    }

    /**
     *
     */
    get up() {
        return this._up;
    }

    /**
     * 返回视角矩阵
     */
    get ViewMatrix() {
        return this._viewMatrix.value;
    }

    /**
     * 返回视角投影矩阵
     */
    get ViewProjectionMatrix() {
        return this._viewProjectionMatrix.value;
    }

    /**
     * 更新投影矩阵
     */
    _updateProjectionMatrix() {
        this._projectionMatrix = Mat4.perspective(
            GLMatrix.toRadian(this._fov), this._aspect, this._near, this._far);
        this._update();
    }

    _update() {
        /**
         * 相机矩阵，这个矩阵代表的是相机在世界坐标中的位置和姿态。
         * https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-3d-camera.html
         */
        const cameraMatrix =
            new Mat4().lookAt(this._position, this._target, this._up);
        /**
         * 视图矩阵是将所有物体以相反于相机的方向运动
         */
        this._viewMatrix = cameraMatrix.clone().invert();
        /**
         *
         */
        this._viewProjectionMatrix =
            this._projectionMatrix.clone().multiply(this._viewMatrix);
        /**
         *
         */
        this._updateOffCenterFrustrum();
    }

    _updateOffCenterFrustrum() {
        const _aspectRatio = this._aspect, _fov = this._fov,
            _fovy = _fov < 1.0 ?
                _fov :
                Math.atan(Math.tan(_fov * 0.5) / _aspectRatio) * 2.0,
            _near = this._near, _far = this._far;
        const f = this._offCenterFrustum;
        f.top = _near * Math.tan(0.5 * _fovy);
        f.bottom = -f.top;
        f.right = _aspectRatio * f.top;
        f.left = -f.right;
        f.near = _near;
        f.far = _far;
    }

    /**
     * 计算参考椭球与frustrum的四个交点，得到 view rectangle
     * https://github.com/AnalyticalGraphicsInc/cesium/blob/15d5cdeb3331d84b896821b04eefd5ba199994c6/Source/Scene/Camera.js#L3050
     */
    computeHorizonQuad(){

    }


    computeViewRectangle() {
        const position = this.position.clone(),
            direction = this.target.clone(),
            up = this.up.clone();
        const cullingVolume = this._offCenterFrustum.computeCullingVolume(position, direction, this.up);
        const boundingSphere = new BoundingSphere(new Vec3(), ellipsoid.maximumRadius);
        const visibility = cullingVolume.computeVisibility(boundingSphere);
        if(visibility === Intersect.OUTSIDE)
            return undefined;
        
    }

}


module.exports = PerspectiveCamera;