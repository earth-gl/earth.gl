import { Globe } from './../Globe';
import { splitWords } from './../../util/splitWords';
import { IDOMEventParam } from './Globe.Handler.DOMEvents';
import { Vec2 } from 'kiwi.matrix';
/**
 * pan event arguments
 */
interface IPanEventParam {
    domEvent: TouchEvent | MouseEvent,
    currentPosition?: Vec2;
}

const START_EVENTS = 'touchstart mousedown';

const MOVE_EVENTS = {
    mousedown: 'mousemove',
    touchstart: 'touchmove',
    pointerdown: 'touchmove',
    MSPointerDown: 'touchmove'
};

const END_EVENTS = {
    mousedown: 'mouseup',
    touchstart: 'touchend',
    pointerdown: 'touchend',
    MSPointerDown: 'touchend'
};

const PAN_EVENTS = {
    panstart: 'panstart',
    paning: 'paning',
    panend: 'panend'
}

/**
 * reference
 * https://github.com/maptalks/maptalks.js/blob/1d98540a0af728e80cbac133278143fc1c6a4c51/src/handler/Drag.js
 * 提供Global的Pan事件发布
 */
declare module './../Globe' {
    interface Globe {
        /**
         * 注册到hook的初始化执行钩子
         */
        registerPanHandlerHood(): void;
        /**
         * 移除 moveevents, endevents
         */
        releasePanHandlerEvents(): void;
        panMousedownOrTouchstart(args: IDOMEventParam): void;
        panMousemoveOrTouchmove(args: IDOMEventParam): void;
        panMouseupOrTouchend(args: IDOMEventParam): void;
        startPosition: Vec2;
        moved: boolean;
        /**
         * 指示pan是否被中断
         */
        interupted: boolean;
    }
}

Globe.prototype.registerPanHandlerHood = function (): void {
    const ctx = this as Globe;
    splitWords(START_EVENTS).forEach((type) => {
        ctx.on(type, ctx.panMousedownOrTouchstart);
    });
}
/**
 * mousedown 或 touchstart 事件开始
 */
Globe.prototype.panMousedownOrTouchstart = function (args: IDOMEventParam): void {
    const ctx = this as Globe, e = args.domEvent;
    if (e['button'] === 2 || (e['touches'] && e['touches'].length > 1))//右键或多点触控，不分发事件
        return;
    //https://www.w3cschool.cn/fetch_api/fetch_api-w3zc2v4w.html
    //captureEvents方法已弃用
    if (e['touches'] && e['touches'][0]) {
        const touch = e['touches'][0] as Touch;
        ctx.startPosition = new Vec2().set(touch.clientX, touch.clientY);
    } else {
        const mouse = e as MouseEvent;
        ctx.startPosition = new Vec2().set(mouse.clientX, mouse.clientY);
    }
    //清除前置moved状态
    delete ctx.moved;
    //注册事件
    ctx.on(MOVE_EVENTS[e.type], ctx.panMousemoveOrTouchmove);
    ctx.on(END_EVENTS[e.type], ctx.panMouseupOrTouchend);
}
/**
 * 
 */
Globe.prototype.panMousemoveOrTouchmove = function (args: IDOMEventParam): void {
    const ctx = this as Globe, e = args.domEvent;
    //使用touch平移地图时，如果出现多触电，则认为平移结束
    if (e['touches'] && e['touches'].length > 1) {
        if (ctx.moved) {
            ctx.interupted = true;
            ctx.panMouseupOrTouchend(args);
        }
        return;
    }
    //新的位置
    const currentPosition = new Vec2();
    if (e['touches'] && e['touches'][0]) {
        const touch = e['touches'][0] as Touch;
        currentPosition.set(touch.clientX, touch.clientY);
    } else {
        const mouse = e as MouseEvent;
        currentPosition.set(mouse.clientX, mouse.clientY);
    }
    //如果移动offset为0，取消执行
    const offset = currentPosition.clone().sub(ctx.startPosition);
    if (!offset.x && !offset.y) return;
    //构造pan参数
    const panEventParam: IPanEventParam = {
        domEvent: e
    }
    //如果没标注panstart，则广播start
    if (!ctx.moved) {
        panEventParam.currentPosition = ctx.startPosition.clone();
        ctx.emit(PAN_EVENTS.panstart, panEventParam)
        ctx.moved = true;
    } else {
        panEventParam.currentPosition = currentPosition.clone();
        ctx.emit(PAN_EVENTS.paning, panEventParam)
    }
}
/**
 * 
 */
Globe.prototype.panMouseupOrTouchend = function (args: IDOMEventParam): void {
    const ctx = this as Globe, e = args.domEvent;
    ctx.releasePanHandlerEvents();
    const currentPosition = new Vec2();
    if (e['changedTouches'] && e['changedTouches'][0]) {
        const a = e['changedTouches'][0] as Touch;
        currentPosition.set(a.clientX, a.clientY);
    } else {
        const a = e as MouseEvent;
        currentPosition.set(a.clientX, a.clientY);
    }
    const panEventParam: IPanEventParam = {
        domEvent: e,
        currentPosition: currentPosition
    };
    if (ctx.moved) {
        ctx.emit(PAN_EVENTS.panend, panEventParam);
        delete ctx.moved;
        delete ctx.interupted;
    }
}
/**
 * 清除所有pan操作
 */
Globe.prototype.releasePanHandlerEvents = function (): void {
    const ctx = this as Globe;
    for (const key in MOVE_EVENTS) {
        const moveEventName = MOVE_EVENTS[key];
        const endEventName = END_EVENTS[key];
        ctx.off(moveEventName, ctx.panMousemoveOrTouchmove);
        ctx.off(endEventName, ctx.panMouseupOrTouchend);
    }
}

Globe.registerHook(Globe.prototype.registerPanHandlerHood);

export { Globe, PAN_EVENTS, IPanEventParam }