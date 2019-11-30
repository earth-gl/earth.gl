/**
 * 使用trackball算法，不能保证每次rotate和zoom后，与目标地点一致（缩放比例），参考heremap后改进
 * reference: 
 * https://github.com/heremaps/harp.gl/blob/65ebb99d20a7ab755fda6137a6e07cc282568645/%40here/harp-map-controls/lib/MapControls.ts
 * 
 */
const EventEmitter = require('../core/EventEmitter'),
    Ray = require('./../core/Ray'),
    { WGS84 } = require('./../core/Ellipsoid'),
    { Vec2, Vec3, Mat4, Quat } = require('kiwi.matrix'),
    { preventDefault, stopPropagation } = require('../utils/domEvent');

const State = {
    NONE: 'NONE',
    PAN: 'PAN',
    ROTATE: 'ROTATE',
    ORBIT: 'ORBIT',
    TOUCH: 'TOUCH'
}

class GlobalControl extends EventEmitter {
    /**
     * @typedef {import('./../Global')} Global
     * @param {Global} global 
     */
    constructor(global) {
        super();
        /**
         * @type {Global}
         */
        this._global = global;
        /**
         * This factor will be applied to the delta of the current mouse pointer position and the last
         * mouse pointer position: The result then will be used as an offset for the rotation then.
         * Default value is `0.1`.
         * @type {Number}
         */
        this.rotationMouseDeltaFactor = 0.1;
        /**
         * This factor will be applied to the delta of the current mouse pointer position and the last
         * mouse pointer position: The result then will be used as an offset to orbit the camera.
         * Default value is `0.1`.
         */
        this.orbitingMouseDeltaFactor = 0.1;
        /**
        * This factor will be applied to the delta of the current touch pointer position and the last
        * touch pointer position: The result then will be used as an offset to orbit the camera.
        * Default value is `0.1`.
        */
        this.orbitingTouchDeltaFactor = 0.1;
        /**
         * Set to `true` to enable orbiting and tilting through these controls.
         */
        this.tiltEnabled = true;
        /**
         * 
         */
        this.rotateEnabled = true;
        /**
         * enable an inertia dampening on zooming and panning.
         */
        this.inertiaEnabled = true;
        /**
         * Inertia damping duration for the zoom, in seconds.
         */
        this.zoomInertiaDampingDuration = 0.5;
        /**
         * Inertia damping duration for the panning, in seconds.
         */
        this.panInertiaDampingDuration = 1.0;
        /**
         * Duration in seconds of the camera animation when the tilt button is clicked. Independent of inertia
         */
        this.tiltToggleDuration = 0.5;
        /**
         * Camera tilt to the target when tilting from the `toggleTilt` public method.
         */
        this.tiltAngle = Math.PI / 4;
        /**
         * Duration of the animation to reset the camera to looking north, in seconds. Independent of inertia.
         */
        this.northResetAnimationDuration = 1.5;
        /**
         * Determines the zoom level delta for single mouse wheel movement. So after each mouse wheel
         * movement the current zoom level will be added or subtracted by this value. The default value
         * is `0.2` - this means that every 5th mouse wheel movement you will cross a zoom level.
         * **Note**: To reverse the zoom direction, you can provide a negative value.
         */
        this.zoomLevelDeltaOnMouseWheel = 0.2;
        /**
         * Zoom level delta when using the UI controls.
         */
        this.zoomLevelDeltaOnControl = 1.0;
        /**
         * 
         */
        this.minZoomLevel = 0;
        /**
         * 
         */
        this.maxZoomLevel = 20;
        /**
         * Determines the minimum camera height in meter.
         */
        this.minCameraHeight = 3;
        /**
         * Zoom level delta to apply when double clicking or double tapping. `0` disables the feature.
         */
        this.zoomLevelDeltaOnDoubleClick = 1.0;
        /**
         * mouse state
         */
        this.m_state = State.NONE;
        /**
         * Double click uses the OS delay through the double click event. Tapping is implemented locally
         * here in `MapControls` with this duration setting the maximum delay to define a double tap.
         * The value is in seconds. `300ms` is picked as the default value as jQuery does.
         */
        this.doubleTapTime = 0.3;
        /**
         * 记录domeElement信息
         * @type {Object}
         */
        this.screen = {};
        /**
         * @type {import('./../camera/PerspectiveCamera');
         */
        this.camera = global._camera;
        /**
         * @type {HTMLElement}
         */
        this.domElement = global.domElement;
        /**
         * 
         */
        this._inlizationDomeElement();
        /**
         * 
         */
        this._registDomInputDomEvents();
    }
    /**
     * 
     */
    _inlizationDomeElement() {
        const domElement = this.domElement;
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
    }
    /**
     * 
     */
    _registDomInputDomEvents() {
        const global = this._global;
        this.listenTo(global, 'dblclick', this._mouseDoubleClick, this);
        this.listenTo(global, 'contextmenu', this._contextMenu, this);
        this.listenTo(global, 'mousedown', this._mouseDown, this);
        this.listenTo(global, 'wheel', this._mouseWheel, this);
        this.listenTo(global, 'tochstart', this._touchStart, this);
        this.listenTo(global, 'tochend', this._touchEnd, this);
        this.listenTo(global, 'tochmove', this._touchMove, this);
    }
    /**
     * 
     * @param {MouseEvent} event 
     */
    _mouseDown(event) {
        if (this.m_state !== State.NONE) return;
        if (event.button === 0) {
            this.m_state = State.PAN;
        } else if (event.button === 1) {
            this.m_state = State.ROTATE;
        } else if (event.button === 2 && this.tiltEnabled) {
            this.m_state = State.ORBIT;
        } else {
            return;
        }
        stopPropagation(event);
        const global = this._global;
        //last position
        this.m_lastMousePosition = new Vec2().set(event.clientX, event.clientY);
        this.listenTo(global, 'mousemove', this._mouseMove, this);
        this.listenTo(global, 'mouseup', this._mouseUp, this);
        //clear up
        this.m_cleanupMouseEventListeners = () => {
            this.stopListen(global, 'mousemove', this._mouseMove, this);
            this.stopListen(global, 'mouseup', this._mouseUp, this);
        }
    }

    /**
     * @param {MouseEvent} event 
     */
    _mouseMove(event) {
        this.m_mouseDelta = new Vec2().set(event.clientX - this.m_lastMousePosition.x, event.clientY - this.m_lastMousePosition.y);
        if (this.m_state === State.PAN) {
            const { f3, t3 } = this.getWorldPositionWithElevation(
                this.m_lastMousePosition.x,
                this.m_lastMousePosition.y,
                event.clientX,
                event.clientY);

        }
    }

    _mouseUp(event) {

    }

    _mouseDoubleClick(event) {

    }

    _mouseWheel(event) {

    }

    _contextMenu(event) {

    }

    _touchStart(event) {

    }

    _touchEnd(event) {

    }

    _touchMove(event) {

    }
    /**
     * 
     * @param {Vec3} fromV3 
     * @param {Vec3} toV3 
     */
    _pan(fromV3, toV3) {
        // Assign the new animation start time.
        this.m_panAnimationStartTime = performance.now();
        this.m_lastRotateGlobeFromVector = fromV3.clone();
        this.m_lastRotateGlobeAxis = fromV3.clone().cross(toV3);
        this.m_lastRotateGlobeAngle = fromV3.clone().angle(toV3);
    }

    /**
     * https://github.com/heremaps/harp.gl/blob/65ebb99d20a7ab755fda6137a6e07cc282568645/%40here/harp-map-controls/lib/MapControls.ts#L1341
     * @param {*} fromX 
     * @param {*} fromY 
     * @param {*} toX 
     * @param {*} toY 
     */
    getWorldPositionWithElevation(fromX, fromY, toX, toY) {
        const width = this.screen.width,
            height = this.screen.height,
            frv3 = this.getNormalizeDeviceCoordinate(fromX, fromY, width, height),
            toV3 = this.getNormalizeDeviceCoordinate(toX, toY, width, height);
        const f3 = this.getRayCastWorldCoordinate(frv3),
            t3 = this.getRayCastWorldCoordinate(toV3);
        return { f3, t3 };
    }
    /**
     * NDC
     * @param {*} x ClientX of DomElement 
     * @param {*} y ClientY of DomElement 
     * @param {*} w Width of DomElement
     * @param {*} h Width of DomElement
     */
    getNormalizeDeviceCoordinate(x, y, w, h) {
        return new Vec3().set(
            2 * x / w - 1,
            -(2 * y / h) + 1,
            1
        );
    }
    /**
     * 
     * @param {Vec3} pndc 
     */
    getRayCastWorldCoordinate(pndc) {
        const pNDC = pndc.clone();
        //prepare the unprojection matrix which projects from NDC space to camera space, 
        //and takes the current rotation of the camera into account
        //unproject screen point to camera space point
        const p = this._NDCToSpaceCoordinate(pNDC);
        const direction = p.sub(this.camera.position.clone()).normalize();
        const ray = new Ray(this.camera.position.clone(), direction);
        return ray.intersectSphere(WGS84);
    }
    /**
     * 
     * @param {Vec3} pndc 
     * @returns {Vec3}
     */
    _NDCToSpaceCoordinate(pndc){
        const m = this.camera.ViewMatrix.clone().multiply(this.camera.ProjectionMatrix.clone().invert());
        const p5 = pndc.clone().applyMatrix4(m);
        return p5;
    }
    /**
     * 
     * @param {Vec3} space 
     * @returns {Vec3}
     */
    _spaceToNDCCoordinate(space){
        const p4 = space.clone().applyMatrix4(this.camera.ViewProjectionMatrix);
        return p4;
    }


}

module.exports = GlobalControl;