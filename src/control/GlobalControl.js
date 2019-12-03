/**
 * earth.gl 核心操作交互
 * https://github.com/mrdoob/three.js/blob/e88edaa2caea2b61c7ccfc00d1a4f8870399642a/examples/jsm/controls/TrackballControls.js
 */
const { Quat, Vec2, Vec3, Mat4 } = require('kiwi.matrix'),
    Ray = require('../core/Ray'),
    Tween = require('../core/Tween'),
    { PSEUDOMERCATOR } = require('../core/Ellipsoid'),
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
        return ray.intersectSphere(PSEUDOMERCATOR);
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
     * @param {Vec3} from , space coordinate on earth
     * @param {Vec3} to , space coordinate on earth
     */
    _pan(from, to) {
        // Assign the new animation start time.
        this.m_panAnimationStartTime = performance.now();
        this.m_lastRotateGlobeFromVector = from.clone();
        this.m_lastRotateGlobeAxis = from.clone().cross(to).normalize();
        this.m_lastRotateGlobeAngle = from.angle(to);
        //旋转四元数
        this.m_rotateGlobeQuaternion = new Quat().setAxisAngle(this.m_lastRotateGlobeAxis, -this.m_lastRotateGlobeAngle);
        const offset = this.camera.position.clone().sub(this.target);
        offset.applyQuat(this.m_rotateGlobeQuaternion);
        this.camera.up.applyQuat(this.m_rotateGlobeQuaternion);
        this.camera.position = offset.add(this.target).value;
    }
    /**
     * https://github.com/heremaps/harp.gl/blob/7d23554e9e00626c9e14e5edf995a30daff12523/%40here/harp-mapview/lib/Utils.ts#L104
     * @param {Number} level 
     * @param {Vec3} targetSpace 
     */
    _zoom(level, clientX, clientY) {
        // const target = this.zoomTarget.clone();
        const delta = this.camera.position.len() - PSEUDOMERCATOR.maximumRadius - this._global._quadtree.maximumCameraHeight(level);
        //tween
        if (!this.tween) {
            const cached = { pre : this._rayTrackOnSphere(clientX, clientY), len :0 };
            console.log(cached.pre.value);
            console.log("===============================================");
            this.tween = new Tween()
                .form({ len: 0 })
                .to({ len: delta }, 800)
                .easing(Tween.Easing.Quadratic.In)
                .onUpdate((v) => {
                    const eyeDirection = this.camera.position.clone().sub(this.target).normalize();
                    const deltaDistance = v.len - cached.len;
                    const delta = eyeDirection.scale(deltaDistance);
                    this.camera.position = this.camera.position.clone().sub(delta).value;
                    const target = this._rayTrackOnSphere(clientX, clientY);
                    this._pan(cached.pre, target);
                    //cached.pre = target;
                    cached.len = v.len;
                    console.log(cached.pre.value);
                })
                .onComplete(() => {
                    this._global.fire('zoomend', event);
                    this.tween = null;
                });
            this.tween.start();
        }
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
        if (this.m_state === STATE.PAN) {
            const form = this._rayTrackOnSphere(this.m_lastMousePosition.x, this.m_lastMousePosition.y);
            const to = this._rayTrackOnSphere(event.clientX, event.clientY);
            this._pan(form, to);
            this.m_lastMousePosition.set(event.clientX, event.clientY);
        }
    }
    /**
     * 
     * @param {*} event 
     */
    mouseup(event) {
        this.m_state = STATE.NONE;
        this.stopListen(this._global, 'mousemove', this.mousemove, this);
        this.stopListen(this._global, 'mouseup', this.mouseup, this);
        this.fire('dragEnd', event)
    }
    /**
     * 
     * @param {MouseEvent} event 
     */
    mousewheel(event) {
        //缩放中心
        this.zoomTarget = this._rayTrackOnSphere(event.clientX, event.clientY);
        this.zoomLevelTargeted = this._global.getLevel();
        const zoomLevel = this.zoomLevelTargeted + (event.deltaY > 0 ? -1 : 1);
        this.m_startZoom = this._global.getLevel();
        this.m_zoomAnimationStartTime = performance.now();
        this.m_zoomDeltaRequested = zoomLevel - this.zoomLevelTargeted;
        this._zoom(zoomLevel, event.clientX, event.clientY);
        preventDefault(event);
        stopPropagation(event);
    }
}

module.exports = GlobalController;