import { EventEmitter } from 'events';
import { isString } from '../util/isString';
import { browser} from '../util/browser';

interface option {
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

    static RegistHook(func: Function, ...args: any[]) {
        Globe.LoadHooks.push({ func, args });
    }

    constructor(options: option) {
        super();
        this._canvas = (isString(options.canvas) ? document.getElementById(options.canvas as string) : options.canvas) as HTMLCanvasElement;
        this._devicePixelRatio = options.devicePixelRatio | browser.devicePixelRatio;
        this.initialization();
    }
    /**
     * dom元素
     */
    public get Canvas(): HTMLCanvasElement {
        return this._canvas;
    }
    /**
     * 
     */
    private initialization(): void {
        //hook
        Globe.LoadHooks.forEach((hook) => {
            const { func, args } = hook;
            func.apply(this, args);
        })
    }

}

export { Globe }