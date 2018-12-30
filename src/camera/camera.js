
/**
 * reference:
 * https://juejin.im/post/5a0872d4f265da43062a4156
 * https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-3d-camera.html
 * 
 * 相机的矩阵分为三个：
 * 1. 投影矩阵（projectMatrix)
 * 2. 视图矩阵（cameraMatrixWorldInverse 或 viewMatrix)
 * 3. 物体位置矩阵 (objectWorldMatrix)
 * 
 * const uMatrix = projectionMatrix * viewMatrix * objectMatrix
 */

/**
 * 矩阵
 */
const Mat4 = require("kiwi.matrix").Mat4;

/**
 * 
 */
class Camera {

    constructor() {
        /**
         * 视角矩阵 
         */
        this._viewMatrix = new Mat4();
        /**
         * 投影矩阵
         */
        this._projectionMatrix = new Mat4();
        /**
         * 视角投影矩阵
         */
        this._viewProjectionMatrix = this._projectionMatrix.clone().multiply(this._viewMatrix);
    }

}

module.exports = Camera;