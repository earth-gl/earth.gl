/**
 * merge objects
 */
const merge = require("./../utils/merge");
/**
 * default program options
 */
const PROGRAM_OPTIONS = {
    debug: true
};
/**
 * @class Program
 */
class Program {
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
    get ActivateAttributes(){
        return this._attribs;
    }

    /**
     * get activate unifroms
     * @type {Object}
     */
    get ActivateUniforms(){
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
        if (options.debug) gl.getShaderInfoLog(shader);
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
        if (options.debug) gl.getProgramInfoLog(program);
    }

    /**
     * reference:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getActiveAttrib
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getActiveUniform
     */
    _activate() {
        const gl = this._gl,
            program = this._program,
            attribs = this._attribs,
            uniforms = this._uniforms;
        //attrib
        const numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
        for (let i = 0; i < numAttribs; ++i) {
            const info = gl.getActiveAttrib(program, i);
            attribs[info.name] = { location: i, type: info.type, size: info.size, name: info.name };
        }
        //uniform
        const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < numUniforms; ++i) {
            const info = gl.getActiveUniform(program, i);
            uniforms[info.name] = { location: i, type: info.type, size: info.size };
        }
    }

}

module.exports = Program;