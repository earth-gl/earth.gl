import { Globe } from './../../globe/Globe';
import { IRenderer } from "../IRenderer";
import { RAF, CLRAF, TweenCache } from '../../utils/loop';
import { Sketchpad } from '../Sketchpad';
/**
 * @author huangkui(h00599037)
 * @event 
 * @emits framestart frameend
 */
class GlobalRenderer implements IRenderer {
    /** 
     * global object
     */
    private _globe: Globe;

    /*** 
     * animation frame id
     */
    private _frame: number;

    /*** 
     * 地图绘制上下文，2d
     */
    private _ctx2d: CanvasRenderingContext2D;

    /** 
     * 上次的帧时间戳 
     */
    private _lastframestamp: number = 0;

    /** 
     * 帧数 
     */
    private _frameCount: number = 0;

    /*** 
     * 构建Globe总渲染器
     */
    constructor(g: Globe) {
        this._globe = g;
        this._ctx2d = g.canvas.getContext('2d');
    }

    /**
     * 主体渲染循环
     * @param framestamp 
     */
    _frameLoop = (framestamp: number) => {
        //每秒生成帧数
        this._frameCount = 1000 / (framestamp - this._lastframestamp);
        //打工人干活
        this._workerRun(framestamp);
        //阅后即焚
        this._tweenRun(framestamp);
        //帧渲染
        this.renderFrame(framestamp);
        this._frame = RAF.call(window, (framestamp: number) => { this._frameLoop(framestamp); });
        this._lastframestamp = framestamp;
    }

    /**
     * 呼唤打工人干活
     */
    _workerRun = (framestamp: number) => {
        const g = this._globe;
        g.emit('worker', framestamp);
    }

    /** 
     * }{debug 
     * 弄完就扔 
     */
    _tweenRun = (framestamp: number) => {
        const arr: Array<Function> = [];
        TweenCache.forEach((fn: Function) => {
            arr.push(fn);
        });
        TweenCache.clear();
        let fn = arr.shift();
        while (fn) {
            fn(framestamp);
            fn = arr.shift();
        };
    }

    /*** 
     * 渲染入口
     */
    render = () => {
        /** 渲染从 framestamp 0 开始 */
        this._frameLoop(0);
    }

    /**
     * 地图对象渲染入口
     * @param framestamp 
     */
    renderFrame = (framestamp: number): void => {
        const g = this._globe,
            ctx2d = this._ctx2d,
            camera = g._state_camera_.camera;
        g.emit('framestart', this._frameCount);
        //渲染skpd
        const skpds = g.getSketchpads();
        skpds.forEach((skpd: Sketchpad) => {
            const renderer = skpd.renderer;
            renderer.render(framestamp, camera);
        });
        //清空内容
        ctx2d.fillRect(0, 0, g.width * g.devicePixelRatio, g.height * g.devicePixelRatio);
        //渲染结果融合, 基于Convas2D
        skpds.forEach((skpd: Sketchpad) => {
            const renderer = skpd.renderer;
            const image = renderer.getCanvasImage();
            const w = image.width, h = image.height;
            ctx2d.drawImage(image, 0, 0, w, h, 0, 0, w, h);
            ctx2d.save();
        });
        g.emit('frameend', this._frameCount);
    }
}

Globe.registerRenderer(Globe.name, GlobalRenderer)

export { GlobalRenderer }
