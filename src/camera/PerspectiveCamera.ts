import { Camera } from './Camera';
import { Mat4, Vec3, GLMatrix } from 'kiwi.matrix';
/**
 * 视锥相机
 * refrenece:
 * https://github.com/KIWI-ST/kiwi.geosketchpad/blob/81c79e4b12fc7879e4dd5606902badd2aab4ac56/src/camera/PerspectiveCamera.js
 */
class PerspectiveCamera extends Camera {
    /*** viewport width */
    private _width: number;
    /*** viewport height */
    private _height: number;
    /*** */
    private _fov: number;
    /*** */
    private _near: number = 0.1;
    /*** */
    private _far: number = 2000;
    /*** */
    private _aspect: number;
    /*** */
    private _target: Vec3 = new Vec3().set(0, 0, 0);
    /*** 初始化设置相机位置从 笛卡尔坐标系中的 x轴正方向看向原点(0,0,0), 故最后坐标系遵循笛卡尔*/
    private _position: Vec3 = new Vec3().set(1, 0, 0);
    /*** 三维世界up方向*/
    private _up: Vec3 = new Vec3().set(0, 0, 1);
    /** 视锥体参数- */
    private _top: number;
    /** 视锥体参数- */
    private _bottom: number;
    /** 视锥体参数- */
    private _right: number;
    /** 视锥体参数- */
    private _left: number;
    /** 视锥体参数- */
    private _sseDenominator: number;
    /** 单位矩阵 */
    private _identityMatrix:Mat4;
    /**
     * 
     * @param fov 
     * @param width 
     * @param height 
     * @param near 
     * @param far 
     */
    constructor(fov: number, width: number, height: number, near: number, far: number) {
        super();
        this._width = width;
        this._height = height;
        this._aspect = width && height ? width / height : 1.0;
        this._fov = GLMatrix.toRadian(fov);
        this._near = near ? near : 0.1;
        this._far = far ? far : 2000;
        this._identityMatrix = new Mat4().identity();
        this._projectionMatrix = Mat4.perspective(this._fov, this._aspect, this._near, this._far);
        this._updateProjectionMatrix();
        this._updateViewFrustrum();
    }
    /*** 更新投影矩阵 */
    public _updateProjectionMatrix(): void {
        //相机矩阵，这个矩阵代表的是相机在世界坐标中的位置和姿态。
        //https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-3d-camera.html
        const cameraMatrix = new Mat4().lookAt(this._position, this._target, this._up);
        this._viewMatrix = cameraMatrix.clone();
        this._invertViewMatrix = cameraMatrix.clone().invert();
        this._viewProjectionMatrix = this._projectionMatrix.clone().multiply(this._invertViewMatrix);
    }
    /*** 更新 frustrum 用于计算可视域体积 */
    private _updateViewFrustrum(): void {
        const _aspectRatio = this._aspect,
            _fov = this._fov,
            _fovy = _fov < 1.0 ? _fov : Math.atan(Math.tan(_fov * 0.5) / _aspectRatio) * 2.0,
            _near = this._near;
        //calcute 
        this._top = _near * Math.tan(0.5 * _fovy);
        this._bottom = -this._top;
        this._right = _aspectRatio * this._top;
        this._left = -this._right;
        this._sseDenominator = 2.0 * Math.tan(0.5 * _fovy);
    }
    /*** @param v 长度为3的数组，分别表示x,y,z */
    lookAt(v: Vec3): void {
        this._target.set(v.x, v.y, v.z);
        this._updateProjectionMatrix();
    }
    /*** 获取摄像机位置 */
    get position(): Vec3 {
        return this._position;
    }
    /*** 设置摄像机位置 */
    set position(v: Vec3) {
        this.position.set(v.x, v.y, v.z);
        this._updateProjectionMatrix();
    }

    get viewMatrix(): Mat4 {
        return this._viewMatrix;
    }

    get invertViewMatrix(): Mat4 {
        return this._invertViewMatrix;
    }

    get projectionMatrix(): Mat4 {
        return this._projectionMatrix;
    }

    get viewProjectionMatrix(): Mat4 {
        return this._viewProjectionMatrix;
    }

    get target(): Vec3 {
        return this._target;
    }

    get up(): Vec3 {
        return this._up;
    }

    get sseDenominator(): number {
        return this._sseDenominator;
    }

    get identityMatrix():Mat4{
        return this._identityMatrix;
    }
}

export { PerspectiveCamera }
