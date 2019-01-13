/**
 *
 */
const Camera = require("./Camera"),
    { Mat4, Vec3, GLMatrix } = require("kiwi.matrix");
//solve pricision
GLMatrix.setMatrixArrayType(Array);

const {INTERSECT_CONSTANT} = require("./../utils/constant"),
    BoundingSphere = require("./../core/BoundingSphere"), 
    PerspectiveFrustum = require("./../core/PerspectiveFrustum"),
    ellipsoid = require("./../core/Ellipsoid").WGS84;
/**
 * const viewProjectionMatrix = projectionMatrix * viewMatrix * [objectMatrix]
 * @class
 */
class PerspectiveCamera extends Camera {
    /**
     *
     * @param {*} fov 与垂面的夹角，使用角度表示
     * @param {*} aspect 视角,一般使用屏幕width/height
     * @param {*} near 近投影面
     * @param {*} far 远投影面
     */
    constructor(fov, width, height, near, far) {
        super();
        /**
         * @type {Number} viewport width
         */
        this._width = width;
        /**
         * @type {Number}  viewport height
         */
        this._height = height;
        /**
         * @type {Number}
         */
        this._fov = GLMatrix.toRadian(fov);
        /**
         * @type {Number}
         */
        this._near = near ? near : 0.1;
        /**
         * @type {Number}
         */
        this._far = far ? far : 2000;
        /**
         * @type {Number}
         */
        this._aspect = width && height ? width / height : 1.0;
        /**
         * @type {Vec3}
         */
        this._target = new Vec3().set(0, 0, 0);
        /**
         * @type {Vec3}
         */
        this._position = new Vec3().set(0, 0, 1);
        /**
         * @type {Vec3}
         */
        this._up = new Vec3().set(0, 1, 0);
        /**
         * @typedef {import("../core/PerspectiveFrustum")} PerspectiveFrustum
         * @type {PerspectiveFrustum} 
         */
        this._viewFrustum = new PerspectiveFrustum();
        /**
         * 更新投影矩阵
         */
        this._updateProjectionMatrix();
        /**
         * 更新 frustrum 用于计算可视域体积
         */
        this._updateViewFrustrum();
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
     * @type {Vec3} position vec
     */
    get position() {
        return this._position;
    }
    /**
     * @type {Vec3}
     */
    get target() {
        return this._target;
    }
    /**
     *  @type {Vec3}
     */
    get up() {
        return this._up;
    }
    /**
     * 返回identityMatrix，一般用作没有指定的modelMatrix填充
     * @type {Array}
     */
    get IdentityMatrix() {
        return new Mat4().identity().value;
    }
    /**
     * 返回投影矩阵
     * @type {Array}
     */
    get ProjectionMatrix() {
        return this._projectionMatrix.value;
    }
    /**
     * 返回视角矩阵
     * @type {Array}
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
        this._projectionMatrix = Mat4.perspective(this._fov, this._aspect, this._near, this._far);
        this._update();
    }
    /**
     * 
     */
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
        this._viewProjectionMatrix = this._projectionMatrix.clone().multiply(this._viewMatrix);
    }
    /**
     * 
     */
    _updateViewFrustrum() {
        const _aspectRatio = this._aspect, 
            _fov = this._fov,
            _fovy = _fov < 1.0 ? _fov : Math.atan(Math.tan(_fov * 0.5) / _aspectRatio) * 2.0,
            _near = this._near, 
            _far = this._far;
        const f = this._viewFrustum;
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
    computeHorizonQuad() {
        const horizonPoints = [];
        const radii = ellipsoid.radii,
            p = this.position.clone();
        //
        const q = ellipsoid.oneOverRadii.clone().multiply(p);
        const qMangitude = q.len();
        const qUnit = q.clone().normalize();
        //
        let eUnit, nUnit;
        //
        if (qUnit.equals(new Vec3(0, 0, 1))) {
            eUnit = new Vec3().set(0, 1, 0);
            nUnit = new Vec3().set(0, 0, 1);
        } else {
            eUnit = new Vec3().set(0, 0, 1).cross(qUnit).normalize();
            nUnit = qUnit.clone().cross(eUnit).normalize();
        }
        // Determine the radius of the 'limb' of the ellipsoid.
        const wMagnitude = Math.sqrt(q.len() * q.len() - 1);
        // Compute the center and offsets.
        const center = qUnit.clone().scale(1.0 / qMangitude);
        const scalar = wMagnitude / qMangitude;
        const eastOffset = eUnit.scale(scalar);
        const northOffset = nUnit.scale(scalar);
        //A conservative measure for the longitudes would be to use the min/max longitudes of the bounding frustum.
        var upperLeft = center.clone().add(northOffset);
        horizonPoints[0] = upperLeft;
        upperLeft = radii.clone().multiply(upperLeft);
        var lowerLeft = center.clone().sub(northOffset);
        horizonPoints[1] = lowerLeft;
        lowerLeft = radii.clone().multiply(lowerLeft);
        var lowerRight = center.clone().sub(northOffset);
        horizonPoints[2] = lowerRight;
        lowerRight = radii.clone().cross(lowerRight);
        var upperRight = center.clone().add(northOffset);
        horizonPoints[3] = upperRight;
        upperRight.add(eastOffset);
        upperRight = radii.clone().multiply(upperRight);
        //
        return horizonPoints;
    }
    /**
     * 
     * @param {Vec2} windowPosition 
     * @returns {Ray}
     */
    // getPickRayPerspective(windowPosition) {

    // }

    // pickEllipsoid(windowPostion) {

    // }
    // addToResult(x, y, index, computedHorizonQuad) {
    //     const scratchPickCartesian2 = new Vec2().set(x, y);
    //     // var r = this.pick
    // }
    computeViewRectangle() {
        const position = this.position.clone(),
            //direction = position.clone().sub(this.target).normalize(),
            direction = this.target.clone().sub(position).normalize(),
            up = this.up.clone();
        const cullingVolume = this._viewFrustum.computeCullingVolume(position, direction, up);
        const boundingSphere = new BoundingSphere(new Vec3(), ellipsoid.maximumRadius);
        const visibility = cullingVolume.computeVisibility(boundingSphere);
        if (visibility === INTERSECT_CONSTANT.OUTSIDE) return undefined;
        // var width = this._width,
        //     height = this._height;
        //var computedHorizonQuad = this.computeHorizonQuad();

    }

}


module.exports = PerspectiveCamera;