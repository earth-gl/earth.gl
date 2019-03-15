/**
 *
 */
const Camera = require("./Camera"),
    { Mat4, Vec3, GLMatrix } = require("kiwi.matrix");
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
        this._position = new Vec3().set(0, 1, 0);
        /**
         * @type {Vec3}, 使用z轴承为正方向
         */
        this._up = new Vec3().set(0, 0, 1);
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
     * used to calcute space error
     */
    get sseDenominator(){
        return this._sseDenominator;
    }
    /**
     * 
     */
    get width(){
        return this._width;
    }
    /**
     * 
     */
    get height(){
        return this._height;
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
        /**
         * 
         */
        this._normalMatrix  = this._viewProjectionMatrix.clone().invert().transpose();
    }
    /**
     * 
     */
    _updateViewFrustrum() {
        //Math.atan(Math.tan(frustum.fov * 0.5) / frustum.aspectRatio) * 2.0
        const _aspectRatio = this._aspect, 
            _fov = this._fov,
            _fovy = _fov < 1.0 ? _fov : Math.atan(Math.tan(_fov * 0.5) / _aspectRatio) * 2.0,
            _near = this._near;
        //calcute 
        this._top = _near * Math.tan(0.5 * _fovy);
        this._bottom = -this._top;
        this._right = _aspectRatio * this._top;
        this._left = -this._right;
        this._sseDenominator = 2.0 * Math.tan(0.5 *_fovy);
    }
}

module.exports = PerspectiveCamera;