const glslify = require("glslify"),
  isNode = require("../utils/isNode"),
  { PHYSICAL_CONSTANT } = require("../utils/constant"),
  GProgram = require("./GProgram"),
  GBuffer = require("./GBuffer"),
  GUniform = require("./GUniform");
/**
 * glsl resource
 */
const fragText = isNode ? glslify.file("./../shader/glsl-earth-gl-camera-fs.glsl") : require("./../shader/glsl-earth-gl-camera-fs.glsl");
const vertText = isNode ? glslify.file("./../shader/glsl-earth-gl-camera-vs.glsl") : require("./../shader/glsl-earth-gl-camera-vs.glsl");

/**
 * 绘制全球
 * https://github.com/AnalyticalGraphicsInc/cesium/blob/master/Source/Scene/Globe.js
 * https://github.com/AnalyticalGraphicsInc/cesium/blob/22dce1d9aaf480b0cbea6148b05a4c482ce80f00/Source/Core/Ellipsoid.js
 */
class GGlobal {
  /**
   *
   * @param {WebGLRenderingContext} gl
   */
  constructor(gl) {
    /**
     * @type {WebGLRenderingContext}
     */
    this._gl = gl;
    /**
     *
     */
    this._radiusX = PHYSICAL_CONSTANT.EARTH_RADIUS_X;
    /**
     *
     */
    this._radiusY = PHYSICAL_CONSTANT.EARTH_RADIUS_Y;
    /**
     *
     */
    this._radiusZ = PHYSICAL_CONSTANT.EARTH_RADIUS_Z;
    /**
     *
     */
    this._vertices = [];
    /**
     *
     */
    this._indexs = [];
    /**
     * 
     */
    this._u_projectionMatrix = null;
    /**
     * 
     */
    this._u_viewMatrix = null;
    /**
     * 
     */
    this._u_modelMatrix = null;
    /**
     * 
     */
    this._program = null;
    /**
     * 计算geometry vertex index normal
     */
    this._geometryData();
    /**
     * 组织资源
     */
    this._initComponents();
  }
  /**
   * 计算geometry资源
   */
  _geometryData() {
    const latitudeBands = 64, 
    longitudeBands = 64, 
    radiusX = this._radiusX,
    radiusY = this._radiusY, 
    radiusZ = this._radiusZ,
    vertexPositionData = [], 
    indexData = [];
    for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
      var theta = latNumber * Math.PI / latitudeBands;
      var sinTheta = Math.sin(theta);
      var cosTheta = Math.cos(theta);
      for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
        var phi = longNumber * 2 * Math.PI / longitudeBands;
        var sinPhi = Math.sin(phi);
        var cosPhi = Math.cos(phi);
        var x = cosPhi * sinTheta;
        var y = cosTheta;
        var z = sinPhi * sinTheta;
        // colors = [[1.0, 1.0, 0.3, 1.0]];
        vertexPositionData.push(radiusX * x);
        vertexPositionData.push(radiusY * y);
        vertexPositionData.push(radiusZ * z);
        var first = (latNumber * (longitudeBands + 1)) + longNumber;
        var second = first + longitudeBands + 1;
        indexData.push(first);
        indexData.push(second);
        indexData.push(first + 1);
        indexData.push(second);
        indexData.push(second + 1);
        indexData.push(first + 1);
      }
    }
    //
    this._vertices = vertexPositionData;
    //
    this._indexs = indexData;
  }
  /**
   * 构造资源
   */
  _initComponents() {
    //
    const gl = this._gl;
    const program = this._program = new GProgram(gl, vertText, fragText);
    //
    program.useProgram();
    //
    const verticesBuffer = this._verticesBuffer = new GBuffer(program, gl.ARRAY_BUFFER, gl.STATIC_DRAW, "a_position");
    // transform data
    verticesBuffer.bindBuffer();
    verticesBuffer.bufferData(new Float32Array(this._vertices));
    verticesBuffer.linkPointerAndPosition(3, gl.FLOAT, false, 0, 0);
    // transform index data
    const indexBuffer = this._indexBuffer = new GBuffer(program, gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW);
    indexBuffer.bindBuffer();
    indexBuffer.bufferData(new Uint16Array(this._indexs));
    //
    this._u_projectionMatrix = new GUniform(program, "u_projectionMatrix");
    this._u_viewMatrix = new GUniform(program, "u_viewMatrix");
    this._u_modelMatrix = new GUniform(program, "u_modelMatrix");
  }
  /**
   * @typedef {import("../camera/PerspectiveCamera")} PerspectiveCamera
   * @param {PerspectiveCamera} camera
   */
  render(camera) {
    const gl = this._gl,
      program = this._program;
    // verticesBuffer = this._verticesBuffer,
    // indexBuffer = this._indexBuffer;
    //use program
    program.useProgram();
    //bind 
    // verticesBuffer.bindBuffer();
    // indexBuffer.bindBuffer();
    //set camera
    this._u_projectionMatrix.assignValue(camera.ProjectionMatrix);
    this._u_viewMatrix.assignValue(camera.ViewMatrix);
    this._u_modelMatrix.assignValue(camera.IdentityMatrix);
    //
    gl.drawElements(gl.TRIANGLES, this._indexs.length, gl.UNSIGNED_SHORT, 0);
  }
}

module.exports = GGlobal;