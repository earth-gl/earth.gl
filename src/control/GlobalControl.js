/**
 * earth.gl 核心操作交互
 * https://github.com/mrdoob/three.js/blob/e88edaa2caea2b61c7ccfc00d1a4f8870399642a/examples/jsm/controls/TrackballControls.js
 */
const { Quat, Vec2, Vec3, Mat4 } = require('kiwi.matrix'),
    Ray = require('../core/Ray'),
    Tween = require('../core/Tween'),
    { WGS84 } = require('../core/Ellipsoid'),
    EventEmitter = require('../core/EventEmitter'),
    { preventDefault, stopPropagation } = require('../utils/domEvent');
/**
 * @enum
 */
const STATE = {
    NONE: 'NONE',
    PAN: 'PAN',
    ROTATE: 'ROTATE',
    ORBIT: 'ORBIT',
    TOUCH: 'TOUCH'
}
/**
 * The number of user's inputs to consider for panning inertia, to reduce erratic inputs.
 */
const USER_INPUTS_TO_CONSIDER = 5;
/**
 * https://github.com/JonLim/three-trackballcontrols/blob/master/index.js
 * @class
 */
class GlobalController extends EventEmitter {
    /**
    * @typedef {import("../camera/PerspectiveCamera")} PerspectiveCamera
    * @typedef {import('../Global')} Global
    * @param {PerspectiveCamera} camera
    * @param {Global} global
    */
    constructor(global) {
        super();
        /**
         * @type {String}
         */
        this.m_state = STATE.NONE;
        /**
         * last mouse position (clientX, clientY)
         * @type {Vec2} 
         */
        this.m_lastMousePosition = new Vec2();
        /**
         * @type {Number}
         */
        this.m_currentPanDistanceOrAngleIndex = 0;
        /**
         * @type {Array}
         */
        this.m_recentPanDistancesOrAngles = [0, 0, 0, 0, 0];
        /**
         * @type {Vec2}
         */
        this.m_mouseDelta = new Vec2();
        /**
         * @type {Vec3}
         */
        this.m_lastRotateGlobeFromVector = new Vec3();
        /**
         * @type {Quat}
         */
        this.m_rotateGlobeQuaternion = new Quat();
        /**
         * @type {PerspectiveCamera}
         */
        this.camera = global._camera;
        /**
         * @type {Global}
         */
        this._global = global;
        /**
         * render screen
         */
        this.screen = {};
        /**
         * 
         */
        this.panSpeed = 0.3;
        /**
         * }{ debug
         */
        this.dynamicDampingFactor = 0.2;
        /**
         * 
         */
        this.target = new Vec3();
        /**
         * @type {Vec3}
         */
        this.lastPosition = new Vec3();
        /**
         * @type {Vec3}
         */
        this._eye = new Vec3();
        /**
         * @type {Vec3}
         */
        this._movePrev = new Vec3();
        /**
         * @type {Vec3}
         */
        this._moveCurr = new Vec3();
        /**
         * @type {Vec3}
         */
        this._lastAxis = new Vec3();
        /**
         * @type {Number}
         */
        this._lastAngle = 0;
        /**
         * @type {Function}
         */
        this._zoomEnd = null;
        /**
         * @type {Vec2}
         */
        this._zoomStart = new Vec3();
        /**
         * @type {Vec2}
         */
        this._zoomEnd = new Vec3();
        /**
         * @type {Number}
         */
        this._touchZoomDistanceStart = 0;
        /**
         * @type {Number}
         */
        this._touchZoomDistanceEnd = 0;
        /**
         * @type {Vec2}
         */
        this._panStart = new Vec3();
        /**
         * @type {Vec2}
         */
        this._panEnd = new Vec3();
        /**
         * 
         */
        this._initialize();
        /**
         * 
         */
        this._registerEvent();
    }
    /**
     * 
     */
    _initialize() {
        const domElement = this._global.domElement;
        //camera clone
        this.target0 = this.target.clone();
        this.position0 = this.camera.position.clone();
        this.up0 = this.camera.up.clone();
        if (domElement === document) {
            //screen
            this.screen.left = 0;
            this.screen.top = 0;
            this.screen.width = window.innerWidth;
            this.screen.height = window.innerHeight;
        } else {
            const box = domElement.getBoundingClientRect();
            const dom = domElement.ownerDocument.documentElement;
            this.screen.left = box.left + window.pageXOffset - dom.clientLeft;
            this.screen.top = box.top + window.pageYOffset - dom.clientTop;
            this.screen.width = box.width;
            this.screen.height = box.height;
        }
        this.centerX = this.screen.left + this.screen.width / 2;
        this.centerY = this.screen.top + this.screen.height / 2;
    }
    /**
     * 
     */
    _registerEvent() {
        this.listenTo(this._global, 'mousedown', this.mousedown, this);
        this.listenTo(this._global, 'mousewheel', this.mousewheel, this);
    }
    /**
     * get NDC
     * @param {Number} clientX 
     * @param {Number} clientY 
     * @return {Vec3}
     */
    _getNormalizeDeviceCoordinate(clientX, clientY) {
        return ndc = new Vec3().set(
            (clientX / this.screen.width) * 2 - 1,
            -(clientY / this.screen.height) * 2 + 1,
            1
        );
    }
    /**
     * ndc to space coord
     * @param {Vec3} pndc 
     * @returns {Vec3}
     */
    _normalizedDeviceCoordinateToSpaceCoordinate(pndc) {
        const m4 = this.camera.ViewMatrix.clone().multiply(this.camera.ProjectionMatrix.clone().invert());
        const space = pndc.clone().applyMatrix4(m4);
        return space;
    }
    /**
     * @type {Vec3}
     */
    _spaceCoordinateToNormaziledDeveiceCoordinate(space) {
        const ndc = space.clone().applyMatrix4(this.camera.ViewProjectionMatrix);
        return ndc;
    }
    /**
     * prepare the unprojection matrix which projects from NDC space to camera space
     * and takes the current rotation of the camera into account
     * unproject ndc point to camera space point
     * @param {Number} clientX 
     * @param {Number} clientY 
     * @returns {Vec3} space coord
     */
    _rayTrackOnSphere(clientX, clientY) {
        const pndc = this._getNormalizeDeviceCoordinate(clientX, clientY);
        const space = this._normalizedDeviceCoordinateToSpaceCoordinate(pndc);
        const d = space.sub(this.camera.position.clone()).normalize();
        const ray = new Ray(this.camera.position.clone(), d);
        return ray.intersectSphere(WGS84);
    }
    /**
     * 
     * @param {Vec3} from, space coordinate on earth
     * @param {Vec3} to, space coordinate on earth
     */
    _pan(from, to) {
        // Assign the new animation start time.
        this.m_panAnimationStartTime = performance.now();
        this.m_lastRotateGlobeFromVector = from.clone();
        this.m_lastRotateGlobeAxis = from.clone().cross(to).normalize();
        this.m_lastRotateGlobeAngle = from.angle(to);
        this._handlePan();
    }
    /**
     * 
     */
    _handlePan(){
        const angle = this.m_lastRotateGlobeAngle;
        this.m_rotateGlobeQuaternion = new Quat().setAxisAngle(this.m_lastRotateGlobeAxis, this.m_lastRotateGlobeAngle).normalize();
        this.m_currentPanDistanceOrAngleIndex = (this.m_currentPanDistanceOrAngleIndex + 1) % USER_INPUTS_TO_CONSIDER;
        this.m_recentPanDistancesOrAngles[this.m_currentPanDistanceOrAngleIndex] = angle;
        this.m_lastAveragedPanDistanceOrAngle = this.m_recentPanDistancesOrAngles.reduce((a, b) => a + b) / USER_INPUTS_TO_CONSIDER;
        //rotate mapview
        const from = this.m_lastRotateGlobeFromVector.clone();
        const to = this.m_lastRotateGlobeFromVector.clone().applyQuat(this.m_rotateGlobeQuaternion);
        //rotate view
        this._rotateCamera(from, to);
    }
    /**
     * }{ debug 
     * @param {Vec3} from 
     * @param {Vec3} to 
     */
    _rotateCamera(from, to){
        const q = new Quat().setFromUnitVectors(from.clone().normalize(), to.clone().normalize()).invert();
        const m4 = Mat4.fromQuat(q);
        this.camera.applyMatrix(m4);
    }
    /**
     * 设置触发状态
     * @param {MouseEvent} event 
     */
    mousedown(event) {
        stopPropagation(event);
        if (this.m_state !== STATE.NONE) return;
        //set state
        if (event.button === 0)
            this.m_state = STATE.PAN;
        else if (event.button === 1)
            this.m_state === STATE.ROTATE;
        else if (event.button === 2)
            this.m_state === STATE.ORBIT;
        else
            return;
        //store current client mouse position
        this.m_lastMousePosition.set(event.clientX, event.clientY);
        //resgister document events
        this.listenTo(this._global, 'mousemove', this.mousemove, this);
        this.listenTo(this._global, 'mouseup', this.mouseup, this);
    }
    /**
     * https://github.com/heremaps/harp.gl/blob/7d23554e9e00626c9e14e5edf995a30daff12523/%40here/harp-map-controls/lib/MapControls.ts#L958
     * @param {MouseEvent} event 
     */
    mousemove(event) {
        //鼠标移动距离(像素)
        this.m_mouseDelta.set(event.clientX - this.m_lastMousePosition.x, event.clientY - this.m_lastMousePosition.y);
        if (this.m_state === STATE.PAN) {
            const form = this._rayTrackOnSphere(this.m_lastMousePosition.x, this.m_lastMousePosition.y);
            const to = this._rayTrackOnSphere(event.clientX, event.clientY);
            this._pan(form, to);
        }
    }
    /**
     * 
     * @param {*} event 
     */
    mouseup(event) {
        this.stopListen(this._global, 'mousemove', this.mousemove, this);
        this.stopListen(this._global, 'mouseup', this.mouseup, this);
        this.fire('dragEnd', event)
    }
    /**
     * 
     */
    zoomCamera() {
        const camera = this.camera;
        let zs = WGS84.oneOverMaximumRadius * (camera.position.distance(this.target) - WGS84.maximumRadius); //zoom speed
        zs = zs > 0 ? zs * 2 : 0;
        const factor = 1.0 + (this._zoomEnd.y - this._zoomStart.y) * zs;
        if (factor !== 1.0 && factor > 0.0) {
            this._eye.scale(factor);
        } else {
            this._zoomStart._out[1] += (this._zoomEnd.y - this._zoomStart.y) * this.dynamicDampingFactor;
        }
        this._zoomStart = this._zoomEnd.clone();
    }
    /**
     * 
     * 先确定z, 后确定x, 最后根据 z和x确定y
     * 
     * XAisxx | XAisxy | XAisxz | <- 相机x方向 通过透视矩阵up方向叉乘z方向，得到XAxis方向
     * ---------------------------
     * YAisxx | YAisxy | YAisxz | <- 相机y方向，通过z和x方向叉乘，得到YAxis方向
     * ---------------------------
     * ZAisxx | ZAisxy | ZAisxz | <- 相机z方向，目标指朝向相机的方向，即ZAxis
     * ---------------------------
     *   Tx   |   Ty   |   Yz   | <- 相机位置
     */
    rotateCamera() {
        if (this._moveCurr === null || this._movePrev === null) return;
        const target = this.target, //默认是 (0,0,0),
            camera = this.camera,
            //rs = WGS84.oneOverMaximumRadius * (camera.position.distance(this.target) - WGS84.maximumRadius), //rotate speed
            moveCurr = this._moveCurr,
            movePrev = this._movePrev;
        const p0x = this._normalizedDeviceCoordinateToSpaceCoordinate(moveCurr);
        const p1x = this._normalizedDeviceCoordinateToSpaceCoordinate(movePrev);
        const angle = - p0x.angle(p1x);
        //
        if (angle) {
            //https://juejin.im/post/5c92f2666fb9a070b70beb98
            //旋转的本质就是绕相机的 y 方向旋转 angle，考虑到在地图上平移的方向，重新计算up
            //计算旋转轴，即为相机的y
            this._eye = camera.position.clone().sub(target);
            const zAisx = this._eye.clone().normalize();
            const up = camera.up.clone().normalize();
            const xAisx = up.clone().cross(zAisx).normalize();
            //
            up.normalize().scale(movePrev.y - moveCurr.y);
            xAisx.normalize().scale(movePrev.x - moveCurr.x);
            up.add(xAisx);
            //
            const axis = up.clone().cross(zAisx).normalize();
            const quaternion = new Quat().setAxisAngle(axis, angle);
            this._eye.applyQuat(quaternion);
            camera.up.applyQuat(quaternion);
            //
            this._lastAxis = axis.clone();
            this._lastAngle = angle;
        }
        //assign movePrev position
        this._movePrev = this._moveCurr.clone();
    }
    /**
     * 
     */
    panCamera() {
        const panStart = this._panStart,
            panEnd = this._panEnd,
            panSpeed = this.panSpeed,
            camera = this.camera,
            dynfactor = this._dynamicDampingFactor,
            target = this.target,
            up = camera.up,
            eye = this._eye,
            mouseChange = panEnd.clone().sub(panStart);
        if (mouseChange.len()) {
            mouseChange.scale(eye.len() * panSpeed);
            const pan = eye.clone();
            pan.cross(up.clone()).normalize().scale(mouseChange.value[0]);
            pan.add(up.clone().normalize().scale(mouseChange.value[1]));
            camera.position.add(pan);
            target.add(pan);
            //如果是右键移动，则改变panStart
            //如果不是，则围绕中心点
            panStart.add(panEnd.clone().sub(panStart).scale(dynfactor));
        }
    }
    /**
     * 
     * @param {*} event 
     */
    mousewheel(event) {
        preventDefault(event);
        stopPropagation(event);
        //zfactor
        const fr = this._zoomStart._out[1];
        let to = fr;
        //使用timeout方式，延后执行update
        switch (event.deltaMode) {
            case 2: //zoom in pages
                to = fr + event.deltaY * 0.025;
                break;
            case 1: //zoom in lines
                to = fr - event.deltaY * 0.01;
                break;
            default: //undefined, 0, assume pixels
                to = fr - event.deltaY / 12500;
                break;
        }
        //x: oriV2.x, y: oriV2.y, x: this._moveCurr.x, y: this._moveCurr.y,
        if (!this.tween) {
            this.tween = new Tween()
                .form({ z: fr })
                .to({ z: to }, 800)
                .easing(Tween.Easing.Quadratic.In)
                .onUpdate((v) => {
                    this._zoomStart._out[1] = v.z;
                })
                .onComplete(() => {
                    this._global.fire('zoomend', event);
                    this.tween = null;
                });
            this.tween.start();
        }
    }
    /**
     * 
     */
    update() {
        const camera = this.camera,
            target = this.target;
        this._eye = camera.position.clone().sub(target);
        //1. rotate
        this.rotateCamera();
        //2. zoom
        this.zoomCamera();
        //3. update position and lookat center
        camera.position = target.clone().add(this._eye).value;
        camera.lookAt(target.value);
    }
}

module.exports = GlobalController;