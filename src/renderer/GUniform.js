/**
 * @class
 */
class GUniform {
    /**
     * @typedef {import("./GProgram")} GProgram
     * @param {GProgram} program 
     * @param {string} uniformName 
     */
    constructor(program, uniformName) {
        /**
         * 
         */
        this._program = program;
        /**
         * @type {WebGLRenderingContext}
         */
        this._gl = program._gl;
        /**
         * 
         */
        this._uniformName = uniformName;
        /**
         * 
         */
        this._funcName = null;
        /**
         * @type {Number}
         */
        this._location = -1;
        /**
         * analysis funcName and location
         */
        this._getLocationAndFunc();
    }
    /**
     * 
     */
    _getLocationAndFunc() {
        //FLOAT_MAT4
        const gl = this._gl,
            uniformName = this._uniformName,
            program = this._program,
            uniform = program.ActivateUniforms[uniformName] || program.getUniformLocation (uniformName);
        if(!uniform) return;
        if (uniform.type === gl.FLOAT_MAT4)
            this._funcName = 'uniformMatrix4fv';
        else if(uniform.type === gl.SAMPLER_2D){
            this._funcName = 'uniform1i';
        }
        this._location = uniform.location;
    }
    /**
     * 赋值操作
     * 1. 要求数值必须经过Normalized，由于shader精度问题，这里强制使用cpu计算
     * 2. 根据program uniform类型记录得到值
     */
    assignValue(arr) {
        const funcName = this._funcName,
            location = this._location,
            gl = this._gl;
        !funcName ? console.log('unkonwn unifrom type') : gl[funcName].apply(gl, [location, false, arr]);
    }
}

module.exports = GUniform;