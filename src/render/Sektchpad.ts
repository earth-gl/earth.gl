import { Globe } from "../globe/Globe";
import { IRendererOS } from "./IRendererOS";
import { Renderable } from "./Renderable";
/**
 * https://github.com/pixijs/pixi.js/blob/dev/packages/display/src/Container.ts
 * 
 * 绘图板作为渲染容器，汇聚各个加入到了Globe中的对象
 * 作为地理可视化库，
 * -有且仅支持解析地理矢量要素对象
 * -所有待绘制的对象都是一个Sketchpad的子集
 * 
 * const g = new Globe();
 * const skpd = new Sketchpad();
 * g.add(skpd);
 * 
 */
abstract class Sketchpad extends Renderable {

    /** 
     * globe 
     */
    private _globe: Globe;

    /** 
     * canvas rendering pipeline:
     * blink-> (Main Frame)-> Layer Compositor -> (Compositor Frame) -> Display Compositor -> (GL/UI Frame) -> Window
     * offscreen rendering pipeline omits parentheses
     */
    private _canvas: OffscreenCanvas;

    /**
     * 离屏渲染对象 
     */
    private _renderer: IRendererOS;

    /**
     * globe object 
     */
    public get Globe() {
        return this._globe;
    }

    /**
     * geo-sketchpad offscreen-rendering
     */
    constructor() {
        super();
    }

    /** 
     * Sketchpad 总事件注册，其他扩展Sketchpad的同类时间不再另外处理 
     */
    abstract registerEvents = () => { }

    /*
     * 注销事件 
     */
    abstract removeEvents = () => { }

    /**
     * 构造渲染对象
     * @example sptachpad.attach(globe);
     * @param globe 
     */
    public attach(globe: Globe): void {
        this._globe = globe;
        const clazz = this.getRegisterRender(this.constructor.name);
        this._renderer = new clazz(this) as IRendererOS;
        this.registerEvents();
    }

    /** 
     * 渲染器 
     */
    get renderer(): IRendererOS {
        return this._renderer;
    }
}

export { Sketchpad }
