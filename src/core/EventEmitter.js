/**
*   set two keys for events: _idx,_len
*   _len means the count of handlers have bind with context
*   _event popNode
*   @author yellow date 2014/11/10
*   @class J.utils.Event
*   @inheritable
*/
const isString = require('../utils/isString'),
    { stopPropagation } = require('../utils/domEvent');
/**
 * 切分字符串
 */
const eventSplitter = /\s+/;
/**
 * 适合ES6的事件分发基类
 */
class EventEmitter {

    constructor() {
        /**
         * @type {Object}
         */
        this.eventMap = {};
        /**
         * @type {Object}
         */
        this.onceEventMap = {};
        /**
         * 
         */
        this.event = new Proxy({}, {
            set: (target, property, fn) => {
                this.eventMap[property] || (this.eventMap[property] = [])
                this.eventMap[property].push(fn)
                return true
            }
        });
        /**
         * 
         */
        this.onceEvent = new Proxy({}, {
            set: (target, property, fn) => {
                this.onceEventMap[property] || (this.onceEventMap[property] = [])
                this.onceEventMap[property].push(fn)
                return true
            }
        });
    }
    /**
     * 注册事件
     * @param {String | String[]} name 
     * @param {Function} fn 
     */
    on(name, fn, context) {
        if (name && eventSplitter.test(name)) {
            const names = name.split(eventSplitter);
            names.forEach(n => {
                this.event[n] = { f: fn, c: context };
                delete this.onceEventMap[n];
            });
        } else {
            this.event[name] = { f: fn, c: context };
            delete this.onceEvent[name];
        }
    }
    /**
     * 注册一次
     * @param {*} name 
     * @param {*} fn 
     */
    once(name, fn, context) {
        if (name && eventSplitter.test(name)) {
            const names = name.split(eventSplitter);
            names.forEach(n => {
                this.onceEvent[n] = { f: fn, c: context };
                delete this.eventMap[n];
            });
        } else {
            this.onceEvent[name] = { f: fn, c: context };
            delete this.eventMap[name];
        }
    }
    /**
     * 
     * @param {*} name 
     * @param {*} fn 
     */
    off(name, fn, context) {
        if (name && eventSplitter.test(name)) {
            const names = name.split(eventSplitter);
            names.forEach(n => {
                this.eventMap[n].forEach(({ f, c }, idx) => {
                    if (f === fn && c === context)
                        this.eventMap[n].splice(idx, 1);
                });
                this.onceEventMap[n].forEach(({ f, c }, idx) => {
                    if (f === fn && c === context)
                        this.onceEventMap[n].splice(idx, 1);
                });
            });
        } else {
            this.eventMap[name] && this.eventMap[name].forEach(({ f, c }, idx) => {
                if (f === fn && c === context)
                    this.eventMap[name].splice(idx, 1);
            });
            this.onceEventMap[name] && this.onceEventMap[name].forEach(({ f, c }, idx) => {
                if (f === fn && c === context)
                    this.onceEventMap[name].splice(idx, 1);
            });
        }
    }
    /**
     * 
     * @param {*} obj 
     * @param {*} name 
     * @param {*} fn 
     */
    listenTo(obj, name, fn, context) {
        obj.on(name, fn, context);
    }
    /**
     * 
     * @param {*} obj 
     * @param {*} name 
     */
    stopListen(obj, name, fn, context) {
        obj.off(name, fn, context)
    }
    /**
     * 
     * @param {String | String[]} name 
     * @param  {...any} val 
     */
    fire(name, ...val) {
        if (name && eventSplitter.test(name)) {
            const names = name.split(eventSplitter);
            names.forEach(n => {
                this.eventMap[n] && this.eventMap[n].forEach(({ f, c }) => {
                    f && c && f.call(c, ...val);
                });
                this.onceEventMap[n] && (this.onceEventMap[n].forEach(({ f, c }) => {
                    f && c && f.call(c, ...val);
                }), this.off(n));
            });
        } else {
            this.eventMap[name] && this.eventMap[name].forEach(({ f, c }) => {
                f && c && f.call(c, ...val);
            });
            this.onceEventMap[name] && (this.onceEventMap[name].forEach(({ f, c }) => {
                f && c && f.call(c, ...val);
            }), this.off(name));
        }
    }
}

module.exports = EventEmitter;