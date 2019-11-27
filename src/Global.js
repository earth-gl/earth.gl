/**
 * 计算屏幕坐标到大地坐标
 * https://github.com/AnalyticalGraphicsInc/cesium/blob/c36e4d37f9a55993781922887d6acd2ed7f7b54c/Source/Scene/SceneTransforms.js
 * 
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
const merge = require('./utils/merge'),
    GlobalSurface = require('./scene/GlobalSurface'),
    TrackballController = require('./core/TrackballController'),
    { WGS84 } = require('./core/Ellipsoid'),
    Geographic = require('./core/Geographic'),
    maximumRadius = require('./core/Ellipsoid').WGS84.maximumRadius,
    Eventable = require('./core/Eventable'),
    Quadtree = require('./core/Quadtree'),
    PerspectiveCamera = require('./camera/PerspectiveCamera'),
    { addDomEvent, domEventNames } = require('./utils/domEvent');
/**
 * default webgl context options
 */
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
class Global extends Eventable {
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
        this._gl = options.gl || this._canvas.getContext('webgl', this._contextOptions) || this._canvas.getContext('experimental-webgl', this._contextOptions);
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
         * @type {Trackball}
         */
        this._trackball = null;
        /**
         * 
         */
        this._shadow = options.shadow || false;
        /**
         * 
         */
        this._camera = new PerspectiveCamera(60, this._width, this._height, 0.01, maximumRadius * 3);
        /**
         * 计算瓦片规则
         * @type {Quadtree}
         */
        this._quadtree = new Quadtree(this._camera, this);
        /**
         * timestampe scale (delta time)
         */
        this._timeStampScale = 0.001;
        /**
         * store current timestamp
         */
        this._timeStamp0 = performance.now();
        /**
         * @type {GlobalSurface[]}
         */
        this._globalSurfaces = [];
        /**
         * initialization
         */
        this._initialize();
        /**
         * 注册dom时间，操作相机矩阵
         */
        this._registerDomEvents();
    }
    /**
     * 
     */
    _initialize() {
        //gl context
        const width = this._width,
            height = this._height,
            devicePixelRatio = this._devicePixelRatio,
            camera = this._camera,
            canvas = this._canvas,
            gl = this._gl;
        //setting camera position at wuhan
        camera.position = [-5441407.598258391, 12221601.56749016, 8664632.212488363];
        camera.lookAt([0, 0, 0]);
        //adjust for devicePixelRatio
        canvas.width = canvas.clientWidth * devicePixelRatio;
        canvas.height = canvas.clientHeight * devicePixelRatio;
        gl.viewport(0, 0, width * devicePixelRatio, height * devicePixelRatio);
    }
        /**
     * 
     */
    _registerDomEvents() {
        const canvas = this._canvas,
            camera = this._camera;
        addDomEvent(canvas, domEventNames, this._handleDomEvent, this);
        this._trackball = new TrackballController(camera, this);
        this._trackball.update();
        this.fire('loaded', {}, true);
    }
    /**
     * refrenece:
     * https://github.com/maptalks/maptalks.js/blob/169cbed69f3e0db1801d559511dad6646a227224/src/map/Map.DomEvents.js#L191
     * handle dom events
     * @param {Event} e 
     */
    _handleDomEvent(e) {
        //dom event type
        const type = e.type;
        //handle directly
        this.fire(type, e, true);
    }
    /**
     * get current zoom level
     */
    getLevel() {
        return this._quadtree._level;
    }
    /**
     * 
     */
    centerTo(lng, lat, height = 10000) {
        const camera = this._camera;
        const space = WGS84.geographicToSpace(new Geographic(lng, lat, height, true));
        camera.position = space._out;
    }
    /**
     * @type {Object} o
     */
    add(o) {
        const gl = this._gl;
        if (o instanceof GlobalSurface) {
            o.hook(gl, this._quadtree);
            gltfs.push(o);
        }
        //broadcast quadtree events
        this._quadtree.broadcast();
    }
    /**
     * reference
     * https://github.com/mdn/webgl-examples/blob/ea1c73ff3ec8d069d890cda0495052bb44a8b073/tutorial/sample6/webgl-demo.js#L283
     */
    render() {
        //
        const gl = this._gl,
            timeStampScale = this._timeStampScale,
            timeStamp0 = this._timeStamp0,
            timeStamp = (performance.now() - timeStamp0) * timeStampScale || 0,
            trackball = this._trackball,
            camera = this._camera,
            gltfs = this._gltfs,
            tiles3ds = this._tiles3ds,
            surfaces = this._surfaces;
        //gl state
        gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
        gl.clearDepth(1.0);                 // Clear everything
        gl.enable(gl.DEPTH_TEST);           // Enable depth testing
        gl.depthFunc(gl.LEQUAL);
        gl.enable(gl.CULL_FACE);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        //update trackball and camera
        trackball.update();
        //render surface
        // surfaces.forEach(surface => {
        //     surface.render(camera, timeStamp);
        // });
    }
}

module.exports = Global;