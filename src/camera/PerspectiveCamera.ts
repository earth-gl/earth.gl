import { Camera } from './Camera';
import { Mat4, Vec3, GLMatrix } from 'kiwi.matrix';
import { Frustrum } from './../core/Frustrum';
/**
 * 视锥相机
 */
class PerspectiveCamera extends Camera {
    /**
     * viewport width
     */
    private _width: number;
    /**
     * viewport height
     */
    private _height: number;
    /**
     * 
     */
    private _fov: number;
    /**
     * 
     */
    private _fovy: number;
    /**
     * 
     */
    private _near: number;
    /**
     * 
     */
    private _far: number;
    /**
     * 
     */
    private _aspect: number;
    /**
     * 
     */
    private _target: Vec3;
    /**
     * 初始化设置相机位置从 笛卡尔坐标系中的 x轴正方向看向原点(0,0,0), 故最后坐标系遵循笛卡尔
     */
    private _position: Vec3;
    /**
     * 三维世界up方向
     */
    private _up: Vec3 = new Vec3().set(0, 0, 1);
    /**
     * 视角矩阵
     */
    private _viewMatrix: Mat4;
    /**
     * 视锥参数
     */
    private _frustrum: Frustrum;
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
        this._fovy = this._fov < 1.0 ? this._fov : Math.atan(Math.tan(this._fov * 0.5) / this._aspect) * 2.0;
        this._near = near ? near : 0.1;
        this._far = far ? far : 2000;
        this._frustrum = new Frustrum(this._fovy, this._aspect);
        this._target = new Vec3().set(0, 0, 0);
        this._position = new Vec3().set(1, 0, 0);
        this._updateProjectionMatrix();
        this._updateViewFrustrum();
    }
    /**
     * 更新投影矩阵
     */
    private _updateProjectionMatrix(): void {
        this._projectionMatrix = Mat4.perspective(this._fov, this._aspect, this._near, this._far);
        this._update();
    }
    /**
     * 更新 frustrum 用于计算可视域体积
     */
    private _updateViewFrustrum(): void {
        //Math.atan(Math.tan(frustum.fov * 0.5) / frustum.aspectRatio) * 2.0
        const top = this._near * Math.tan(0.5 * this._fovy);
        //更新视锥参数 
        this._frustrum.updateFrustrum(top);
    }
    /**
     * 
     */
    private _update(): void {
        //相机矩阵，这个矩阵代表的是相机在世界坐标中的位置和姿态。
        //https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-3d-camera.html
        const cameraMatrix = new Mat4().lookAt(this._position, this._target, this._up);
        this._viewMatrix = cameraMatrix.clone();
        this._invertViewMatrix = cameraMatrix.clone().invert();
        this._viewProjectionMatrix = this._projectionMatrix.clone().multiply(this._invertViewMatrix);
    }
    /**
     * @param v 长度为3的数组，分别表示x,y,z
     */
    lookAt(v: Vec3): void {
        this._target.set(v.x, v.y, v.z);
        this._update();
    }

    get position(): Vec3 {
        return this._position;
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

    get frustrum(): Frustrum {
        return this._frustrum;
    }

    get target(): Vec3 {
        return this._target;
    }

    get up():Vec3{
        return this._up;
    }
}

export { PerspectiveCamera, Frustrum }