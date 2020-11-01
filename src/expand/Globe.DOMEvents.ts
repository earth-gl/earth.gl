import { Globe } from './Globe';
import { addDOMEvent, preventDefault, removeDOMEvent } from './../util/domUtil';

/**
 * 
 */
const now = function (): number {
    return Date.now();
}

interface IDOMEventParam {
    domEvent: Event,
    coordinate?: any,
    viewPoint?: any,
    point2d?: any
}

/**
 * 浏览器控件支持的交互类型
 */
const eventTypes =
    'mousedown ' +
    'mouseup ' +
    'mouseover ' +
    'mouseout ' +
    'mouseenter ' +
    'mouseleave ' +
    'mousemove ' +
    'click ' +
    'dblclick ' +
    'contextmenu ' +
    'keypress ' +
    'touchstart ' +
    'touchmove ' +
    'touchend ';
/**
 * 合并申明
 * reference:
 * https://www.tslang.cn/docs/handbook/declaration-merging.html
 * https://github.com/maptalks/maptalks.js/blob/master/src/map/Map.DomEvents.js
 */
declare module './Globe' {
    interface Globe {
        registerDOMEvents(): void;
        onDOMEvent(obj: HTMLElement, eventName: string, handler: Function, context: object): void;
        handleDOMEvent(e: Event): void;
        /**
         * 转换事件对象
         * @param e 
         * @param type 
         */
        parseEvent(e: Event, type: string): void;
        getActualEvent(e: Event): boolean;
        mouseDownTime: number;
    }
}
/**
 * 单个DOM事件过滤
 */
Globe.prototype.onDOMEvent = function (element: HTMLElement, eventName: string, handler: Function, context: object): void {
    const ctx = (this as Globe);
    addDOMEvent(element, eventTypes, ctx.handleDOMEvent, ctx);
}
/**
 * 统一预处理DOM
 * 1. 处理输入延迟
 * 2. 模拟doble click
 * 3. 统一处理touch，clcik
 */
Globe.prototype.handleDOMEvent = function (e: Event): void {
    const ctx = (this as Globe);
    const type = e.type;
    //prevent default context menu
    if (type === 'contextmenu')
        preventDefault(e);
    //
    let mimicClick = false;
    //ignore click lasted for more than 300ms
    if (type === 'mousedown' || (type === 'touchstart' && (!e['touches'] || e['touches'].length === 1)))
        ctx.mouseDownTime = now();
    else if (type === 'click' || type === 'touchend' || type === 'contextmenu') {
        //mousedown | touchstart propogation is stopped
        //ignore the click/touchend/contextmenu
        if (!this._mouseDownTime)
            return;
        else {
            const downTime = ctx.mouseDownTime;
            delete ctx.mouseDownTime;
            const time = now();
            if ((time - downTime > 300) && (type === 'click' || type === 'contextmenu'))
                return
            else if (type === 'touchend')
                mimicClick = true;
        }
    }
    //
    // ctx.emit()

}

Globe.prototype.parseEvent = function (e: Event, type: string): IDOMEventParam {
    if (!e) return;
    const ctx = (this as Globe);
    const DOMEventParam: IDOMEventParam = {
        domEvent: e
    };
    if (type !== 'leypress' && ctx.getActualEvent(e)) {
        // const containerPoint = getEventContainerPoint(actual, this._containerDOM);
        // DOMEventParam = extend(DOMEventParam, {
        //     'coordinate': this.containerPointToCoord(containerPoint),
        //     'containerPoint': containerPoint,
        //     'viewPoint': this.containerPointToViewPoint(containerPoint),
        //     'point2d': this._containerPointToPoint(containerPoint),
        // });
    }
    return DOMEventParam;
}

Globe.prototype.getActualEvent = function (e: Event): boolean {
    return e['touches'] && e['touches'].length > 0 ? e['touches'][0] : e['changedTouches'] && e['changedTouches'].length > 0 ? e['changedTouches'][0] : e;
}

/**
 * 统一注册DOM事件
 */
Globe.prototype.registerDOMEvents = function () {
    const ctx = (this as Globe);
    ctx.onDOMEvent(ctx.Canvas, eventTypes, ctx.handleDOMEvent, ctx);
}

/**
 * 钩子，插件需要预执行的方法注册到钩子里
 */
Globe.RegistHook(Globe.prototype.registerDOMEvents);