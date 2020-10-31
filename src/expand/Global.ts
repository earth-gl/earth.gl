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

    constructor(options: option) {
        super();
        this._canvas = (isString(options.canvas) ? document.getElementById(options.canvas as string) : options.canvas) as HTMLCanvasElement;
        this._devicePixelRatio = options.devicePixelRatio | window.devicePixelRatio;
    }
}

export { Global }