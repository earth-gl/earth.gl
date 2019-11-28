/**
 * earth.gl 核心操作交互
 * https://github.com/mrdoob/three.js/blob/e88edaa2caea2b61c7ccfc00d1a4f8870399642a/examples/jsm/controls/TrackballControls.js
 */
const { Quat, Vec2, Vec3 } = require('kiwi.matrix'),
    { WGS84 } = require('./../core/Ellipsoid'),
    EventEmitter = require('../core/EventEmitter'),
    { preventDefault, stopPropagation } = require('../utils/domEvent');
/**
 * @class
 */
class GlobalController extends EventEmitter {
    /**
    * @typedef {import("../camera/PerspectiveCamera")} PerspectiveCamera
    * @param {PerspectiveCamera} camera
    */
    constructor(camera, global) {
        super();
        /**
         * @type {PerspectiveCamera}
         */
        this.camera = camera;
        /**
         * @type {GScene}
         */
        this._global = global;
        /**
         * render screen
         */
        this.screen = {};
        /**
         * 
         */
        this.zoomSpeeds = [];
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
        this._movePrev = new Vec2();
        /**
         * @type {Vec2}
         */
        this._moveCurr = new Vec2();
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
        this._zoomStart = new Vec2();
        /**
         * @type {Vec2}
         */
        this._zoomEnd = new Vec2();
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
        this._panStart = new Vec2();
        /**
         * @type {Vec2}
         */
        this._panEnd = new Vec2();
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
        for (let i = 0; i < 24; i++) {
            const offset = i;
            this.zoomSpeeds[i] = 64.0 / (1 << offset);
        }
        //camera clone
        this.target0 = this.target.clone();
        this.position0 = this.camera.position.clone();
        this.up0 = this.camera.up.clone();
        //screen
        this.screen.left = 0;
        this.screen.top = 0;
        this.screen.width = window.innerWidth;
        this.screen.height = window.innerHeight;
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
     * @returns {Vec2} -
     */
    getMouseOnScreen(pageX, pageY) {
        return new Vec2().set(
            (pageX - this.screen.left) / this.screen.width,
            (pageY - this.screen.top) / this.screen.height
        );
    }
    /**
     * 
     * @param {*} pageX 
     * @param {*} pageY 
     */
    getMouseOnCircle(pageX, pageY) {
        return new Vec2().set(
            ((pageX - this.screen.width * 0.5 - this.screen.left) / (this.screen.width * 0.5)),
            ((this.screen.height + 2 * (this.screen.top - pageY)) / this.screen.width)
        );
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
        //使用timeout方式，延后执行update
        switch (event.deltaMode) {
            case 2: //zoom in pages
                this._zoomStart._out[1] = event.deltaY * 0.025;
                break;
            case 1: //zoom in lines
                this._zoomStart._out[1] -= event.deltaY * 0.01;
                break;
            default: //undefined, 0, assume pixels
                this._zoomStart._out[1] -= event.deltaY / 12500;
                break;
        }
        this._global.fire('zoomend', event);
        //fire event delay
        // this._zoomEventEnd = this._zoomEventEnd || setTimeout(() => {
        //     that._zoomEventEnd = null;
        // }, 800);
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