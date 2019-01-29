const { PHYSICAL_CONSTANT } = require('../utils/constant'),
  GProgram = require('./GProgram'),
  GBuffer = require('./GBuffer'),
  GBufferView = require('./../object/GBufferView'),
  GAccessor = require('./../object/GAccessor'),
  GUniform = require('./GUniform');
const fragText = require('./../shader/barycentric-fs.glsl'),
  vertText = require('./../shader/barycentric-vs.glsl');
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
    this._gProgram = null;
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
   * isBufferGeometry
   * https://github.com/mrdoob/three.js/blob/02b5ba0b53f8f461e85c9877f5a6c0094bc2bbf3/src/geometries/WireframeGeometry.js#L72 
   */
  _geometryData() {
    const latitudeBands = 64,
      longitudeBands = 64,
      radiusX = this._radiusX,
      radiusY = this._radiusY,
      radiusZ = this._radiusZ,
      tCoords = [],
      vertices = [],
      indices = [],
      barycentric = [];
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
        var u = longNumber / longitudeBands;
        var v = latNumber / latitudeBands;
        tCoords.push(u);
        tCoords.push(v);
      }
    }
    //calcute indices
    for (let latNumber = 0; latNumber < latitudeBands; ++latNumber) {
      for (let longNumber = 0; longNumber < longitudeBands; ++longNumber) {
        let first = (latNumber * (longitudeBands + 1)) + longNumber;
        let second = first + longitudeBands + 1;
        indices.push(first);
        indices.push(second);
        indices.push(first + 1);
        indices.push(second);
        indices.push(second + 1);
        indices.push(first + 1);
      }
    }
    //calcute barycentric, every three points draw a trangle
    for (let i = 0, len = indices.length / 6; i < len; i++) {
      barycentric.push(0);
      barycentric.push(0);
      barycentric.push(1);
      barycentric.push(0);
      barycentric.push(0);
      barycentric.push(1);
    }
    // vertex data
    this._vertices = vertices;
    // vertex index
    this._indices = indices;
    // coords
    this._tCoords = tCoords;
    // barycentric
    this._barycentric = barycentric;
  }
  /**
   * init vertex buffer
   */
  _initialVertexBuffer() {
    const gl = this._gl,
      gProgram = this._gProgram;
    //create bufferView
    const vBufferView = new GBufferView(
      gl,
      this._vertices,
      this._vertices.length,
      {
        bufferType: gl.ARRAY_BUFFER,
        drawType: gl.STATIC_DRAW,
        byteOffset: 0,
        byteStride: 0
      });
    //a_position accessor
    const vAccessor = this._vAccessor = new GAccessor(
      gProgram,
      vBufferView,
      gl.FLOAT,
      'VEC3',
      this._vertices.length/3, // totallenght/Type.BYTES_PER_ELEMENT
      {
        byteOffset: 0,
        normalized: false
      });
    // gl.FLOAT, 0, false, this._vertices.length, 'VEC3', vBufferView);
    vAccessor.bindBuffer();
    vAccessor.bufferData();
    //turn on a_position
    vAccessor.link('a_position');
  }
  /**
   * 
   */
  _initialBarycentricBuffer() {
    const gl = this._gl,
      gProgram = this._gProgram;
    const bBufferView = new GBufferView(
      gl,
      this._barycentric,
      this._barycentric.length,
      {
        bufferType:gl.ARRAY_BUFFER,
        drawType:gl.STATIC_DRAW,
        byteOffset:0,
        byteStride:0
      }
    );
    const bAccessor = this._bAccessor = new GAccessor(
      gProgram,
      bBufferView,
      gl.FLOAT,
      'VEC2',
      this._barycentric.length/3,
      {
        byteOffset:0,
        normalized:false
      });
    //写入数据
    bAccessor.bindBuffer();
    bAccessor.bufferData();
    //turn on a_position
    bAccessor.link('a_barycentric');
  }
  /**
   * 
   */
  _initialIndexBuffer() {
    const gl = this._gl,
      gProgram = this._gProgram;
    // transform index data
    const iBuffer = this._iBuffer = new GBuffer(
      gProgram,
      new Uint16Array(this._indices),
      gl.ELEMENT_ARRAY_BUFFER,
      gl.STATIC_DRAW);
    iBuffer.bindBuffer();
    iBuffer.bufferData();
  }
  /**
   * 构造资源
   */
  _initComponents() {
    const gl = this._gl;
    //init program
    gl.getExtension('OES_standard_derivatives');
    const program = this._gProgram = new GProgram(gl, vertText, fragText);
    program.useProgram();
    //init buffer
    this._initialVertexBuffer();
    this._initialBarycentricBuffer();
    this._initialIndexBuffer();
    //camera matrix
    this._u_projectionMatrix = new GUniform(program, 'u_projectionMatrix');
    this._u_viewMatrix = new GUniform(program, 'u_viewMatrix');
    this._u_modelMatrix = new GUniform(program, 'u_modelMatrix');
  }
  /**
   * @typedef {import("../camera/PerspectiveCamera")} PerspectiveCamera
   * @param {PerspectiveCamera} camera
   */
  render(camera) {
    const gl = this._gl,
      program = this._gProgram,
      vAccessor = this._vAccessor,
      bAccessor = this._bAccessor,
      iBuffer = this._iBuffer,
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
    vAccessor.relink();
    bAccessor.relink();
    iBuffer.bindBuffer();
    //draw elements
    //https://developer.mozilla.org/en-US/docs/Web/API/OES_element_index_uint
    gl.drawElements(gl.TRIANGLES, this._indices.length, gl.UNSIGNED_SHORT, 0);
  }
}

module.exports = GGlobal;