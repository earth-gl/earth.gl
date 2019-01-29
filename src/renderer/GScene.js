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
const merge = require('./../utils/merge'),
    TrackballController = require('../core/TrackballController'),
    maximumRadius = require('./../core/Ellipsoid').WGS84.maximumRadius,
    Eventable = require('./../core/Eventable'),
    GGlobal = require('./GGlobal'),
    //GLoader = require('./GLoader'),
    Quadtree = require('./../core/Quadtree'),
    //GSurface = require('./GSurface'),
    PerspectiveCamera = require('./../camera/PerspectiveCamera'),
    { addDomEvent, domEventNames } = require('../utils/domEvent');
/**
 * 
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
class GScene extends Eventable {
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
         * @type {Quadtree}
         */
        this._quadtree = new Quadtree(this._camera);
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
    /**
     * 
     */
    _initialize() {
        //gl context
        const width = this._width,
            height = this._height,
            // devicePixelRatio = this._devicePixelRatio,
            devicePixelRatio = 1,
            camera = this._camera,
            canvas = this._canvas,
            gl = this._gl;
        //setting camera position at 2*raduis
        camera.position = [0, 0, maximumRadius * 2.2];
        camera.lookAt([0, 0, 0]);
        //adjust for devicePixelRatio
        canvas.width = canvas.clientWidth * devicePixelRatio;
        canvas.height = canvas.clientHeight * devicePixelRatio;
        gl.viewport(0, 0, width * devicePixelRatio, height * devicePixelRatio);
    }
    /**
     * 
     */
    _initComponents() {
        const gl = this._gl;
        //create earth
        this._earth = new GGlobal(gl);
        //create surface
        //this._surface = new GSurface(gl);
        //this._surface.update();
        //create test gltfloader
        //this._gltf = new GLoader();
        //this._gltf.init(gl);
    }
    /**
     * 
     */
    _registerDomEvents() {
        const canvas = this._canvas,
            camera = this._camera;
        addDomEvent(canvas, domEventNames, this._handleDomEvent, this);
        this._trackball = new TrackballController(camera,this);
        const trackball = this._trackball;
        trackball.update();
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
     * 
     */
    render() {
        const gl = this._gl,
            trackball = this._trackball,
            camera = this._camera,
            //gltf = this._gltf,
            //quadtree = this._quadtree,
            // surface = this._surface,
            earth = this._earth;
        //gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        //update camera
        trackball.update();
        //render earth
        earth.render(camera);
        //render gltf
        //gltf.render(camera);
        //render surface (terrain)
        //surface.render(camera);
        // for(var i = 0,len = primitives;i<len;i++)
        //     primitives[i].render(camera);
    }
}

module.exports = GScene;