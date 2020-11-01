import { Globe } from './Globe';
import { addDOMEvent, removeDOMEvent } from './../util/domUtil';
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
        handleDOMEvent(e:Event): void;
    }
}
/**
 * 单个DOM事件过滤
 */
Globe.prototype.onDOMEvent = function (element: HTMLElement, eventName: string, handler: Function, context: object): void {
    const ctx = (this as Globe);
    addDOMEvent(element, eventTypes,ctx.handleDOMEvent, ctx);
}
/**
 * 统一预处理DOM
 * 1. 处理输入延迟
 * 2. 模拟doble click
 * 3. 统一处理touch，clcik
 */
Globe.prototype.handleDOMEvent = function (e: Event): void {
    const ctx = (this as Globe);
    const sss = e; 
    console.log(e.type);
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