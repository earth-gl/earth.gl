/**
 * 
 */
const Camera = require("./Camera"),
    Mat4 = require("kiwi.matrix").Mat4,
    Vec3 = require("kiwi.matrix").Vec3,
    GLMatrix = require("kiwi.matrix").GLMatrix;

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
        //更新投影矩阵
        this._updateProjectionMatrix();
    }

    /**
    * @param {Array} v,长度为3的数组，分别表示x,y,z
    */
    lookAt(v) {
        this._target.set(v[0],v[1],v[2]);
        this._update();
    }

    /**
    * @param {Array} v,长度为3的数组，分别表示x,y,z
    */
    set position(v){
        this._position.set(v[0], v[1], v[2]);
        this._update();
    }

    /**
     * @return {Vec3} position vec
     */
    get position(){
        return this._position;
    }

    /**
     * 返回identityMatrix，一般用作没有指定的modelMatrix填充
     */
    get IdentityMatrix(){
        return new Mat4().identity().value;
    }

    /**
     * 返回投影矩阵
     */
    get ProjectionMatrix(){
        return this._projectionMatrix.value;
    }

    /**
     * 
     */
    get up(){
        return this._up;
    }

    /**
     * 返回视角矩阵
     */
    get ViewMatrix(){
        return this._viewMatrix.value;
    }

    /**
     * 返回视角投影矩阵
     */
    get ViewProjectionMatrix(){
        return this._viewProjectionMatrix.value;
    }

    /**
     * 更新投影矩阵
     */
    _updateProjectionMatrix() {
        this._projectionMatrix = Mat4.perspective(GLMatrix.toRadian(this._fov), this._aspect, this._near, this._far);
        this._update();
    }

    _update(){
        /**
         * 相机矩阵，这个矩阵代表的是相机在世界坐标中的位置和姿态。
         * https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-3d-camera.html 
         */
        const cameraMatrix = new Mat4().lookAt(this._position, this._target, this._up);
        /**
         * 视图矩阵是将所有物体以相反于相机的方向运动
         */
        this._viewMatrix = cameraMatrix.clone().invert();
        /**
         * 
         */
        this._viewProjectionMatrix = this._projectionMatrix.clone().multiply(this._viewMatrix);
    }

}


module.exports = PerspectiveCamera;