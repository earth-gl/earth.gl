import { EventEmitter } from 'events';
import { isString } from '../util/isString';
import { browser } from '../util/browser';
import { Ellipsoid } from '../core/Ellipsoid';
import { Projection, WebMercatorProjection } from '../core/Projection';

interface IGlobeOption {
    canvas: string | HTMLCanvasElement,
    width: number,
    height: number,
    devicePixelRatio?: number
}
/**
 * @class
 */
class Globe extends EventEmitter {
    /**
     * canvas
     */
    protected _canvas: HTMLCanvasElement;
    /**
     * 
     */
    protected _devicePixelRatio: number;
    /**
     * Global启动时执行的钩子
     */
    public static LoadHooks: Array<{ func: Function, args: any[] }> = new Array<{ func: Function, args: any[] }>();
    /**
     * 
     */
    protected _ellipsoid: Ellipsoid;
    /**
     * 
     */
    protected _prjection: Projection;
    /**
     * 
     * @param func 
     * @param args 
     */
    static RegistHook(func: Function, ...args: any[]) {
        Globe.LoadHooks.push({ func, args });
    }
    /**
     * 
     * @param options 
     */
    constructor(options: IGlobeOption) {
        super();
        this._canvas = (isString(options.canvas) ? document.getElementById(options.canvas as string) : options.canvas) as HTMLCanvasElement;
        this._devicePixelRatio = options.devicePixelRatio | browser.devicePixelRatio;
        this._prjection = new WebMercatorProjection();
        this._ellipsoid = this._prjection.ellipsoid;
        this._initialize();
    }
    /**
     * dom元素
     */
    public get canvas(): HTMLCanvasElement {
        return this._canvas;
    }
    /**
     * 获取投影的参考椭球
     */
    public get ellipsoid():Ellipsoid{
        return this._ellipsoid;
    }
    /**
     * 初始化
     */
    private _initialize(): void {
        //hook
        Globe.LoadHooks.forEach((hook) => {
            const { func, args } = hook;
            func.apply(this, args);
        })
    }

}

export { Globe }