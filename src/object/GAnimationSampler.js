const { Vec4 } = require('kiwi.matrix'),
    { TYPE2NUMOFCOMPONENT } = require('./../utils/revise');

/**
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
        this.interpolation = options.interpolation !== undefined ? options.interpolation : 'LINEAR';
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
         * extra runtime info
         */
        this._curIdx = 0;
        /**
         * 
         */
        this._curValue = new Vec4();
        /**
         * 
         */
        this._endT = this._inputTypedArray[this._inputTypedArray.length - 1];
        /**
         * 
         */
        this._inputMax = this._endT - this._inputTypedArray[0];
    }
    /**
     * get t index sampler
     * @param {*} t 
     */
    getValue(t) {
        const endT = this._endT,
            interpolation = this.interpolation,
            inputMax = this._inputMax,
            len = this._inputTypedArray.length;
        if (t > endT) {
            t -= inputMax * Math.ceil((t - endT) / inputMax);
            this._curIdx = 0;
        }
        while (this._curIdx <= len - 2 && t >= this._inputTypedArray[this._curIdx + 1]) {
            this._curIdx++;
        }
        if (this._curIdx >= len - 1) {
            t -= inputMax;
            this._curIdx = 0;
        }
        const count = TYPE2NUMOFCOMPONENT[this.output._type];
        let i = this._curIdx;
        let o = i * count;
        let on = o + count;
        let u = Math.max(0, t - this._inputTypedArray[i]) / (this._inputTypedArray[i + 1] - this._inputTypedArray[i]);
        const fv4 = new Vec4();
        const sv4 = new Vec4();
        for (let j = 0; j < count; j++) {
            fv4._out[j] = this._outputTypedArray[o + j];
            sv4._out[j] = this._outputTypedArray[on + j];
        }
        //calcute _curValue by lerp function
        switch (interpolation) {
            case 'LINEAR':
                this._curValue.lerp(fv4, sv4, u);
                break;
            default:
                break;
        }
    }
}

module.exports = GAnimationSampler;