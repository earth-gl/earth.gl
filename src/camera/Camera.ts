import { Mat4, Vec3 } from 'kiwi.matrix';
/**
 * https://juejin.im/post/5a0872d4f265da43062a4156
 * https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-3d-camera.html
 * 相机的矩阵分为三个：
 * 1. 投影矩阵（projectMatrix)
 * 2. 视图矩阵（cameraMatrixWorldInverse 或 viewMatrix)
 * 3. 物体位置矩阵 (objectWorldMatrix)
 * example:
 * const uMatrix = projectionMatrix * viewMatrix * objectMatrix
 */
abstract class Camera {
    /*** 视角矩阵*/
    protected _viewMatrix: Mat4;
    /*** 视角逆矩阵 */
    protected _invertViewMatrix: Mat4;
    /*** 投影矩阵*/
    protected _projectionMatrix: Mat4;
    /*** 视角投影矩阵*/
    protected _viewProjectionMatrix: Mat4;

    /*** */
    constructor() { }

    abstract set position(v: Vec3);

    abstract get position(): Vec3;

    abstract get viewMatrix(): Mat4;

    abstract get invertViewMatrix(): Mat4;

    abstract get identityMatrix():Mat4;

    abstract get projectionMatrix(): Mat4;

    abstract get viewProjectionMatrix(): Mat4;

    abstract get target(): Vec3;

    abstract get up(): Vec3;
    /** 视锥参数 */
    abstract get sseDenominator(): number;

    abstract lookAt(v: Vec3): void;

    abstract _updateProjectionMatrix(): void;
}

export { Camera }
