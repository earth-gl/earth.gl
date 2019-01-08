/**
 * earth.gl 核心操作交互
 * https://github.com/mrdoob/three.js/blob/e88edaa2caea2b61c7ccfc00d1a4f8870399642a/examples/jsm/controls/TrackballControls.js
 */
const Quat = require("kiwi.matrix").Quat,
    Vec2 = require("kiwi.matrix").Vec2,
    Vec3 = require("kiwi.matrix").Vec3;

const { preventDefault, stopPropagation } = require("../utils/domEvent"),
    Event = require("./Event");

class Trackball extends Event {
    /**
    * @typedef {import("../camera/PerspectiveCamera")} PerspectiveCamera
    * @param {PerspectiveCamera} camera
    */
    constructor(camera) {
        super();
        /**
         * @type {PerspectiveCamera}
         */
        this.camera = camera;
        /**
         * render screen
         */
        this.screen = {};
        /**
         * 
         */
        this.rotateSpeed = 1.0;
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
        this._dynamicDampingFactor = 0.2;
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

    _initialize() {
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

    _registerEvent() {
        this.on("mousedown", this.mousedown, this);
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

    getMouseOnCircle(pageX, pageY) {
        return new Vec2().set(
            ((pageX - this.screen.width * 0.5 - this.screen.left) / (this.screen.width * 0.5)),
            ((this.screen.height + 2 * (this.screen.top - pageY)) / this.screen.width)
        );
    }

    rotateCamera() {
        const target = this.target,
            camera = this.camera,
            rotateSpeed = this.rotateSpeed,
            moveCurr = this._moveCurr,
            movePrev = this._movePrev;
        let moveDirection = new Vec3().set(
            moveCurr.x - movePrev.x,
            moveCurr.y - movePrev.y,
            0
        );
        let angle = moveDirection.len();
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
        } else if (this._lastAngle) {
            // this._lastAngle *= Math.sqrt(1.0 - this.dynamicDampingFactor);
            // this._eye = camera.position.clone().sub(target);
            // const quaternion = new Quat().setAxisAngle(this._lastAxis, this._lastAngle);
            // this._eye.applyQuat(quaternion);
            // camera.up.applyQuat(quaternion);
        }
        //assign movePrev position
        this._movePrev = moveCurr.clone();
    }

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

    mousedown(event) {
        preventDefault(event);
        stopPropagation(event);
        //rotate
        this._moveCurr = this.getMouseOnCircle(event.pageX, event.pageY);
        this._movePrev = this._moveCurr.clone();
        //pan
        this._panStart = this.getMouseOnScreen(event.pageX, event.pageY);
        this._panEnd = this._panStart.clone();
        //
        this.on("mousemove", this.mousemove, this);
        this.on("mouseup", this.mouseup, this);
    }

    mousemove(event) {
        //rotate
        this._movePrev = this._moveCurr.clone();
        this._moveCurr = this.getMouseOnCircle(event.pageX, event.pageY);
        //pan
        this._panEnd = this.getMouseOnScreen(event.pageX, event.pageY);
    }

    mouseup(event) {
        this.off("mousemove", this.mousemove, this);
        this.off("mouseup", this.mouseup, this);
        this.fire("dragEnd",event,true);
    }

    update() {
        const camera = this.camera,
            target = this.target;
        this._eye = camera.position.clone().sub(target);
        //1. pan
        this.rotateCamera();
        //
        camera.position = target.clone().add(this._eye).value;
        camera.lookAt(target.value);
        //2. rotate
        //3. 
        camera._update();
    }
}

module.exports = Trackball;

