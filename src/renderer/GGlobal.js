const fragText = require("./../shader/glsl-earth-gl-camera-fs.glsl"),
  vertText = require("./../shader/glsl-earth-gl-camera-vs.glsl"),
  { PHYSICAL_CONSTANT } = require("../utils/constant"),
  GProgram = require("./GProgram"),
  GBuffer = require("./GBuffer"),
  GAccessor = require("./GAccessor"),
  GUniform = require("./GUniform");
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
    this._indices = [];
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
      tCoords = [],
      vertices = [],
      indices = [];
    //calcute vertices
    for (let latNumber = 0; latNumber <= latitudeBands; latNumber++) {
      var theta = latNumber * Math.PI / latitudeBands;
      var sinTheta = Math.sin(theta);
      var cosTheta = Math.cos(theta);
      for (let longNumber = 0; longNumber <= longitudeBands; longNumber++) {
        var phi = longNumber * 2 * Math.PI / longitudeBands;
        var sinPhi = Math.sin(phi);
        var cosPhi = Math.cos(phi);
        //
        var x = cosPhi * sinTheta;
        var y = cosTheta;
        var z = sinPhi * sinTheta;
        vertices.push(radiusX * x);
        vertices.push(radiusY * y);
        vertices.push(radiusZ * z);
        //
        var u = longNumber/longitudeBands;
        var v = latNumber/latitudeBands;
        tCoords.push(u);
        tCoords.push(v);
      }
    }
    //calcute indices
    for (let latNumber = 0; latNumber < latitudeBands; latNumber++) {
      for (let longNumber = 0; longNumber < longitudeBands; longNumber++) {
        const A = (latNumber * (longitudeBands + 1)) + longNumber,
          B = A + longitudeBands + 1,
          C = A+1,
          D = B+1;
        indices.push(A);
        indices.push(B);
        indices.push(C);
        indices.push(B);
        indices.push(D);
        indices.push(C);
      }
    }
    //vertex data
    this._vertices = vertices;
    //vertex index
    this._indices = indices;
    //coords
    this._tCoords = tCoords;
  }
  /**
   * 构造资源
   */
  _initComponents() {
    const gl = this._gl;
    const program = this._program = new GProgram(gl, vertText, fragText);
    program.useProgram();
    //创建顶点buffer
    const verticesBuffer = new GBuffer(
      program, gl.ARRAY_BUFFER, gl.STATIC_DRAW,
      new Float32Array(this._vertices),
      this._vertices.length, 0, 0);
    //写入数据
    verticesBuffer.bindBuffer();
    verticesBuffer.bufferData();
    // accessor attrib
    const verticesAccessor = new GAccessor(
      gl.FLOAT, 0, false,
      this._vertices.length,
      "VEC3", verticesBuffer);
    verticesAccessor.link("a_position");
    // transform index data
    const indexBuffer = new GBuffer(
      program, gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW,
      new Uint16Array(this._indices),
      this._indices.length, 0, 0);
    indexBuffer.bindBuffer();
    indexBuffer.bufferData();
    //camera matrix
    this._u_projectionMatrix = new GUniform(program, "u_projectionMatrix");
    this._u_viewMatrix = new GUniform(program, "u_viewMatrix");
    this._u_modelMatrix = new GUniform(program, "u_modelMatrix");
    //bind resource
    this._verticesAccessor = verticesAccessor;
    this._indicesBuffer = indexBuffer;
    this._verticesBuffer = verticesBuffer;
  }
  /**
   * @typedef {import("../camera/PerspectiveCamera")} PerspectiveCamera
   * @param {PerspectiveCamera} camera
   */
  render(camera) {
    const gl = this._gl,
      program = this._program,
      aBuffer = this._verticesAccessor,
      vBuffer = this._verticesBuffer,
      iBuffer = this._indicesBuffer,
      u_projectionMatrix = this._u_projectionMatrix,
      u_viewMatrix = this._u_viewMatrix,
      u_modelMatrix = this._u_modelMatrix;
    //use program
    program.useProgram();
    //set camera
    u_projectionMatrix.assignValue(camera.ProjectionMatrix);
    u_viewMatrix.assignValue(camera.ViewMatrix);
    u_modelMatrix.assignValue(camera.IdentityMatrix);
    //bind buffer
    vBuffer.bindBuffer();
    aBuffer.relink();
    iBuffer.bindBuffer();
    //draw elements
    //https://developer.mozilla.org/en-US/docs/Web/API/OES_element_index_uint
    gl.drawElements(gl.TRIANGLES, this._indices.length, gl.UNSIGNED_SHORT, 0);
  }
}

module.exports = GGlobal;