const merge = require('../utils/merge');
/**
 * default program options
 */
const PROGRAM_OPTIONS = {
    debug: false
};
/**
 * @class Program
 */
class GProgram {
    /**
     * Creates an instance of Program.
     * @param {WebGLRenderingContext} gl
     * @param {String} vertexShaderText
     * @param {String} fragShaderText
     * @param {Object} [options]
     * @param {Boolean} [options.debug]
     * @memberof Program
     */
    constructor(gl, vertexShaderText, fragShaderText, options) {
        /**
         * @type {WebGLRenderingContext}
         */
        this._gl = gl;
        /**
         * merge (cover by options)
         */
        this._options = merge(PROGRAM_OPTIONS, options || {});
        /**
         * vertex shader
         * @type {WebGLShader}
         */
        this._vs = this._createShader(gl.VERTEX_SHADER, vertexShaderText);
        /**
         * fragment shader
         * @type {WebGLShader}
         */
        this._fs = this._createShader(gl.FRAGMENT_SHADER, fragShaderText);
        /**
         * real program
         * @type {WebGLProgram}
         */
        this._program = this._createProgram();
        /**
         * @type {Object}
         */
        this._uniforms = {};
        /**
         * @type {Object}
         */
        this._attribs = {};
        /**
         * activate attributes and uniforms
         */
        this._activate();
    }

    /**
     * get activate attributes
     * @type {Object}
     */
    get ActivateAttributes() {
        return this._attribs;
    }

    /**
     * get activate unifroms
     * @type {Object}
     */
    get ActivateUniforms() {
        return this._uniforms;
    }
    /**
     * 
     */
    useProgram() {
        const gl = this._gl,
            program = this._program;
        gl.useProgram(program);
    }
    /**
     * 
     * @param {number} type 
     * @param {string} source 
     */
    _createShader(type, source) {
        const gl = this._gl,
            options = this._options;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (options.debug) console.log(gl.getShaderInfoLog(shader));
        return shader;
    }
    /**
     * 
     */
    _createProgram() {
        const options = this._options,
            gl = this._gl,
            vs = this._vs,
            fs = this._fs;
        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (options.debug) console.log(gl.getProgramInfoLog(program));
        return program;
    }
    /**
     * reference:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getActiveAttrib
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getActiveUniform
     */
    _activate() {
        //bridge
        const gl = this._gl,
            program = this._program;
        //attrib
        const numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
        for (let i = 0; i < numAttribs; ++i) {
            const info = gl.getActiveAttrib(program, i);
            this._attribs[info.name] = gl.getAttribLocation(program, info.name);
        }
        //uniform
        const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < numUniforms; ++i) {
            const info = gl.getActiveUniform(program, i);
            this._uniforms[info.name] = { location: gl.getUniformLocation(program, info.name), type: info.type, size: info.size };
        }
    }
    /**
     * force to get unifrom location
     * @param {String} name 
     */
    getUniformLocation(name) {
        const gl = this._gl,
            program = this._program,
            uniforms = this._uniforms,
            location = gl.getUniformLocation(program, name);
        if (location) {
            const info = {};
            const typedArray = gl.getUniform(program, location);
            //todo }{ wait supplement. convert to uniform info 
            if ((typedArray instanceof Float32Array) && typedArray.length === 16) {
                info.type = gl.FLOAT_MAT4;
                info.size = 16;
            }
            uniforms[name] = { location: location, type: info.type, size: info.size };
        }
        return uniforms[name];
    }
}

module.exports = GProgram;