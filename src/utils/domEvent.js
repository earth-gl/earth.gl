
/**
 * DocumentEvent aims to register document event such as (click,mousemove...) to object
 * 1. register dom event to html object
 * 2. dispatch Event through customer EventName
 */

/**
 * 
 */
const splitWords = require("./splitWords").splitWords;

/**
 * Check if event type of the dom is listened by the handler
 * @param {*} obj 
 * @param {*} type 
 * @param {*} handler 
 * @returns {Number} -the handler's index in the listener chain, returns -1 if not.
 */
const listensDomEvent = function (obj, type, handler) {
    if (!obj || !obj['Z__' + type] || !handler) {
        return -1;
    }
    const handlers = obj['Z__' + type];
    for (let i = 0, len = handlers.length; i < len; i++) {
        if (handlers[i].src === handler) {
            return i;
        }
    }
    return -1;
}

/**
 * 
 * @param {*} obj 
 * @param {*} typeArr 
 * @param {*} handler 
 * @param {*} context 
 */
const addDomEvent = function (obj, typeArr, handler, context) {
    if (!obj || !obj.addEventListener || !typeArr || !handler) {
        return this;
    }
    const eventHandler = function (e) {
        if (!e) {
            e = window.event;
        }
        handler.call(context || obj, e);
        return;
    };
    const types = splitWords(typeArr);
    for (let i = types.length - 1; i >= 0; i--) {
        let type = types[i];
        if (!type) {
            continue;
        }

        if (!obj['Z__' + type]) {
            obj['Z__' + type] = [];

        }
        const hit = listensDomEvent(obj, type, handler);
        if (hit >= 0) {
            removeDomEvent(obj, type, handler);
        }
        obj['Z__' + type].push({
            callback: eventHandler,
            src: handler
        });
        //firefox
        if (type === 'mousewheel' && Browser.gecko) {
            type = 'DOMMouseScroll';
        }
        obj.addEventListener(type, eventHandler, false);
    }
    return this;
}

/**
 * Removes event listener from a dom element
 * @param {HTMLElement} obj         - dom element
 * @param {String} typeArr          - event types, separated by space
 * @param {Function} handler        - listening function
 */
const removeDomEvent = function (obj, typeArr, handler) {
    function doRemove(type, callback) {
        //mouse wheel in firefox
        if (type === 'mousewheel' && Browser.gecko) {
            type = 'DOMMouseScroll';
        }
        obj.removeEventListener(type, callback, false);
    }
    if (!obj || !obj.removeEventListener || !typeArr) {
        return this;
    }
    const types = splitWords(typeArr);
    for (let i = types.length - 1; i >= 0; i--) {
        const type = types[i];
        if (!type) {
            continue;
        }
        //remove all the listeners if handler is not given.
        if (!handler && obj['Z__' + type]) {
            const handlers = obj['Z__' + type];
            for (let j = 0, jlen = handlers.length; j < jlen; j++) {
                doRemove(handlers[j].callback);
            }
            delete obj['Z__' + type];
            return this;
        }
        const hit = listensDomEvent(obj, type, handler);
        if (hit < 0) {
            return this;
        }
        const hitHandler = obj['Z__' + type][hit];
        doRemove(type, hitHandler.callback);
        obj['Z__' + type].splice(hit, 1);
    }
    return this;
}

/**
 * Prevent default behavior of the browser. <br/>
 * preventDefault Cancels the event if it is cancelable, without stopping further propagation of the event.
 * @param {Event} event - browser event
 * @memberOf DomUtil
 */
const preventDefault = function (event) {
    if (event.preventDefault) {
        event.preventDefault();
    } else {
        event.returnValue = false;
    }
    return this;
}

/**
 * Stop browser event propagation
 * @param  {Event} e - browser event.
 * @memberOf DomUtil
 */
const stopPropagation = function (e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    } else {
        e.cancelBubble = true;
    }
    return this;
}

/**
 * 
 */
const domEventNames =
    /**
     * mousedown event
     * @event Map#mousedown
     * @type {Object}
     * @property {String} type                    - mousedown
     * @property {Map} target            - the map fires event
     * @property {Coordinate} coordinate - coordinate of the event
     * @property {Point} containerPoint  - container point of the event
     * @property {Point} viewPoint       - view point of the event
     * @property {Event} domEvent                 - dom event
     */
    'mousedown ' +
    /**
     * mouseup event
     * @event Map#mouseup
     * @type {Object}
     * @property {String} type                    - mouseup
     * @property {Map} target            - the map fires event
     * @property {Coordinate} coordinate - coordinate of the event
     * @property {Point} containerPoint  - container point of the event
     * @property {Point} viewPoint       - view point of the event
     * @property {Event} domEvent                 - dom event
     */
    'mouseup ' +
    /**
     * mouseover event
     * @event Map#mouseover
     * @type {Object}
     * @property {String} type                    - mouseover
     * @property {Map} target            - the map fires event
     * @property {Coordinate} coordinate - coordinate of the event
     * @property {Point} containerPoint  - container point of the event
     * @property {Point} viewPoint       - view point of the event
     * @property {Event} domEvent                 - dom event
     */
    'mouseover ' +
    /**
     * mouseout event
     * @event Map#mouseout
     * @type {Object}
     * @property {String} type                    - mouseout
     * @property {Map} target            - the map fires event
     * @property {Coordinate} coordinate - coordinate of the event
     * @property {Point} containerPoint  - container point of the event
     * @property {Point} viewPoint       - view point of the event
     * @property {Event} domEvent                 - dom event
     */
    'mouseout ' +
    /**
     * mouseenter event
     * @event Map#mouseenter
     * @type {Object}
     * @property {String} type                    - mouseenter
     * @property {Map} target            - the map fires event
     * @property {Coordinate} coordinate - coordinate of the event
     * @property {Point} containerPoint  - container point of the event
     * @property {Point} viewPoint       - view point of the event
     * @property {Event} domEvent                 - dom event
     */
    'mouseenter ' +
    /**
     * mouseleave event
     * @event Map#mouseleave
     * @type {Object}
     * @property {String} type                    - mouseleave
     * @property {Map} target            - the map fires event
     * @property {Coordinate} coordinate - coordinate of the event
     * @property {Point} containerPoint  - container point of the event
     * @property {Point} viewPoint       - view point of the event
     * @property {Event} domEvent                 - dom event
     */
    'mouseleave ' +
    /**
     * mousemove event
     * @event Map#mousemove
     * @type {Object}
     * @property {String} type                    - mousemove
     * @property {Map} target            - the map fires event
     * @property {Coordinate} coordinate - coordinate of the event
     * @property {Point} containerPoint  - container point of the event
     * @property {Point} viewPoint       - view point of the event
     * @property {Event} domEvent                 - dom event
     */
    'mousemove ' +
    /**
     * click event
     * @event Map#click
     * @type {Object}
     * @property {String} type                    - click
     * @property {Map} target            - the map fires event
     * @property {Coordinate} coordinate - coordinate of the event
     * @property {Point} containerPoint  - container point of the event
     * @property {Point} viewPoint       - view point of the event
     * @property {Event} domEvent                 - dom event
     */
    'click ' +
    /**
     * dblclick event
     * @event Map#dblclick
     * @type {Object}
     * @property {String} type                    - dblclick
     * @property {Map} target            - the map fires event
     * @property {Coordinate} coordinate - coordinate of the event
     * @property {Point} containerPoint  - container point of the event
     * @property {Point} viewPoint       - view point of the event
     * @property {Event} domEvent                 - dom event
     */
    'dblclick ' +
    /**
     * contextmenu event
     * @event Map#contextmenu
     * @type {Object}
     * @property {String} type                    - contextmenu
     * @property {Map} target            - the map fires event
     * @property {Coordinate} coordinate - coordinate of the event
     * @property {Point} containerPoint  - container point of the event
     * @property {Point} viewPoint       - view point of the event
     * @property {Event} domEvent                 - dom event
     */
    'contextmenu ' +
    /**
     * keypress event
     * @event Map#keypress
     * @type {Object}
     * @property {String} type                    - keypress
     * @property {Map} target            - the map fires event
     * @property {Coordinate} coordinate - coordinate of the event
     * @property {Point} containerPoint  - container point of the event
     * @property {Point} viewPoint       - view point of the event
     * @property {Event} domEvent                 - dom event
     */
    'keypress ' +
    /**
     * touchstart event
     * @event Map#touchstart
     * @type {Object}
     * @property {String} type                    - touchstart
     * @property {Map} target            - the map fires event
     * @property {Coordinate} coordinate - coordinate of the event
     * @property {Point} containerPoint  - container point of the event
     * @property {Point} viewPoint       - view point of the event
     * @property {Event} domEvent                 - dom event
     */
    'touchstart ' +
    /**
     * touchmove event
     * @event Map#touchmove
     * @type {Object}
     * @property {String} type                    - touchmove
     * @property {Map} target            - the map fires event
     * @property {Coordinate} coordinate - coordinate of the event
     * @property {Point} containerPoint  - container point of the event
     * @property {Point} viewPoint       - view point of the event
     * @property {Event} domEvent                 - dom event
     */
    'touchmove ' +
    /**
     * touchend event
     * @event Map#touchend
     * @type {Object}
     * @property {String} type                    - touchend
     * @property {Map} target            - the map fires event
     * @property {Coordinate} coordinate - coordinate of the event
     * @property {Point} containerPoint  - container point of the event
     * @property {Point} viewPoint       - view point of the event
     * @property {Event} domEvent                 - dom event
     */
    'touchend ';


module.exports = {
    addDomEvent,
    removeDomEvent,
    preventDefault,
    stopPropagation,
    domEventNames
};