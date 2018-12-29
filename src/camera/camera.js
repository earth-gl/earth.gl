
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
const Mat4 = require('kiwi.matrix').Mat4,
    Vec3 = require('kiwi.matrix').Vec3,
    Vec4 = require('kiwi.matrix').Vec4,
    GLMatrix = require('kiwi.matrix').GLMatrix;


 class Camera{

    constructor(){
        /**
         * 视图矩阵是将所有物体以相反于相机的方向运动
         */
        this._viewMatrix = new Mat4();
        /**
         * 
         */
        this._projectionMatrix = new Mat4();
    }


 }

 module.exports = Camera;

