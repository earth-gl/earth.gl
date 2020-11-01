import { EventEmitter } from 'events';
import { isString } from '../util/isString';

interface option {
    canvas: string | HTMLCanvasElement,
    width: number,
    height: number,
    devicePixelRatio?: number
}
/**
 * @class
 */
class Global extends EventEmitter {
    /**
     * canvas
     */
    private _canvas: HTMLCanvasElement;
    /**
     * 
     */
    private _devicePixelRatio: number;
    /**
     * Global启动时执行的钩子
     */
    public static LoadHooks: Array<{ func: Function, args: any[] }> = new Array<{ func: Function, args: any[] }>();

    constructor(options: option) {
        super();
        this._canvas = (isString(options.canvas) ? document.getElementById(options.canvas as string) : options.canvas) as HTMLCanvasElement;
        this._devicePixelRatio = options.devicePixelRatio | window.devicePixelRatio;

    }

    private _load():void{
        //hook
        Global.LoadHooks.forEach((hook) => {
            const { func, args } = hook;
            func.apply(this, args);
        })
    }

    static RegistHook(func: Function, ...args: any[]) {
        Global.LoadHooks.push({ func, args });
    }
}

export { Global }