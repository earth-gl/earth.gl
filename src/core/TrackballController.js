/**
 * earth.gl 核心操作交互
 * https://github.com/mrdoob/three.js/blob/e88edaa2caea2b61c7ccfc00d1a4f8870399642a/examples/jsm/controls/TrackballControls.js
 */
const Eventable = require('./Eventable'),
    { Quat, Vec2, Vec3 } = require('kiwi.matrix'),
    { preventDefault, stopPropagation } = require('./../utils/domEvent');
/**
 * @class
 */
class Trackball extends Eventable {
    /**
    * @typedef {import("../camera/PerspectiveCamera")} PerspectiveCamera
    * @param {PerspectiveCamera} camera
    */
    constructor(camera, scene) {
        super();
        /**
         * @type {PerspectiveCamera}
         */
        this.camera = camera;
        /**
         * @type {GScene}
         */
        this.scene = scene;
        /**
         * render screen
         */
        this.screen = {};
        /**
         * store rotate speeds in each level
         */
        this.rotateSpeeds = [];
        /**
         * 
         */
        this.zoomSpeed = 1.2;
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
        //rotation speed, above level 3, speed is normal
        this.rotateSpeeds = [1.0, 1.0, 1.0, 1.0];
        for (let i = 4; i <= 22; i++) {
            const offset = i - 3;
            this.rotateSpeeds[i] = 1.0 / (1 << offset);
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
        const scene = this.scene;
        //pan map
        scene.on('mousedown', this.mousedown, this);
        //zoom map
        scene.on('mousewheel', this.mousewheel, this);
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
        const factor = 1.0 + (this._zoomEnd.y - this._zoomStart.y) * this.zoomSpeed;
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
        const level = this.scene.getLevel(),
            target = this.target,
            camera = this.camera,
            rotateSpeed = this.rotateSpeeds[level],
            moveCurr = this._moveCurr,
            movePrev = this._movePrev;
        let moveDirection = new Vec3().set(
            movePrev.x - moveCurr.x,
            movePrev.y - moveCurr.y,
            //moveCurr.x - movePrev.x,
            //moveCurr.y - movePrev.y,
            0
        );
        //set rotate direction as -1
        let angle = -moveDirection.len();
        if (angle) {
            this._eye = camera.position.clone().sub(target);
            const eyeDirection = this._eye.clone().normalize();
            const objectUpDirection = camera.up.clone().normalize();
            const objectSidewaysDirection = objectUpDirection.clone().cross(eyeDirection).normalize();
            //
            objectUpDirection.normalize().scale(movePrev.y - moveCurr.y);
            objectSidewaysDirection.normalize().scale(movePrev.x - moveCurr.x);
            objectUpDirection.add(objectSidewaysDirection);
            moveDirection = objectUpDirection.clone();
            const axis = moveDirection.clone().cross(this._eye).normalize();
            angle *= rotateSpeed;
            //
            const quaternion = new Quat().setAxisAngle(axis, angle);
            this._eye.applyQuat(quaternion);
            //修改camera up
            camera.up.applyQuat(quaternion);
            //
            this._lastAxis = axis.clone();
            this._lastAngle = angle;
        }
        //assign movePrev position
        this._movePrev = moveCurr.clone();
    }
    /**
     * 
     */
    panCamera() {
        const panStart = this._panStart,
            panEnd = this._panEnd,
            panSpeed = this.panSpeed,
            camera = this.camera,
            dynamicDampingFactor = this._dynamicDampingFactor,
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
            panStart.add(panEnd.clone().sub(panStart).scale(dynamicDampingFactor));
        }
    }
    /**
     * 
     * @param {*} event 
     */
    mousedown(event) {
        preventDefault(event);
        stopPropagation(event);
        //
        const scene = this.scene;
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
        scene.on('mousemove', this.mousemove, this);
        scene.on('mouseup', this.mouseup, this);
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
        const scene = this.scene;
        scene.off('mousemove', this.mousemove, this);
        scene.off('mouseup', this.mouseup, this);
        scene.fire('dragEnd', event, true);
    }
    /**
     * 
     * @param {*} event 
     */
    mousewheel(event) {
        preventDefault(event);
        stopPropagation(event);
        const scene = this.scene;
        switch (event.deltaMode) {
            case 2: //zoom in pages
                this._zoomStart._out[1] = event.deltaY * 0.025;
                break;
            case 1: //zoom in lines
                this._zoomStart._out[1] -= event.deltaY * 0.01;
                break;
            default: //undefined, 0, assume pixels
                this._zoomStart._out[1] -= event.deltaY * 0.00015;
                break;
        }
        scene.fire('zoomend', event, true);
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
        //update position and lookat center
        camera.position = target.clone().add(this._eye).value;
        camera.lookAt(target.value);
        camera._update();
        //clear zoom
        this._clearState();
    }
    /**
     * 
     */
    _clearState() {
        this._zoomStart = this._zoomEnd.clone();
    }
}

module.exports = Trackball;

