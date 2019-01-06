/**
 * 用于
 * 1. 注册dom事件
 * 1. 组织earth.gl元素
 * 2. 管理资源调度
 * 3. 动态构造和消费数据
 * 特点：
 * earth.gl scene 应用场景固定
 * 1. 固定加载Global
 * 2. 固定使用perspectiveCamera
 * 3. 固定注册dom
 * earth.gl scene 可自定部分
 * 1. 可自定义加载高程
 * 2. 可自定义加载管线
 * 3. 可自定义加载建筑
 * 4. 提供camera distance，用于确定lod
 */
const merge = require("./../utils/merge"),
    { PHYSICAL_CONSTANT } = require('../utils/util'),
    Event = require("./../utils/Event"),
    Earth = require("./../scene/Earth"),
    now = require("./../utils/now"),
    PerspectiveCamera = require("./../camera/PerspectiveCamera"),
    { addDomEvent, removeDomEvent, preventDefault, stopPropagation, domEventNames } = require("../utils/domEvent");

const CONTEXT_OPTIONS = {
    alpha: false,
    depth: true,
    stencil: true,
    antialias: false,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    failIfMajorPerformanceCaveat: false
};

/**
 * @class Scene
 */
class GScene extends Event {
    /**
     * 
     * @param {Object} [options]
     * @param {WebGLRenderingContext} [options.gl]
     * @param {Canvas} [options.canvas]
     * @param {Canvas} [options.width]
     * @param {Canvas} [options.height]
     * @param {Object} [options.contextOptions]
     * @param {Boolean} [options.shadow=false]
     */
    constructor(options) {
        super();
        /**
         * @type {Canvas}
         */
        this._canvas = options.canvas;
        /**
         * @type {Object}
         */
        this._contextOptions = merge(CONTEXT_OPTIONS, options.contextOptions || {});
        /**
         * @type {WebGLRenderingContext}
         */
        this._gl = options.gl || this._canvas.getContext('webgl', contextOptions) || this._canvas.getContext('experimental-webgl', contextOptions);
        /**
         * @type {Number}
         */
        this._width = options.width;
        /**
         * @type {Number}
         */
        this._height = options.height;
        /**
         * @type {Number} devicePixelRatio, used in viewport
         */
        this._devicePixelRatio = window.devicePixelRatio;
        /**
         * 
         */
        this._shadow = options.shadow || false;
        /**
         * 
         */
        this._camera = new PerspectiveCamera(60, this._width / this._height, 0.01, PHYSICAL_CONSTANT.EARTH_RADIUS_X);
        /**
         * initialization
         */
        this._initialize();
        /**
         * 加载显示资源
         */
        this._initComponents();
        /**
         * 注册dom时间，操作相机矩阵
         */
        this._registerDomEvents();
    }

    _initialize() {
        //gl context
        const width = this._width,
            height = this._height,
            devicePixelRatio = this._devicePixelRatio,
            camera = this._camera,
            gl = this._gl;
        camera.position = [0, 0, PHYSICAL_CONSTANT.EARTH_RADIUS_X * 3];
        camera.lookAt([0, 0, 0]);
        //adjust for devicePixelRatio
        gl.viewport(0, 0, width * devicePixelRatio, height * devicePixelRatio);
    }

    /**
     * 
     */
    _initComponents() {
        const gl = this._gl;
        this._earth = new Earth(gl);
    }

    _registerDomEvents() {
        const dom = this._canvas;
        addDomEvent(dom, domEventNames, this._handleDomEvent, this);
    }

    /**
     * refrenece:
     * https://github.com/maptalks/maptalks.js/blob/169cbed69f3e0db1801d559511dad6646a227224/src/map/Map.DomEvents.js#L191
     * handle dom events
     * @param {} e 
     */
    _handleDomEvent(e) {
        //dom event type
        const type = e.type;
        //ignore click lasted for more than 300ms.
        if (type === 'mousedown' || (type === 'touchstart' && e.touches.length === 1)) {
            this._mouseDownTime = now();
            this._startContainerPoint = [e.x,e.y];
        } else if (type === "mousemove") {
            const downTime = this._mouseDownTime,
                endTime = now();
            const deltaTime =!downTime?1:downTime - endTime;

        }else if (type === 'click' || type === 'touchend' || type === "mouseup") {
            //mousedown | touchstart propogation is stopped
            if (!this._mouseDownTime) return;
            //
            const downTime = this._mouseDownTime;
            delete this._mouseDownTime;
            const time = now();
        }
        this._fireDOMEvent(this, e, type);
    }

    _getActualEvent(e) {
        return e.touches && e.touches.length > 0 ? e.touches[0] : e.changedTouches && e.changedTouches.length > 0 ? e.changedTouches[0] : e;
    }

    _parseEvent(e, type) {
        if (!e) return null;
        let eventParam = {
            domEvent: e
        };
        if (type !== 'keypress') {
            const actual = this._getActualEvent(e);
            //get webgl rotate radius
        }
    }

    _fireDOMEvent(target, e, type) {
        this.fire(type)
    }

    render() {
        const gl = this._gl,
            camera = this._camera,
            earth = this._earth;
        //
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT);
        //render object
        earth.render(camera);
    }

}

module.exports = GScene;