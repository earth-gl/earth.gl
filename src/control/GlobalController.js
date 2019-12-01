/**
 * earth.gl 核心操作交互
 * https://github.com/mrdoob/three.js/blob/e88edaa2caea2b61c7ccfc00d1a4f8870399642a/examples/jsm/controls/TrackballControls.js
 */
const { Quat, Vec2, Vec3 } = require('kiwi.matrix'),
    rangeValue = require('./../utils/rangeValue'),
    Ray = require('./../core/Ray'),
    Tween = require('./../core/Tween'),
    { WGS84 } = require('./../core/Ellipsoid'),
    EventEmitter = require('../core/EventEmitter'),
    { preventDefault, stopPropagation } = require('../utils/domEvent');
/**
 * https://github.com/JonLim/three-trackballcontrols/blob/master/index.js
 * @class
 */
class GlobalController extends EventEmitter {
    /**
    * @typedef {import("../camera/PerspectiveCamera")} PerspectiveCamera
    * @typedef {import('./../Global')} Global
    * @param {PerspectiveCamera} camera
    * @param {Global} global
    */
    constructor(global) {
        super();
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
         * @type {Vec2}
         */
        this._movePrev = new Vec3();
        /**
         * @type {Vec2}
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
     * 
     * @param {*} pageX 
     * @param {*} pageY 
     * @returns {Vec3} -
     */
    getMouseOnScreen(pageX, pageY) {
        return new Vec3().set(
            (pageX - this.screen.left) / this.screen.width,
            (pageY - this.screen.top) / this.screen.height,
            1
        );
    }
    /**
     * 
     * @param {*} x 
     * @param {*} y 
     * @param {*} w 
     * @param {*} h 
     */
    _getNormalizeDeviceCoordinate(pageX, pageY) {
        return new Vec3().set(
            ((pageX - this.screen.width * 0.5 - this.screen.left) / (this.screen.width * 0.5)),
            ((this.screen.height + 2 * (this.screen.top - pageY)) / this.screen.width),
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
     * @param {Number} pageX 
     * @param {Number} pageY 
     * @returns {Vec3} space coord
     */
    _rayTrackOnSphere(pageX, pageY) {
        const pndc = this._getNormalizeDeviceCoordinate(pageX, pageY);
        const space = this._normalizedDeviceCoordinateToSpaceCoordinate(pndc);
        const d = space.sub(this.camera.position.clone()).normalize();
        const ray = new Ray(this.camera.position.clone(), d);
        return ray.intersectSphere(WGS84);
    }

    /**
     * }{修正
     * 基于Ray，构建鼠标点与视角点的直线和球体的相交
     * @param {*} pageX 
     * @param {*} pageY 
     */
    getMouseOnCircle(pageX, pageY) {
        const space = this._rayTrackOnSphere(pageX, pageY);
        return space !== null?this._spaceCoordinateToNormaziledDeveiceCoordinate(space):null;
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
    }
    /**
     * 
     */
    rotateCamera() {
        if(this._moveCurr === null || this._movePrev === null) return;
        const target = this.target, //默认是 (0,0,0),
            camera = this.camera,
            rs = WGS84.oneOverMaximumRadius * (camera.position.distance(this.target) - WGS84.maximumRadius), //rotate speed
            moveCurr = this._moveCurr,
            movePrev = this._movePrev;
        let moveDirection = new Vec3().set(
            movePrev.x - moveCurr.x,
            movePrev.y - moveCurr.y,
            0);
        //set rotate direction as -1
        let angle = -moveDirection.len();
        if (angle) {
            this._eye = camera.position.clone().sub(target);
            const eyeDirection = this._eye.clone().normalize();
            const objectUpDirection = camera.up.clone().normalize();
            const objectSidewaysDirection = objectUpDirection.clone().cross(eyeDirection).normalize();
            objectUpDirection.normalize().scale(movePrev.y - moveCurr.y);
            objectSidewaysDirection.normalize().scale(movePrev.x - moveCurr.x);
            objectUpDirection.add(objectSidewaysDirection);
            moveDirection = objectUpDirection.clone();
            const axis = moveDirection.clone().cross(this._eye).normalize();
            angle *= rs;
            const quaternion = new Quat().setAxisAngle(axis, angle);
            this._eye.applyQuat(quaternion);
            camera.up.applyQuat(quaternion);
            this._lastAxis = axis.clone();
            this._lastAngle = angle;
            //assign movePrev position
            this._movePrev = moveCurr.clone();
        }
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
    mousedown(event) {
        preventDefault(event);
        stopPropagation(event);
        //rotate
        this._moveCurr = this.getMouseOnCircle(event.pageX, event.pageY);
        this._movePrev = this._moveCurr.clone();
        //pan
        this._panStart = this.getMouseOnScreen(event.pageX, event.pageY);
        this._panEnd = this._panStart.clone();
        //zoom
        this._zoomStart = this.getMouseOnScreen(event.pageX, event.pageY);
        this._zoomEnd = this._zoomStart.clone();
        //resgister document events
        this.listenTo(this._global, 'mousemove', this.mousemove, this);
        this.listenTo(this._global, 'mouseup', this.mouseup, this);
    }
    /**
     * 
     * @param {*} event 
     */
    mousemove(event) {
        //rotate
        this._movePrev = this._moveCurr.clone();
        this._moveCurr = this.getMouseOnCircle(event.pageX, event.pageY);
        //pan
        this._panEnd = this.getMouseOnScreen(event.pageX, event.pageY);
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
     * @param {*} event 
     */
    mousewheel(event) {
        preventDefault(event);
        stopPropagation(event);
        //
        this._movePrev = this.getMouseOnCircle(event.pageX, event.pageY);
        this._moveCurr = this._movePrev.clone();
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
                .form({ x: event.pageX, y: event.pageY, z: fr })
                .to({ x: this.centerX, y: this.centerY, z: to }, 800)
                .easing(Tween.Easing.Quadratic.In)
                .onUpdate((v) => {
                    //rotate
                    this._movePrev = this._moveCurr.clone();
                    this._moveCurr = this.getMouseOnCircle(v.x, v.y);
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
        camera._update();
        //4. reset zoomStart
        this._zoomStart = this._zoomEnd.clone();
    }
}

module.exports = GlobalController;