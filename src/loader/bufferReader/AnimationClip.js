const { Vec3, Mat4, Quat } = require("kiwi.matrix");

const AnimationClip = {

    _getTRS(gltf, trs, node, time) {
        const animations = gltf.animations;
        animations.forEach(animation => {
            const channels = animation.channels;
            for (let i = 0; i < channels.length; i++) {
                const channel = channels[i];
                if (channel.target.node === node) {
                    if (channel.target.path === "translation") {
                        trs.T = this._getAnimateData(trs.T, animation.samplers[channel.sampler], time);
                    } else if (channel.target.path === "rotation") {
                        trs.R = this._getQuaternion(trs.R, animation.samplers[channel.sampler], time);
                    } else if (channel.target.path === "scale") {
                        trs.S = this._getAnimateData(trs.S, animation.samplers[channel.sampler], time);
                    }
                }
            }
        });
        return trs;
    },

    _getAnimateData(out, sampler, time) {
        switch (sampler.interpolation) {
        case "LINEAR": {
            const preNext = this._getPreNext(sampler, time, 1);
            vec3.lerp(out, preNext.previous, preNext.next, preNext.interpolation.value);
            break;
        }
        case 'STEP': {
            const preNext = this._getPreNext(sampler, time, 1);
            out = preNext.previous;
            break;
        }
        case 'CUBICSPLINE': {
            const preNext = this._getPreNext(sampler, time, 3);
            out = this._getCubicSpline(preNext.interpolation, preNext.previous, preNext.next, sampler.input.array, 3);
            break;
        }
        }
        return out;
    },
    /**
     * 
     * @param {} out 
     * @param {*} sampler 
     * @param {*} time 
     * @returns {Quat}
     */
    _getQuaternion(out, sampler, time) {
        switch (sampler.interpolation) {
        case 'LINEAR': {
            const preNext = this._getPreNext(sampler, time, 1);
            quat.slerp(out, preNext.previous, preNext.next, preNext.interpolation.value);
            break;
        }
        case 'STEP': {
            const preNext = this._getPreNext(sampler, time, 1);
            out = preNext.previous;
            break;
        }
        case 'CUBICSPLINE': {
            const preNext = this._getPreNext(sampler, time, 3);
            preNext.previous = preNext.previous.map(d => {
                return Math.acos(d);
            });
            preNext.next = preNext.next.map(d => {
                return Math.acos(d);
            });
            out = this._getCubicSpline(preNext.interpolation, preNext.previous, preNext.next, sampler.input.array, 3);
            out = out.map(value => {
                return Math.cos(value);
            });
            break;
        }
        }
        return out;
    },
    /**
     * 
     * @param {*} sampler 
     * @param {*} time 
     * @param {*} stride 
     */
    _getPreNext(sampler, time, stride) {
        const input = sampler.input.array;
        const output = sampler.output.array;
        const itemSize = sampler.output.itemSize;
        const interpolation = this._getInterpolation(input, time);
        //previous + interpolationValue * (next - previous)
        const previous = output.slice(interpolation.preIndex * itemSize * stride, (interpolation.preIndex + 1) * itemSize * stride);
        const next = output.slice(interpolation.nextIndex * itemSize * stride, (interpolation.nextIndex + 1) * itemSize * stride);
        return { previous, next, interpolation };
    },

    _getInterpolation(input, time) {
        if (time < input[0] || time > input[input.length - 1]) {
            time = Math.max(input[0], Math.min(input[input.length - 1], time));
        } if (time === input[input.length - 1]) {
            time = input[0];
        }
        for (let i = 0; i < input.length - 1; i++) {
            if (time >= input[i] && time < input[i + 1]) {
                const previousTime = input[i];
                const nextTime = input[i + 1];
                return {
                    preIndex:i,
                    nextIndex:i + 1,
                    value:(time - previousTime) / (nextTime - previousTime)
                };
            }
        }
        return null;
    },

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
    },

    getModelMarix(gltf, node, time) {
        const trs = this._getTRS(gltf, {T:[0, 0, 0], R:[0, 0, 0, 1], S:[1, 1, 1]}, node, time);
        return mat4.fromRotationTranslationScale([], trs.R, trs.T, trs.S);
    }
    
};

module.exports = AnimationClip;