/**
 * 用于
 * 1. 注册dom事件
 * 1. 组织earth.gl元素
 * 2. 管理资源调度
 * 3. 动态构造和消费数据
 */
const merge = require("../utils/merge"),
    Event = require("../utils/Event"),
    { addDomEvent, removeDomEvent, domEventNames } = require("../utils/domEvent");

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
class Scene extends Event {
    /**
     * 
     * @param {Object} [options]
     * @param {Canvas} options.canvas
     * @param {Object} [options.contextOptions]
     * @param {Boolean} [options.shadow=false]
     */
    constructor(options) {
        /**
         * @type {Canvas}
         */
        this._canvas = options.canvas;
        /**
         * @type {Object}
         */
        this._contextOptions = merge(CONTEXT_OPTIONS, options.contextOptions || {});
        /**
         * 
         */
        this._shadow = options.shadow || false;
    }

}

module.exports = Scene;