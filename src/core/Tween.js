const { TweenCache } = require('./../utils/loop'),
    merge = require('./../utils/merge');
/**
 * @class Tween
 * @example
 * const coords = { x: 0, y: 0 }; 
 * const tween = new TWEEN.Tween(coords) 
 *  .to({ x: 300, y: 200 }, 1000)
 *  .easing(TWEEN.Easing.Quadratic.Out)
 *  .onUpdate(() => {
 *      box.style.setProperty('transform', `translate(${coords.x}px, ${coords.y}px)`);
 *   })
 *  .start()
 */
class Tween {
    /**
     * 
     */
    constructor() {
        /**
         * @type {Object}
         */
        this._objective = null;
        /**
         * @type {Boolean}
         */
        this._isPlaying = false;
        /**
         * @type {Number}
         */
        this._duration = 1000;
        /**
         * @type {Object}
         */
        this._valuesStart = {};
        /**
         * @type {Function}
         */
        this._onStartCallback = null;
        /**
         * @type {Boolean}
         */
        this._onStartCallbackFired = false;
        /**
         * @type {Function}
         */
        this._onCompleteCallback = null;
        /**
         * @type {Number}
         */
        this._delayTime = 0;
        /**
         * @type {Function}
         */
        this._onUpdateCallback;
        /**
         * @type {Function}
         */
        this._easingFunction;
        /**
         * @type {Number}
         */
        this._id = Tween.nextId();
    }
    /**
     * 
     */
    get id() {
        return this._id;
    }
    /**
     * 
     * @param {*} properties 
     */
    form(properties) {
        this._valuesStart = properties;
        //存储拷贝对象
        this._objective = merge({}, properties);
        return this;
    }
    /**
     * 
     * @param {*} properties 
     * @param {*} duration 
     */
    to(properties, duration) {
        this._valuesEnd = properties;
        this._duration = duration || this._duration;
        return this;
    }
    /**
     * 
     */
    start() {
        if (this._isPlaying) return true;
        Tween.add(this);
        this._isPlaying = true;
        this._onStartCallbackFired = false;
        this._startTime = Tween.now();
        this._startTime += this._delayTime;
        for (var property in this._valuesEnd) {
            // Check if an Array was provided as property value
            if (this._valuesEnd[property] instanceof Array) {
                if (this._valuesEnd[property].length === 0) continue;
                // Create a local copy of the Array with the start value at the front 
                this._valuesEnd[property] = [this._object[property]].concat(this._valuesEnd[property]);
            }
            // If `to()` specifies a property that doesn't exist in the source object, we should not set that property in the object
            if (this._objective[property] === undefined) continue;
            // Save the starting value.
            this._valuesStart[property] = this._objective[property];
            // Ensures we're using numbers, not strings
            if ((this._valuesStart[property] instanceof Array) === false) this._valuesStart[property] *= 1.0;
        }
        //animation loop
        TweenCache[this.id] = (time)=>{
            this.update(time);
        }
    }
    /**
     * 
     * @param {*} cb 
     */
    onStart(cb) {
        this._onStartCallback = cb;
        return this;
    }
    /**
     * 
     * @param {*} cb 
     */
    onComplete(cb) {
        this._onCompleteCallback = cb;
        return this;
    }
    /**
     * 
     * @param {*} cb 
     */
    onUpdate(cb) {
        this._onUpdateCallback = cb;
        return this;
    }
    /**
     * 
     * @param {*} easing 
     */
    easing(easing) {
        this._easingFunction = easing;
        return this;
    }
    /**
     * 
     * @param {*} time 
     */
    update(time) {
        if (time < this._startTime) return true;
        //开始事件触发
        if (this._onStartCallbackFired === false) {
            if (this._onStartCallback !== null)
                this._onStartCallback.call(this._object, this._object);
            this._onStartCallbackFired = true;
        }
        //计算当前时间
        const pssedTime = (time - this._startTime) / this._duration;
        const elapsed = pssedTime > 1 ? 1 : pssedTime;
        const value = this._easingFunction(elapsed);
        //更新属性值
        for (var property in this._valuesEnd) {
            // Don't update properties that do not exist in the source object
            if (this._valuesStart[property] === undefined) continue;
            const start = this._valuesStart[property] || 0;
            let end = this._valuesEnd[property];
            const typeName = typeof (end);
            if (typeName === 'string') {
                if (end.charAt(0) === '+' || end.charAt(0) === '-') {
                    end = start + parseFloat(end);
                } else {
                    end = parseFloat(end);
                }
            } else if (typeName === 'number') {
                this._objective[property] = start + (end - start) * value;
            }
        }
        //返回当前时间状态（比例）
        if (this._onUpdateCallback !== null) this._onUpdateCallback(this._objective);
        //结束状态
        if (elapsed === 1) {
            if (this._onCompleteCallback !== null) {
                this._onCompleteCallback.call(this._objective);
            }
            delete TweenCache[this.id];
        }
        // if (elapsed === 1) {
        //     if (this._repeat > 0) {
        //         if (isFinite(this._repeat))
        //             this._repeat--;
        //         // Reassign starting values, restart by making startTime = now
        //         for (property in this._valuesStartRepeat) {
        //             if (typeof (this._valuesEnd[property]) === 'string')
        //                 this._valuesStartRepeat[property] = this._valuesStartRepeat[property] + parseFloat(this._valuesEnd[property]);
        //             if (this._yoyo) {
        //                 var tmp = this._valuesStartRepeat[property];
        //                 this._valuesStartRepeat[property] = this._valuesEnd[property];
        //                 this._valuesEnd[property] = tmp;
        //             }
        //             this._valuesStart[property] = this._valuesStartRepeat[property];
        //         }
        //         if (this._yoyo) this._reversed = !this._reversed;
        //         if (this._repeatDelayTime !== undefined) {
        //             this._startTime = time + this._repeatDelayTime;
        //         } else {
        //             this._startTime = time + this._delayTime;
        //         }
        //         return true;
        //     } else {
        //         if (this._onCompleteCallback !== null)
        //             this._onCompleteCallback.call(this._object, this._object);
        //         for (var i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++)
        //             this._chainedTweens[i].start(this._startTime + this._duration);
        //         return false;
        //     }
        // }
        return true;
    }
}

//In a browser, use window.performance.now if it is available.
Tween.now = window.performance.now.bind(window.performance);

Tween._idx = 0;

Tween.nextId = () => {
    return Tween._idx++;
}

Tween._tweens = {};

/**
 * @type {Tween} tween
 */
Tween.add = (tween) => {
    Tween._tweens[tween.id] = tween;
}

Tween.Easing = {
    Linear: {
        None: function (k) {
            return k;
        }
    },
    Quadratic: {
        In: function (k) {
            return k * k;
        },
        Out: function (k) {
            return k * (2 - k);
        },
        InOut: function (k) {
            if ((k *= 2) < 1) {
                return 0.5 * k * k;
            }
            return - 0.5 * (--k * (k - 2) - 1);
        }
    }
}

module.exports = Tween;