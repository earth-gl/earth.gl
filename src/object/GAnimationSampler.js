const { Vec3, Quat } = require('kiwi.matrix'),
    { TYPE2NUMOFCOMPONENT } = require('./../utils/revise');

/**
 * 应用animation，更新trs矩阵
 * @class
 */
class GAnimationSampler {
    /**
     * 
     * @param {*} resource 
     * @param {Object} [resource.accessors]
     * @param {*} options 
     */
    constructor(resource, options) {
        /**
         * 
         */
        this._resource = resource;
        /**
         * 
         */
        this._animSaplerJson = options;
        /**
         * LINEAR/STEP/CATMULLROMSPLINE/CUBICSPLINE
         */
        this._interpolation = options.interpolation !== undefined ? options.interpolation : 'LINEAR';
        /**
         * @type {GAccessor}
         */
        this.input = resource.accessors[options.input];
        /**
         * @type {GAccessor}
         */
        this.output = resource.accessors[options.output];
        /**
         * 
         */
        this._inputTypedArray = this.input.typedArrayBuffer;
        /**
         * 
         */
        this._outputTypedArray = this.output.typedArrayBuffer;
        /**
         * 
         */
        this._extensions = options.extensions !== undefined ? options.extensions : null;
        /**
         * 
         */
        this._extras = options.extras !== undefined ? options.extras : null;
        /**
         * 
         */
        this._duration = this._inputTypedArray[this._inputTypedArray.length-1]+this._inputTypedArray[0];
    }
    /**
     * 
     * @param {*} interpolation 
     * @param {*} previous 
     * @param {*} next 
     * @param {*} input 
     * @param {*} length 
     */
    _getCubicSpline(interpolation, previous, next, input, length) {
        const t = interpolation.value;
        const vk = previous.slice(length, length * 2);
        const bk = previous.slice(length * 2, length * 3);
        const tk = input[interpolation.preIndex];
        const tk1 = input[interpolation.nextIndex];
        const ak1 = next.slice(0, length);
        const vk1 = next.slice(3, length * 2);
        const pt = [];
        for (let i = 0; i < 3; i++) {
            const p0 = vk[i];
            const m0 = (tk1 - tk) * bk[i];
            const p1 = vk1[i];
            const m1 = (tk1 - tk) * ak1[i];
            const pti = (Math.pow(t, 3) * 2 - Math.pow(t, 2) * 3 + 1) * p0 + (Math.pow(t, 3) - Math.pow(t, 2) * 2 + t) * m0 + (-Math.pow(t, 3) * 2 + Math.pow(t, 2) * 3) * p1 + (Math.pow(t, 3) - Math.pow(t, 2)) * m1;
            pt.push(pti);
        }
        return pt;
    }
    /**
     * 
     * @param {Number} t 
     * @param {Number} stride 
     */
    _getPreNext(t, stride) {
        const input = this._inputTypedArray,
            output = this._outputTypedArray,
            itemSize = TYPE2NUMOFCOMPONENT[this.output._type],
            interpolation = this._getInterpolation(input, t),
            previous = output.slice(interpolation.preIndex * itemSize * stride, (interpolation.preIndex + 1) * itemSize * stride),
            next = output.slice(interpolation.nextIndex * itemSize * stride, (interpolation.nextIndex + 1) * itemSize * stride);
        return { previous, next, interpolation };
    }
    /**
     * 
     * @param {*} input 
     * @param {*} t 
     */
    _getInterpolation(input, timeStamp) {
        let t = timeStamp % this._duration;
        if (t < input[0] || t > input[input.length - 1]) {
            t = Math.max(input[0], Math.min(input[input.length - 1], t));
        } if (t === input[input.length - 1]) {
            t = input[0];
        }
        for (let i = 0; i < input.length - 1; i++) {
            if (t >= input[i] && t < input[i + 1]) {
                const previousTime = input[i];
                const nextTime = input[i + 1];
                return {
                    preIndex: i,
                    nextIndex: i + 1,
                    value: (t - previousTime) / (nextTime - previousTime)
                };
            }
        }
        return null;
    }
    /**
     * 计算sacle和translate
     * @returns {Quat}
     */
    getUpdatedAnimateion(t) {
        //translate and scale
        let vec3 = new Vec3();
        switch(this._interpolation){
            case 'LINEAR':{
                const preNext = this._getPreNext(t, 1);
                vec3 = new Vec3().set(...preNext.previous).lerp(new Vec3().set(...preNext.next), preNext.interpolation.value);
                break;
            }
            case 'STEP':{
                const preNext = this._getPreNext(t, 1);
                vec3 = new Vec3().set(...preNext.previous);
                break;
            }
            case 'CUBICSPLINE':{
                const preNext = this._getPreNext(t, 3);
                const out = this._getCubicSpline(preNext.interpolation, preNext.previous, preNext.next, this._inputTypedArray, 3);
                vec3 = new Vec3().set(...out);
                break;
            }
        }
        return vec3;
    }
    /**
     * 计算rotation
     * @returns {Vec3}
     */
    getUpdatedQuaternion(t) {
        //roated quat
        let quat = new Quat();
        //calcute _curValue by lerp function
        switch (this._interpolation) {
            case 'LINEAR': {
                const preNext = this._getPreNext(t, 1);
                quat = new Quat().slerp(new Quat().set(...preNext.previous), new Quat().set(...preNext.next), preNext.interpolation.value);
                break;
            }
            case 'STEP': {
                const preNext = this._getPreNext(t, 1);
                quat = new Quat().set(...preNext.previous);
                break;
            }
            case 'CUBICSPLINE': {
                const preNext = this._getPreNext(t, 3);
                preNext.previous = preNext.previous.map(d => {
                    return Math.acos(d);
                });
                preNext.next = preNext.next.map(d => {
                    return Math.acos(d);
                });
                let out = this._getCubicSpline(preNext.interpolation, preNext.previous, preNext.next, this._inputTypedArray, 3);
                out = out.map(value => {
                    return Math.cos(value);
                });
                quat = new Quat().set(...out);
                break;
            }
        }
        //current value
        return quat;
    }
}

module.exports = GAnimationSampler;