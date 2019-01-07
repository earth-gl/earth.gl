/**
 * earth.gl 核心操作交互
 * https://github.com/mrdoob/three.js/blob/e88edaa2caea2b61c7ccfc00d1a4f8870399642a/examples/jsm/controls/TrackballControls.js
 * 
 */
const Quat = require("kiwi.matrix").Quat,
    Vec2 = require("kiwi.matrix").Vec2,
    Vec3 = require("kiwi.matrix").Vec3;

class Trackball {
    /**
    * @typedef {import("../camera/PerspectiveCamera")} PerspectiveCamera
    * @param {PerspectiveCamera} camera
    */
    constructor(camera) {
        /**
         * @type {PerspectiveCamera}
         */
        this.camera = camera;
        /**
         * render screen
         */
        this.screen = { left: 0, top: 0, width: 0, height: 0 };
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
        this._movePrev = new Vec2();
        this._moveCurr = new Vec2();
        this._lastAxis = new Vec3();
        this._lastAngle = 0;
        this._zoomStart = new Vec2();
        this._zoomEnd = new Vec2();
        this._touchZoomDistanceStart = 0;
        this._touchZoomDistanceEnd = 0;
        this._panStart = new Vec2();
        this._panEnd = new Vec2();
        /**
         * 
         */
        this._initialize();
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
        const camera = this.camera,
            moveCurr = this._moveCurr,
            movePrev = this._movePrev;
        //
        let moveDirection = new Vec3().set(
            moveCurr.value[0] - movePrev.value[0],
            moveCurr.value[1] - movePrev.value[1],
            0
        );
        //
        let angle = moveDirection.distance(new Vec3());
        //
        if (angle) {
            this._eye = camera.position.clone().sub(this.target);
            const eyeDirection = this._eye.clone().normalize();
            const objectUpDirection = camera.up.clone().normalize();
            const objectSidewaysDirection = objectUpDirection.clone().cross(eyeDirection).normalize();
            //
            objectUpDirection.scale(moveCurr.value[1] - movePrev.value[1]);
            objectSidewaysDirection.scale(moveCurr.value[0] - movePrev.value[0]);
            //
            moveDirection = objectUpDirection.clone().add(objectSidewaysDirection);
            const axis = moveDirection.clone().cross(this._eye).normalize();
            angle *= this.rotateSpeed;
            //
            const quaternion = new Quat().setAxisAngle(axis, angle);
            this._eye.applyQuat(quaternion);
            //修改camera up
            camera.up.applyQuat(quaternion);
            //
            this._lastAxis = axis.clone();
            this._lastAngle = angle;
        } else if (this._lastAngle) {
            this._lastAngle *= Math.sqrt(1.0 - this.dynamicDampingFactor);
            this._eye = camera.clone().sub(this.target);
            const quaternion = new Quat().setFromAxisAngle(this._lastAxis, this._lastAngle);
            this._eye.applyQuat(quaternion);
            camera.up.applyQuat(quaternion);
        }
        //assign movePrev position
        this._movePrev = moveCurr.clone();
    }


}

module.exports = Trackball;

