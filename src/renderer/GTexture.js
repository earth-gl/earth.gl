/**
 * @author yellow date 2019/2/3
 * @class
 */
class GTexture {
    /**
     * 
     * @param {WebGLRenderingContext} gl
     * @param {Uint8Array} pixel
     * @param {Number} width
     * @param {Number} height
     * @param {Number} format gl.RGBA
     * @param {Number} srcFormat gl.RGBA
     * @param {Number} srcType gl.UNSIGNED_BYTE
     * @param {Number} textureTyp] default is gl.TEXTURE_2D
     */
    constructor(gl, pixel, width, height, format, srcFormat, srcType, textureType) {
        /**
         * @type {WebGLRenderingContext}
         */
        this._gl = gl;
        /**
         * @type {WebGLRenderingContextBase.TEXTURE_2D}
         */
        this._textureType = textureType || gl.TEXTURE_2D;
        /**
         * @type {Uint8Array}
         */
        this._pixel = pixel;
        /**
         * @type {Number}
         */
        this._format = format || gl.RGBA;
        /**
         * @type {Number}
         */
        this._srcFormat = srcFormat || gl.RGBA;
        /**
         * @type {Number}
         */
        this._srcType = srcType || gl.UNSIGNED_BYTE;
        /**
         * @type {Number}
         */
        this._width = width;
        /**
         * @type {Number}
         */
        this._height = height;
        /**
         * @type {WebGLTexture}
         */
        this._texture = this._createTexture();
    }
    /**
     * text image 2d and set parameteri
     */
    texImage2D() {
        const gl = this._gl,
            pixel = this._pixel,
            width = this._width,
            height = this._height,
            format = this._format,
            srcFormat = this._srcFormat,
            srcType = this._srcType,
            textureType = this._textureType;
        //bind texture
        this.bindTexture();
        //textimage 2d
        gl.texImage2D(textureType, 0, format, width, height, 0, srcFormat, srcType, pixel);
        //set parameteri
        if (this._isPowerOf2(width) && this._isPowerOf2(height)) {
            //generate mips.
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            //wrapping to clamp to edge
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    }
    /**
     * bind texture
     */
    bindTexture() {
        const gl = this._gl,
            textureType = this._textureType,
            texture = this._texture;
        gl.bindTexture(textureType, texture);
    }
    /**
     * 
     */
    _activeTexture() {
        const gl = this._gl,
            texture = this._texture;
        gl.activeTexture(texture);
    }
    /**
     * check the value is power of 2
     */
    _isPowerOf2(value) {
        return (value & (value - 1)) == 0;
    }
    /**
     * create webgl handler
     */
    _createTexture() {
        const gl = this._gl;
        return gl.createTexture();
    }
}

module.exports = GTexture;