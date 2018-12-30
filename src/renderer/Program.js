/**
 * merge objects
 */
const merge = require("./../utils/merge");
/**
 * default program options
 */
const PROGRAM_OPTIONS={
    debug:true
};
/**
 * @clas Program
 */
class Program {
    /**
     * 
     * @param {WebGLRenderingContext} gl 
     * @param {*} vertexShaderText 
     * @param {*} fragShaderText 
     * @param {*} [options] 
     */
    constructor(gl, vertexShaderText, fragShaderText, options) {
        /**
         * @type {WebGLRenderingContext}
         */
        this._gl = gl;
        /**
         * merge (cover by options)
         */
        this._options = merge(PROGRAM_OPTIONS,options||{});
        /**
         * vertex shader
         * @type {WebGLShader}
         */
        this._vs = this._createShader(gl.VERTEX_SHADER,vertexShaderText);
        /**
         * fragment shader
         * @type {WebGLShader}
         */
        this._fs = this._createShader(gl.FRAGMENT_SHADER,fragShaderText);
        /**
         * real program
         * @type {WebGLProgram}
         */
        this._program = this._createProgram();
    }

    /**
     * 
     */
    useProgram(){
        const gl = this._gl,
            program = this._program;
        gl.useProgram(program);
    }

    /**
     * 
     * @param {number} type 
     * @param {string} source 
     */
    _createShader(type,source){
        const gl = this._gl,
            options = this._options;
        const shader = gl.createShader(type);
        gl.shaderSource(shader,source);
        gl.compileShader(shader);
        if(options.debug) gl.getShaderInfoLog(shader);
    }

    /**
     * 
     */
    _createProgram(){
        const options = this._options,
            gl = this._gl,
            vs = this._vs,
            fs = this._fs;
        const program = gl.createProgram();
        gl.attachShader(program,vs);
        gl.attachShader(program,fs);
        gl.linkProgram(program);
        if(options.debug) gl.getProgramInfoLog(program);
    }

}

module.exports = Program;