/**
 * https://github.com/maptalks/maptalks.js/blob/65ad8ee2e52fe8b04903b0d51b969fd87d04fb64/src/core/util/dom.js#L144
 * call 调用明确的参数
 * apply 调用...rest args
 */

import { browser } from './browser';
import { splitWords } from './splitWords';

const prefix = 'earth_gl_domEvent';

const addDOMEvent = function (element: HTMLElement, eventName: string, handler: Function, context: Object): void {
    const eventHandler = function (e: Event): void {
        e = e || window.event;
        handler.call(context || element, e);
    }
    splitWords(eventName).forEach((type: string) => {
        const key = `${prefix}_${type}`;
        element[key] = element[key] || [];
        const hit = listenDOMEvent(element, type, handler);
        if (hit >= 0) removeDOMEvent(element, type, handler);
        element[key].push(eventHandler);
        //}{debug IE和非IE浏览器略有区别
        if (browser.ie)
            element.addEventListener(type, eventHandler, false);
        else
            element.addEventListener(type, eventHandler, { capture: false, passive: false });
    });
}

const listenDOMEvent = function (element: HTMLElement, type: string, handler: Function): number {
    const Key = `${prefix}_${type}`;
    if (!element || !element[Key] || !handler) return -1;
    const handlers = element[Key];
    for (let i = 0, len = handlers.length; i < len; i++)
        if (handlers[i] === handler)
            return i;
    return -1;
}

const removeDOMEvent = function (element: HTMLElement, eventName: string, handler: Function): void {
    const remove = function (type: string, fn: EventListener) {
        element.removeEventListener(type, fn, false);
    }
    const types = splitWords(eventName);
    types.forEach((type) => {
        const key = `${prefix}_${type}`;
        if (!handler && element[key]) {
            const handlers = element[key];
            handlers.forEach(h => {
                remove(type, h as EventListener);
            });
            delete element[key];
        }
        //
        const hit = listenDOMEvent(element, type, handler);
        if (hit > 0) remove(type, element[key] as EventListener);
        element[key].splice(hit, 1);
    });
}

const preventDefault = function(e:Event):void{
    if(e.preventDefault) 
        e.preventDefault();
    else
        e.returnValue = false;
}

const stopPropagation = function(e:Event):void{
    if(e.stopPropagation)
        e.stopPropagation();
    else
        e.cancelBubble = true;
}

export { addDOMEvent, removeDOMEvent, preventDefault }