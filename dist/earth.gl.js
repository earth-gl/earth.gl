var earth = (function (exports) {
    'use strict';

    var glslEarthGlCameraFs = "#define GLSLIFY 1\nvarying vec4 v_color;\n\nvoid main() { \n    gl_FragColor = v_color; \n}"; // eslint-disable-line

    var glslEarthGlCameraFs$1 = /*#__PURE__*/Object.freeze({
        default: glslEarthGlCameraFs
    });

    var glslEarthGlCameraVs = "#define GLSLIFY 1\n/**\n *  将目标物体投影到屏幕坐标\n */\n\nvec4 targetpos(mat4 u_projectionMatrix, mat4 u_viewMatrix, mat4 u_modelMatrix , vec3 a_position){\n    return u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(a_position, 1.0);\n}\n\nuniform mat4 u_projectionMatrix;\nuniform mat4 u_viewMatrix;\nuniform mat4 u_modelMatrix;\n\n//物体位置\nattribute vec3 a_position;\n\nvarying vec4 v_color;\n\nvoid main() { \n\n    v_color = vec4(normalize(a_position),1.0);\n    gl_Position = targetpos(u_projectionMatrix, u_viewMatrix, u_modelMatrix, a_position);\n}"; // eslint-disable-line

    var glslEarthGlCameraVs$1 = /*#__PURE__*/Object.freeze({
        default: glslEarthGlCameraVs
    });

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      return Constructor;
    }

    function _extends() {
      _extends = Object.assign || function (target) {
        for (var i = 1; i < arguments.length; i++) {
          var source = arguments[i];

          for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
              target[key] = source[key];
            }
          }
        }

        return target;
      };

      return _extends.apply(this, arguments);
    }

    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function");
      }

      subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
          value: subClass,
          writable: true,
          configurable: true
        }
      });
      if (superClass) _setPrototypeOf(subClass, superClass);
    }

    function _getPrototypeOf(o) {
      _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
        return o.__proto__ || Object.getPrototypeOf(o);
      };
      return _getPrototypeOf(o);
    }

    function _setPrototypeOf(o, p) {
      _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
        o.__proto__ = p;
        return o;
      };

      return _setPrototypeOf(o, p);
    }

    function _assertThisInitialized(self) {
      if (self === void 0) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }

      return self;
    }

    function _possibleConstructorReturn(self, call) {
      if (call && (typeof call === "object" || typeof call === "function")) {
        return call;
      }

      return _assertThisInitialized(self);
    }

    /**
    *   @author }{yellow 2017/4/18
    *   @returns {Object} 合并后对象
    */

    /**
     * @func
     */
    var merge = function merge() {
      for (var _len = arguments.length, sources = new Array(_len), _key = 0; _key < _len; _key++) {
        sources[_key] = arguments[_key];
      }

      return _extends.apply(void 0, [{}].concat(sources));
    };

    var merge_1 = merge;

    /**
     * merge objects
     */

    /**
     * default program options
     */

    var PROGRAM_OPTIONS = {
      debug: true
    };
    /**
     * @class Program
     */

    var GProgram =
    /*#__PURE__*/
    function () {
      /**
       * Creates an instance of Program.
       * @param {WebGLRenderingContext} gl
       * @param {String} vertexShaderText
       * @param {String} fragShaderText
       * @param {Object} [options]
       * @param {Boolean} [options.debug]
       * @memberof Program
       */
      function GProgram(gl, vertexShaderText, fragShaderText, options) {
        _classCallCheck(this, GProgram);

        /**
         * @type {WebGLRenderingContext}
         */
        this._gl = gl;
        /**
         * merge (cover by options)
         */

        this._options = merge_1(PROGRAM_OPTIONS, options || {});
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


      _createClass(GProgram, [{
        key: "useProgram",

        /**
         * 
         */
        value: function useProgram() {
          var gl = this._gl,
              program = this._program;
          gl.useProgram(program);
        }
        /**
         * 
         * @param {number} type 
         * @param {string} source 
         */

      }, {
        key: "_createShader",
        value: function _createShader(type, source) {
          var gl = this._gl,
              options = this._options;
          var shader = gl.createShader(type);
          gl.shaderSource(shader, source);
          gl.compileShader(shader);
          if (options.debug) console.log(gl.getShaderInfoLog(shader));
          return shader;
        }
        /**
         * 
         */

      }, {
        key: "_createProgram",
        value: function _createProgram() {
          var options = this._options,
              gl = this._gl,
              vs = this._vs,
              fs = this._fs;
          var program = gl.createProgram();
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

      }, {
        key: "_activate",
        value: function _activate() {
          var gl = this._gl,
              program = this._program; //attrib

          var numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

          for (var i = 0; i < numAttribs; ++i) {
            var info = gl.getActiveAttrib(program, i);
            this._attribs[info.name] = gl.getAttribLocation(program, info.name);
          } //uniform


          var numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

          for (var _i = 0; _i < numUniforms; ++_i) {
            var _info = gl.getActiveUniform(program, _i);

            this._uniforms[_info.name] = {
              location: gl.getUniformLocation(program, _info.name),
              type: _info.type,
              size: _info.size
            };
          }
        }
      }, {
        key: "ActivateAttributes",
        get: function get() {
          return this._attribs;
        }
        /**
         * get activate unifroms
         * @type {Object}
         */

      }, {
        key: "ActivateUniforms",
        get: function get() {
          return this._uniforms;
        }
      }]);

      return GProgram;
    }();

    var GProgram_1 = GProgram;

    /**
     * @typedef {import("./GProgram")} GProgram
     */

    /**
     * @module
     * @export
     * @class
     * @example
     * var buffer = new Buffer();
     * buffer.bindBuffer();
     * buffer.bufferData();
     */
    var GBuffer =
    /*#__PURE__*/
    function () {
      /**
       * Creates an instance of Buffer.
       * @param {GProgram} program 
       * @param {Number} bufferType gl.ARRAY_BUFFER
       * @param {number} drawType gl.STATIC_DRAW 
       * @param {string} attribName "a_position"
       * @memberof Buffer
       */
      function GBuffer(program, bufferType, drawType, attribName) {
        _classCallCheck(this, GBuffer);

        /**
         * @type {GProgram}
         */
        this._program = program;
        /**
         * @type {WebGLRenderingContext}
         */

        this._gl = program._gl;
        /**
         * @type {WebGLBuffer}
         */

        this._buffer = this._createBuffer();
        /**
         * @type {Number}
         */

        this._bufferType = bufferType;
        /**
         * @type {Number}
         */

        this._drawType = drawType;
        /**
         * @type {String}
         */

        this._attribName = attribName;
        /**
         * @type {Number}
         */

        this._attribLocation = !attribName ? null : program.ActivateAttributes[attribName];
      }
      /**
       * 
       * @param {Number} type gl.ARRAY_BUFFER
       */


      _createClass(GBuffer, [{
        key: "bindBuffer",
        value: function bindBuffer() {
          var gl = this._gl,
              bufferType = this._bufferType,
              buffer = this._buffer;
          gl.bindBuffer(bufferType, buffer);
        }
        /**
         * 
         * @param {Array} arr , mat4,vec3...
         */

      }, {
        key: "bufferData",
        value: function bufferData(arr) {
          var gl = this._gl,
              bufferType = this._bufferType,
              drawType = this._drawType;
          gl.bufferData(bufferType, arr, drawType);
        }
        /**
         * turn on the attribute
         * 制定数据输入方式和输入管道
         * 关联缓冲区对象和position变量
         */

      }, {
        key: "linkPointerAndPosition",
        value: function linkPointerAndPosition(size, type, normalize, stride, offset) {
          var gl = this._gl,
              attribLocation = this._attribLocation;
          gl.vertexAttribPointer(attribLocation, size, type, normalize, stride, offset);
          gl.enableVertexAttribArray(attribLocation);
        }
        /**
         * 
         */

      }, {
        key: "_createBuffer",
        value: function _createBuffer() {
          var gl = this._gl;
          var buffer = gl.createBuffer();
          return buffer;
        }
      }]);

      return GBuffer;
    }();

    var GBuffer_1 = GBuffer;

    /**
     * @typedef {import("./GProgram")} GProgram
     */
    var GUniform =
    /*#__PURE__*/
    function () {
      /**
       * 
       * @param {GProgram} program 
       * @param {string} uniformName 
       */
      function GUniform(program, uniformName) {
        _classCallCheck(this, GUniform);

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

      _createClass(GUniform, [{
        key: "_getLocationAndFunc",
        value: function _getLocationAndFunc() {
          //FLOAT_MAT4
          var gl = this._gl,
              uniformName = this._uniformName,
              program = this._program,
              uniform = program.ActivateUniforms[uniformName];
          if (uniform.type === gl.FLOAT_MAT4) this._funcName = "uniformMatrix4fv";
          this._location = uniform.location;
        }
        /**
         * 赋值操作
         * 1. 要求数值必须经过Normalized，由于shader精度问题，这里强制使用cpu计算
         * 2. 根据program uniform类型记录得到值
         */

      }, {
        key: "assignValue",
        value: function assignValue(arr) {
          var funcName = this._funcName,
              location = this._location,
              gl = this._gl;
          if (!!funcName) gl[funcName].apply(gl, [location, false, arr]);else console.log("unkonwn unifrom type");
        }
      }]);

      return GUniform;
    }();

    var GUniform_1 = GUniform;

    /**
     * reference:
     * https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/common.js
     * 
     * switch to es6 syntax
     * @author yellow 2017/5/8
     */
    /**
     * the degree to rad factor
     * @type {number}
     */
    const degree = Math.PI / 180;
    /**
     * @class
     */
    class GLMatrix {

    }
    /**
     * the precision to indicate two value is equal
     * @type {number}
     */
    GLMatrix.EPSILON = 1e-6;
    /**
     * support ie9
     * @type {Float32Array|Array}
     */
    GLMatrix.ARRAY_TYPE = (typeof Float32Array !== 'undefined') ? Float32Array : Array;
    /**
     * the Math.random adapter
     * @func
     */
    GLMatrix.RANDOM = Math.random;
    /**
     * the default setting to use SIMD
     * @static
     */
    GLMatrix.ENABLE_SIMD = true;
    /**
     * indicate to use SIMD
     * @static
     */
    GLMatrix.SIMD_AVAILABLE = (GLMatrix.ARRAY_TYPE === Float32Array) && (typeof SIMD != 'undefined');
    /**
     * 使用simd
     * @type {boolean}
     */
    GLMatrix.USE_SIMD = GLMatrix.ENABLE_SIMD && GLMatrix.SIMD_AVAILABLE;
    /**
     * Set ArrayType,such as Float32Array or Array ([])
     * @param {Float32Array|Array} type Array type,such as Float32Array or Array
     */
    GLMatrix.setMatrixArrayType = (type) => {
        GLMatrix.ARRAY_TYPE = type;
    };
    /**
     * Convert degree to radian
     * @param {number} deg Angle in Degrees
     */
    GLMatrix.toRadian = (deg) => {
        return deg * degree;
    };
    /**
     * Convert rad to degree
     * @param {number} rad Angle in Radian
     */
    GLMatrix.toDegree = (rad) => {
        return rad / degree;
    };
    /**
     * #debug
     * @param {Object} obj 
     */
    GLMatrix.formatDisplay = (obj) => {
        let output = "\n";
        if (obj.constructor.name === 'mat4') {
            for (let i = 0; i < 4; i++)
                output += '[' + obj.value[i * 4] + ',' + obj.value[i * 4 + 1] + ',' + obj.value[i * 4 + 2] + ',' + obj.value[i * 4 + 3] + ']\n';
        }
    };
    /**
     * @param {number} a The first number to test.
     * @param {number} b The first number to test.
     * @return {boolean} True if the numbers are approximately equal, false otherwise.
     */
    GLMatrix.equals = (a, b) => {
        return Math.abs(a - b) <= GLMatrix.EPSILON * Math.max(1.0, Math.abs(a), Math.abs(b));
    };

    var GLMatrix_1 = GLMatrix;

    /**
     * reference https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/vec2.js
     * switch to es6 syntax
     * warning:if you don't want to change the source value,please use vec2.clone().* instead of vec2.*
     * @author yellow 2017/5/8
     */

    /**
     * @class
     */
    class Vec2 {
        /**
         * Creates a new, empty vec2
         */
        constructor() {
            /**
             * array store for vec2
             * @private
             */
            this._out = new GLMatrix_1.ARRAY_TYPE(2);
            this._out[0] = 0;
            this._out[1] = 0;
            return this;
        };
        /**
         * 
         */
        get x(){
            return this._out[0];
        }
        /**
         * 
         */
        get y(){
            return this._out[1];
        }
        /**
         * adapter for webgl matrix
         * get the array directly
         * @memberof vec2
         * @return {Array}
         */
        get value() {
            return this._out;
        };
        /**
         * generate a random vector
         */
        static random(scale = 1.0) {
            scale = scale || 1.0;
            let vec = new Vec2(),
                r = GLMatrix_1.RANDOM() * 2.0 * Math.PI;
            ax = Math.cos(r) * scale;
            ay = Math.sin(r) * scale;
            return vec;
        };
        /**
         * set value of vec2,such as [x,y]
         */
        set(x, y) {
            this._out[0] = x;
            this._out[1] = y;
            return this;
        };
        /**
         * Creates a new vec2 initialized with values from an existing vector
         */
        clone() {
            let vec = new Vec2();
            vec.set(this._out[0], this._out[1]);
            return vec;
        };
        /**
         * Add two vec2's
         * @param {Vec2} vec the vec2 which waiting for add
         */
        add(vec) {
            this._out[0] += vec._out[0];
            this._out[1] += vec._out[1];
            return this;
        };
        /**
         * substract vector vec from this
         * @param {Vec2} vec
         */
        sub(vec) {
            this._out[0] -= vec._out[0];
            this._out[1] -= vec._out[1];
            return this;
        };
        /**
         * multiplies two vec2's
         * @param {Vec2} 
         */
        multiply(vec) {
            this._out[0] *= vec._out[0];
            this._out[1] *= vec._out[1];
            return this;
        };
        /**
         * diveides two vec2's
         * 
         */
        divide(vec) {
            this._out[0] /= vec._out[0];
            this._out[1] /= vec._out[1];
            return this;
        };
        /**
         * use math.ceil to adjust the value of v0 v1
         * 
         */
        ceil() {
            this._out[0] = Math.ceil(this._out[0]);
            this._out[1] = Math.ceil(this._out[1]);
            return this;
        };
        /**
         * use math.floor to adjust the value of v0 v1
         */
        floor() {
            this._out[0] = Math.floor(this._out[0]);
            this._out[1] = Math.floor(this._out[1]);
            return this;
        };
        /**
         * use math.round to adjust the value of v0 v1
         */
        round() {
            this._out[0] = Math.round(this._out[0]);
            this._out[1] = Math.round(this._out[1]);
            return this;
        };
        /**
         * merge two vector's min value
         * 
         */
        min(vec) {
            this._out[0] = Math.min(this._out[0], vec._out[0]);
            this._out[1] = Math.min(this._out[1], vec._out[1]);
            return this;
        };
        /**
         *  merge two vector's max value
         */
        max(vec) {
            this._out[0] = Math.max(this._out[0], vec._out[0]);
            this._out[1] = Math.max(this._out[1], vec._out[1]);
            return this;
        };
        /**
         * Scales a vec2 by a scalar number
         * @param {Number} n
         */
        scale(n) {
            this._out[0] *= n;
            this._out[1] *= n;
            return this;
        };
        /**
         * Calculates the euclidian distance between two vec2's
         */
        distance(vec) {
            let x = this._out[0] - vec._out[0],
                y = this._out[1] - vec._out[2];
            return Math.sqrt(x * x + y * y);
        };
        /**
         * Calculates the manhattan distance between two vec2's
         */
        manhattanDistance(vec) {
            let x = Math.abs(this._out[0] - vec._out[0]),
                y = Math.abs(this._out[1] - vec._out[2]);
            return x + y;
        };
        /**
         * Calculates the chebyshev distance between two vec2's
         */
        chebyshevDistance(vec) {
            let x = Math.abs(this._out[0] - vec._out[0]),
                y = Math.abs(this._out[1] - vec._out[2]);
            return Math.max(x, y);
        };
        /**
         * Calculates the length of a vec2
         */
        len() {
            return this.distance(new Vec2());
        };
        /**
         * Negates the components of a vec2
         */
        negate() {
            this._out[0] = -this._out[0];
            this._out[1] = -this._out[1];
            return this;
        };
        /**
         * Returns the inverse of the components of a vec2
         */
        inverse() {
            this._out[0] = 1.0 / this._out[0];
            this._out[1] = 1.0 / this._out[1];
            return this;
        };
        /**
         * Normalize a vec2
         */
        normalize() {
            let len = this.vec2Length();
            if (len > 0) {
                //for the reason * has a high performance than /
                len = 1.0 / len;
                this._out[0] *= len;
                this._out[1] *= len;
            }
            return this;
        };
        /**
         * Calculates the dot product of two vec2's
         */
        dot(vec) {
            return this._out[0] * vec._out[0] + this._out[1] * vec._out[1];
        };
        /**
         * performs a linear interpolation between two vec2's
         * @param {Vec2} vec
         * @param {number} t interpolation amount between the two inputs
         */
        lerp(vec, t) {
            let [ax, ay] = this._out,
                [bx, by] = vec._out;
            this._out[0] = ax + t * (bx - ax);
            this._out[1] = ay + t * (by - ay);
            return this;
        };
        /**
         * Returns a string representation of a vector
         */
        toString() {
            return 'vec2(' + this._out[0] + ',' + this._out[1] + ')';
        };
        /**
         * Transforms the vec2 with a mat3
         * @param {mat3} mat matrix to transform with
         */
        transformMat3(mat) {
            let [x, y] = this._out;
            this._out[0] = mat._out[0] * x + mat._out[3] * y + mat._out[6];
            this._out[1] = mat._out[1] * x + mat._out[4] * y + mat._out[7];
            return this;
        };
        /**
         * Transforms the vec2 with a mat4
         */
        transformMat4(mat) {
            let [x, y] = this._out;
            this._out[0] = mat._out[0] * x + mat._out[4] * y + mat._out[5];
            this._out[1] = mat._out[1] * x + mat._out[5] * y + mat._out[13];
            return this;
        };
        /**
         * Returns whether or not the vectors have approximately the same elements in the same position.
         * precision
         */
        equals(vec) {
            let [a0, a1] = this._out,
                [b0, b1] = vec._out;
            return (Math.abs(a0 - b0) <= GLMatrix_1.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
                Math.abs(a1 - b1) <= GLMatrix_1.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)));
        };
    }
    var Vec2_1 = Vec2;

    /**
     * reference https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/vec3.js
     * switch to es6 syntax
     * warning:if you don't want to change the source value,please use vec3.clone().* instead of vec3.*
     * @author yellow 2017/5/8
     * 
     */


    /**
     * @class 3 Dimensional Vector
     * @name vec3
     */
    class Vec3 {
        /**
         * Creates a new, empty vec3
         */
        constructor() {
            /**
             * array store for vec3
             * @private
             */
            this._out = new GLMatrix_1.ARRAY_TYPE(3);
            this._out[0] = 0;
            this._out[1] = 0;
            this._out[2] = 0;
            return this;
        };
        /**
         * 
         */
        get x(){
            return this._out[0];
        }
        /**
         * 
         */
        get y(){
            return this._out[1];
        }
        /**
         * 
         */
        get z(){
            return this._out[2];
        }
        /**
         * adapter for webgl matrix
         * get the array directly
         * @memberof vec3
         * @return {Array}
         */
        get value() {
            return this._out;
        };
        /**
         * Generates a random vector with the given scale
         * @param {number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
         */
        static random(scale = 1.0) {
            let vec = new Vec3();
            scale = scale || 1.0;
            var r = GLMatrix_1.RANDOM() * 2.0 * Math.PI;
            var z = (GLMatrix_1.RANDOM() * 2.0) - 1.0;
            var z = Math.sqrt(1.0 - z * z) * scale;
            ax = Math.cos(r) * zScale;
            ay = Math.sin(r) * zScale;
            az = z * scale;
            vec.set(ax, ay, az);
            return vec;
        };

        /**
         * set value of v0 v1 v2
         */
        set(x, y, z) {
            this._out[0] = x;
            this._out[1] = y;
            this._out[2] = z;
            return this;
        };
        /**
         * Creates a new vec3 initialized with values from an existing vector
         */
        clone() {
            let vec = new Vec3();
            vec.set(this._out[0], this._out[1], this._out[2]);
            return vec;
        };
        /**
         * Adds two vec3's
         * @param {vec3} vec 
         */
        add(vec) {
            this._out[0] += vec._out[0];
            this._out[1] += vec._out[1];
            this._out[2] += vec._out[2];
            return this;
        };
        /**
         * Subtracts vector vec from vector this
         * @param {vec3} vec
         */
        sub(vec) {
            this._out[0] -= vec._out[0];
            this._out[1] -= vec._out[1];
            this._out[2] -= vec._out[2];
            return this;
        };
        /**
         * Multiplies two vec3's
         */
        multiply(vec) {
            this._out[0] *= vec._out[0];
            this._out[1] *= vec._out[1];
            this._out[2] *= vec._out[2];
            return this;
        };
        /**
         * Divides two vec3's
         */
        divide(vec) {
            this._out[0] /= vec._out[0];
            this._out[1] /= vec._out[1];
            this._out[2] /= vec._out[2];
            return this;
        };
        /**
         * Math.ceil the components of a vec3
         */
        ceil() {
            this._out[0] = Math.ceil(this._out[0]);
            this._out[1] = Math.ceil(this._out[1]);
            this._out[2] = Math.ceil(this._out[2]);
            return this;
        };
        /**
         * Math.floor the components of a vec3
         */
        floor() {
            this._out[0] = Math.floor(this._out[0]);
            this._out[1] = Math.floor(this._out[1]);
            this._out[2] = Math.floor(this._out[2]);
            return this;
        };
        /**
         * Math.round the components of a vec3
         */
        round() {
            this._out[0] = Math.round(this._out[0]);
            this._out[1] = Math.round(this._out[1]);
            this._out[2] = Math.round(this._out[2]);
            return this;
        };
        /**
         * Returns the minimum of two vec3's
         */
        min(vec) {
            this._out[0] = Math.min(this._out[0], vec._out[0]);
            this._out[1] = Math.min(this._out[1], vec._out[1]);
            this._out[2] = Math.min(this._out[2], vec._out[2]);
            return this;
        };
        /**
         * Returns the maximum of two vec3's
         */
        max(vec) {
            this._out[0] = Math.max(this._out[0], vec._out[0]);
            this._out[1] = Math.max(this._out[1], vec._out[1]);
            this._out[2] = Math.max(this._out[2], vec._out[2]);
            return this;
        };
        /**
         * Scales a vec3 by a scalar number
         * @param {number} v amount to scale the vector by
         */
        scale(v) {
            this._out[0] *= v;
            this._out[1] *= v;
            this._out[2] *= v;
            return this;
        };
        /**
         * Calculates the euclidian distance between two vec3's
         * @param {vec3} vec
         */
        distance(vec) {
            let [x0, y0, z0] = this._out,
                [x1, y1, z1] = vec._out,
                x = x0 - x1,
                y = y0 - y1,
                z = z0 - z1;
            return Math.sqrt(x * x + y * y + z * z);
        };
        /**
         * Calculates the length of a vec3
         */
        len() {
            return this.distance(new Vec3());
        };
        /**
         * Negates the components of a vec3
         */
        negate() {
            this._out[0] = -this._out[0];
            this._out[1] = -this._out[1];
            this._out[2] = -this._out[2];
            return this;
        };
        /**
         * Returns the inverse of the components of a vec3
         */
        inverse() {
            this._out[0] = 1.0 / this._out[0];
            this._out[1] = 1.0 / this._out[1];
            this._out[2] = 1.0 / this._out[2];
            return this;
        };
        /**
         * Normalize a vec3
         */
        normalize() {
            let len = this.len();
            if (len > 0) {
                len=1.0/len;
                this._out[0] *= len;
                this._out[1] *= len;
                this._out[2] *= len;
            }
            return this;
        };
        /**
         * Calculates the dot product of two vec3's
         * @param {vec3} vec
         */
        dot(vec) {
            let [x0, y0, z0] = this._out,
                [x1, y1, z1] = vec._out;
            return x0 * x1 + y0 * y1 + z0 * z1;
        };
        /**
         * Computes the cross product of two vec3's
         * https://webgl2fundamentals.org/webgl/lessons/webgl-3d-camera.html
         * calcue the perpendicular vec3 
         * @param {Vec3} v3
         * @return {Vec3}
         * @example
         * let v3_out = v3_in1.clone().cross(v3_in2);
         * the v3_out perpendicular to v3_in1 and v3_in2
         */
        cross(v3) {
            let [ax, ay, az] = this._out,
                [bx, by, bz] = v3.value;
            this._out[0] = ay * bz - az * by;
            this._out[1] = az * bx - ax * bz;
            this._out[2] = ax * by - ay * bx;
            return this;
        };
        /**
         * Performs a linear interpolation between two vec3's
         * @param {Vec3} vec
         * @param {number} t
         */
        lerp(vec, t) {
            let [ax, ay, az] = this._out,
                [bx, by, bz] = vec._out;
            this._out[0] = ax + t * (bx - ax);
            this._out[1] = ay + t * (by - ay);
            this._out[2] = az + t * (bz - az);
            return this;
        };
        /**
         * Performs a hermite interpolation with two control points
         * @param {Vec3} vecI
         * @param {Vec3} vecI
         * @param {Vec3} vecI
         * @param {number} t interpolation amount between the two inputs
         */
        hermite(vecI, vecII, vecIII, t) {
            let factorTimes2 = t * t,
                factor1 = factorTimes2 * (2 * t - 3) + 1,
                factor2 = factorTimes2 * (t - 2) + t,
                factor3 = factorTimes2 * (t - 1),
                factor4 = factorTimes2 * (3 - 2 * t);
            this._out[0] = this._out[0] * factor1 + vecI._out[0] * factor2 + vecII._out[0] * factor3 + vecIII._out[0] * factor4;
            this._out[1] = this._out[1] * factor1 + vecI._out[1] * factor2 + vecII._out[1] * factor3 + vecIII._out[1] * factor4;
            this._out[2] = this._out[2] * factor1 + vecI._out[2] * factor2 + vecII._out[2] * factor3 + vecIII._out[2] * factor4;
            return this;
        };
        /**
         * Performs a bezier interpolation with two control points
         * @param {Vec3} vecI
         * @param {Vec3} vecII
         * @param {Vec3} vecIII
         * @param {Number} t interpolation amount between the two inputs
         */
        bezier(vecI, vecII, vecIII, t) {
            var inverseFactor = 1 - t,
                inverseFactorTimesTwo = inverseFactor * inverseFactor,
                factorTimes2 = t * t,
                factor1 = inverseFactorTimesTwo * inverseFactor,
                factor2 = 3 * t * inverseFactorTimesTwo,
                factor3 = 3 * factorTimes2 * inverseFactor,
                factor4 = factorTimes2 * t;
            out[0] = this._out[0] * factor1 + vecI._out[0] * factor2 + vecII._out[0] * factor3 + vecIII._out[0] * factor4;
            out[1] = this._out[1] * factor1 + vecI._out[1] * factor2 + vecII._out[1] * factor3 + vecIII._out[1] * factor4;
            out[2] = this._out[2] * factor1 + vecI._out[2] * factor2 + vecII._out[2] * factor3 + vecIII._out[2] * factor4;
            return this
        };
        /**
         * Transforms the vec3 with a mat4.
         * 4th vector component is implicitly '1'
         * @param {mat4} mat the 4x4 matrix to transform with
         */
        transformMat4(mat) {
            let [x, y, z] = this._out,
                w = (mat._out[3] * x + mat._out[7] * y + mat._out[11] * z + mat._out[15]) || 1.0;
            this._out[0] = (mat._out[0] * x + mat._out[4] * y + mat._out[8] * z + mat._out[12]) / w;
            this._out[1] = (mat._out[1] * x + mat._out[5] * y + mat._out[9] * z + mat._out[13]) / w;
            this._out[2] = (mat._out[2] * x + mat._out[6] * y + mat._out[10] * z + mat._out[14]) / w;
            return this;
        };
        /**
         * Transforms the vec3 with a mat3.
         * @param {mat3} mat  the 3x3 matrix to transform with
         */
        transformMat3(mat) {
            let [x, y, z] = this._out;
            this._out[0] = x * mat._out[0] + y * mat._out[3] + z * mat._out[6];
            this._out[1] = x * mat._out[1] + y * mat._out[4] + z * mat._out[7];
            this._out[2] = x * mat._out[2] + y * mat._out[5] + z * mat._out[8];
            return this;
        };
        /**
         * returns a string represent vec3
         */
        toString() {
            return 'vec3(' + this._out[0] + ', ' + this._out[1] + ', ' + this._out[2] + ')';
        };
        /**
         * ransforms the vec3 with a quat
         * benchmarks: http://jsperf.com/quaternion-transform-vec3-implementations
         * @param {quat} q quaternion to transform with
         */
        transformQuat(q) {
            let [x, y, z] = this._out,
                [qx, qy, qz, qw] = q._out,
                // calculate quat * vec
                ix = qw * x + qy * z - qz * y,
                iy = qw * y + qz * x - qx * z,
                iz = qw * z + qx * y - qy * x,
                iw = -qx * x - qy * y - qz * z;
            this._out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
            this._out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
            this._out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
            return this;
        };
        /**
         * Rotate a 3D vector around the x-axis
         * @param {Vec3} vec the origin of the rotation
         * @param {number} c the angle of rotation
         */
        rotateX(vec, c) {
            var p = [], r = [];
            //Translate point to the origin
            p[0] = this._out[0] - vec._out[0];
            p[1] = this._out[1] - vec._out[1];
            p[2] = this._out[2] - vec._out[2];
            //perform rotation
            r[0] = p[0];
            r[1] = p[1] * Math.cos(c) - p[2] * Math.sin(c);
            r[2] = p[1] * Math.sin(c) + p[2] * Math.cos(c);
            //translate to correct position
            this._out[0] = r[0] + b[0];
            this._out[1] = r[1] + b[1];
            this._out[2] = r[2] + b[2];
            return this;
        };
        /**
         * Rotate a 3D vector around the y-axis
         * @param {Vec3} vec The origin of the rotation
         * @param {number} c The angle of rotation
         */
        rotateY(vec, c) {
            var p = [], r = [];
            //Translate point to the origin
            p[0] = this._out[0] - vec._out[0];
            p[1] = this._out[1] - vec._out[1];
            p[2] = this._out[2] - vec._out[2];
            //perform rotation
            r[0] = p[2] * Math.sin(c) + p[0] * Math.cos(c);
            r[1] = p[1];
            r[2] = p[2] * Math.cos(c) - p[0] * Math.sin(c);
            //translate to correct position
            this._out[0] = r[0] + b[0];
            this._out[1] = r[1] + b[1];
            this._out[2] = r[2] + b[2];
            return this;
        };
        /**
         * Rotate a 3D vector around the z-axis
         * @param {Vec3} vec The origin of the rotation
         * @param {number} c the angle of rotation
         */
        rotateZ(vec, c) {
            var p = [], r = [];
            //Translate point to the origin
            p[0] = this._out[0] - vec._out[0];
            p[1] = this._out[1] - vec._out[1];
            p[2] = this._out[2] - vec._out[2];
            //perform rotation
            r[0] = p[0] * Math.cos(c) - p[1] * Math.sin(c);
            r[1] = p[0] * Math.sin(c) + p[1] * Math.cos(c);
            r[2] = p[2];
            //translate to correct position
            this._out[0] = r[0] + b[0];
            this._out[1] = r[1] + b[1];
            this._out[2] = r[2] + b[2];
            return this;
        };
        /**
         * calcute the angle between two 3D vectors
         * @param {Vec3} vec the second vector
         */
        angle(vec) {
            let vecI = this.clone().normalize(),
                vecII = vec.clone().normalize();
            var cosine = Vec3.dot(vecI, vecII);
            if (cosine > 1.0)
                return 0;
            else if (cosine < -1.0)
                return Math.PI;
            else
                return Math.acos(cosine);
        };
        /**
         * reference:
         * https://github.com/mrdoob/three.js/blob/dev/src/math/Vector3.js
         * @typedef {import("./Quat")} Quat 
         * @param {Quat} quat
         */
        applyQuat(quat){
            //
            var x = this.x, y = this.y, z = this.z;
            var qx = q.x, qy = q.y, qz = q.z, qw = q.w;
            // calculate quat * vector
    		var ix = qw * x + qy * z - qz * y;
    		var iy = qw * y + qz * x - qx * z;
    		var iz = qw * z + qx * y - qy * x;
    		var iw = - qx * x - qy * y - qz * z;
    		// calculate result * inverse quat
    		this._out[0] = ix * qw + iw * - qx + iy * - qz - iz * - qy;
    		this._out[1] = iy * qw + iw * - qy + iz * - qx - ix * - qz;
            this._out[2] = iz * qw + iw * - qz + ix * - qy - iy * - qx;
            //
            return this;
        }
        /**
         * Returns whether or not the vectors have approximately the same elements in the same position.
         */
        equals(vec) {
            let [a0, a1, a2] = this._out,
                [b0, b1, b2] = vec._out;
            return (Math.abs(a0 - b0) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
                Math.abs(a1 - b1) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
                Math.abs(a2 - b2) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)));
        };
    }

    var Vec3_1 = Vec3;

    /**
     * reference https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/vec4.js
     * switch to es6 syntax
     * warning:if you don't want to change the source value,please use vec4.clone().* instead of vec4.*
     * @author yellow 2017.5.9
     */

    /**
     * @class 4 Dimensional Vector
     * @name vec4
     */
    class Vec4 {
        /**
         *  Creates a new, empty vec4
         */
        constructor() {
            /**
             * vec4 array store
             * @private
             */
            this._out = new GLMatrix_1.ARRAY_TYPE(4);
            this._out[0] = 0;
            this._out[1] = 0;
            this._out[2] = 0;
            this._out[3] = 0;
            return this;
        }
        /**
         * 
         */
        get x(){
            return this._out[0];
        }
        /**
         * 
         */
        get y(){
            return this._out[1];
        }
        /**
         * 
         */
        get z(){
            return this._out[2];
        }
        /**
         * 
         */
        get w(){
            return this._out[3];
        }
        /**
         * adapter for webgl matrix
         * get the array directly
         * @memberof vec4
         * @return {Array}
         */
        get value() {
            return this._out;
        }
        /**
         * Generates a random vector with the given scale
         * @param {number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
         */
        static random(scale = 1.0) {
            scale = scale || 1.0;
            let vec = new Vec4();
            //TODO: This is a pretty awful way of doing this. Find something better.
            vec.set(GLMatrix_1.RANDOM(), GLMatrix_1.RANDOM(), GLMatrix_1.RANDOM(), GLMatrix_1.RANDOM()).normalize().scale();
            return vec;
        }
        /**
         * set the value of vec4
         */
        set(x, y, z, w) {
            this._out[0] = x;
            this._out[1] = y;
            this._out[2] = z;
            this._out[3] = w;
            return this;
        }
        /**
         * Creates a new vec4 initialized with values from an existing vector
         */
        clone() {
            let vec = new Vec4();
            vec.set(this._out[0], this._out[1], this._out[2], this._out[3]);
            return vec;
        }
        /**
         * Adds two vec4's
         * @param {Vec4} vec
         */
        add(vec) {
            this._out[0] += vec.value[0];
            this._out[1] += vec.value[1];
            this._out[2] += vec.value[2];
            this._out[3] += vec.value[3];
            return this;
        }
        /**
         * Subtracts vector vec from vector this
         */
        sub(vec) {
            this._out[0] -= vec.value[0];
            this._out[1] -= vec.value[1];
            this._out[2] -= vec.value[2];
            this._out[3] -= vec.value[3];
            return this;
        }
        /**
         * Multiplies two vec4's
         */
        multiply(vec) {
            this._out[0] *= vec.value[0];
            this._out[1] *= vec.value[1];
            this._out[2] *= vec.value[2];
            this._out[3] *= vec.value[3];
            return this;
        }
        /**
        * Divides two vec4's
        */
        divide(vec) {
            this._out[0] /= vec.value[0];
            this._out[1] /= vec.value[1];
            this._out[2] /= vec.value[2];
            this._out[3] /= vec.value[3];
            return this;
        }
        /**
         * Math.ceil the components of a vec4
         */
        ceil() {
            this._out[0] = Math.ceil(this._out[0]);
            this._out[1] = Math.ceil(this._out[1]);
            this._out[2] = Math.ceil(this._out[2]);
            this._out[3] = Math.ceil(this._out[3]);
            return this;
        }
        /**
         * Math.round the components of a vec4
         */
        round() {
            this._out[0] = Math.round(this._out[0]);
            this._out[1] = Math.round(this._out[1]);
            this._out[2] = Math.round(this._out[2]);
            this._out[3] = Math.round(this._out[3]);
            return this;
        }
        /**
        * Math.floor the components of a vec4
        */
        floor() {
            this._out[0] = Math.floor(this._out[0]);
            this._out[1] = Math.floor(this._out[1]);
            this._out[2] = Math.floor(this._out[2]);
            this._out[3] = Math.floor(this._out[3]);
            return this;
        }
        /**
         * Returns the minimum of two vec4's
         * @param {Vec4} vec
         */
        min(vec) {
            this._out[0] = Math.min(this._out[0], vec.value[0]);
            this._out[1] = Math.min(this._out[1], vec.value[1]);
            this._out[2] = Math.min(this._out[2], vec.value[2]);
            this._out[3] = Math.min(this._out[3], vec.value[3]);
            return this;
        }
        /**
         * Returns the maximum of two vec4's
         * @param {Vec4} vec
         */
        max(vec) {
            this._out[0] = Math.max(this._out[0], vec.value[0]);
            this._out[1] = Math.max(this._out[1], vec.value[1]);
            this._out[2] = Math.max(this._out[2], vec.value[2]);
            this._out[3] = Math.max(this._out[3], vec._out[3]);
            return this;
        }
        /**
         * Scales a vec4 by a scalar number
         * @param {number} s the scale
         */
        scale(s) {
            this._out[0] *= s;
            this._out[1] *= s;
            this._out[2] *= s;
            this._out[3] *= s;
            return this;
        }
        /**
         * Calculates the euclidian distance between two vec4's
         * @param {Vec4} vec the distance to vec
         */
        distance(vec) {
            let [x0, y0, z0, w0] = this._out,
                [x1, y1, z1, w1] = vec._out,
                x = x0 - x1,
                y = y0 - y1,
                z = z0 - z1,
                w = w0 - w1;
            return Math.sqrt(x * x + y * y + z * z + w * w);
        }
        /**
         * Calculates the length of a vec4
         */
        len() {
            return this.distance(new Vec4());
        }
        /**
         * Negates the components of a vec4
         */
        negate() {
            this._out[0] = -this._out[0];
            this._out[1] = -this._out[1];
            this._out[2] = -this._out[2];
            this._out[3] = -this._out[3];
            return this;
        }
        /**
         * Returns the inverse of the components of a vec4
         */
        inverse() {
            this._out[0] = 1.0 / this._out[0];
            this._out[1] = 1.0 / this._out[1];
            this._out[2] = 1.0 / this._out[2];
            this._out[3] = 1.0 / this._out[3];
        }
        /**
         * Normalize a vec4
         */
        normalize() {
            let len = this.len();
            if (len > 0) {
                len = 1.0 / len;
                this._out[0] *= len;
                this._out[1] *= len;
                this._out[2] *= len;
                this._out[3] *= len;
            }
            return this;
        }
        /**
         * @param {Vec4} vec
         */
        dot(vec) {
            let [x0, y0, z0, w0] = this._out,
                [x1, y1, z1, w1] = vec._out;
            return x0 * x1 + y0 * y1 + z0 * z1 + w0 * w1;
        }
        /**
         *  Performs a linear interpolation between two vec4's
         */
        lerp(vec, t) {
            let [ax, ay, az, aw] = this._out;
            this._out[0] = ax + t * (vec._out[0] - ax);
            this._out[1] = ay + t * (vec._out[1] - ay);
            this._out[2] = az + t * (vec._out[2] - az);
            this._out[3] = aw + t * (vec._out[3] - aw);
            return this;
        }
        /**
         * Transforms the vec4 with a mat4.
         * @param {mat4} mat matrix to transform with
         */
        transformMat4(mat) {
            let [x, y, z, w] = this._out;
            this._out[0] = mat._out[0] * x + mat._out[4] * y + mat._out[8] * z + mat._out[12] * w;
            this._out[1] = mat._out[1] * x + mat._out[5] * y + mat._out[9] * z + mat._out[13] * w;
            this._out[2] = mat._out[2] * x + mat._out[6] * y + mat._out[10] * z + mat._out[14] * w;
            this._out[3] = mat._out[3] * x + mat._out[7] * y + mat._out[11] * z + mat._out[15] * w;
            return this;
        }
        /**
         * Transforms the vec4 with a quat
         * @param {quat} q quaternion to transform with
         */
        transformQuat(q) {
            let [x, y, z, w] = this._out,
                [qx, qy, qz, qw] = q._out,
                ix = qw * x + qy * z - qz * y,
                iy = qw * y + qz * x - qx * z,
                iz = qw * z + qx * y - qy * x,
                iw = -qx * x - qy * y - qz * z;
            // calculate result * inverse quat
            this._out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
            this._out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
            this._out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
            this._out[3] = a[3];
            return this;
        }
        /**
         * Returns a string representation of a vector
         */
        toString() {
            return 'vec4(' + this._out[0] + ', ' + this._out[1] + ', ' + this._out[2] + ', ' + this._out[3] + ')';
        }
        /**
         * Returns whether or not the vectors have approximately the same elements in the same position.
         * @param {Vec4} vec
         */
        equals(vec) {
            let [a0, a1, a2, a3] = this._out,
                [b0, b1, b2, b3] = vec._out;
            return (Math.abs(a0 - b0) <= GLMatrix_1.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
                Math.abs(a1 - b1) <= GLMatrix_1.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
                Math.abs(a2 - b2) <= GLMatrix_1.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
                Math.abs(a3 - b3) <= GLMatrix_1.EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)));
        }
    }

    var Vec4_1 = Vec4;

    /**
     * reference https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/mat3.js
     * switch to es6 syntax,and change to quote
     * warning:if you don't want to change the source value,please use mat3.clone().* instead of mat3.*
     * @author yellow 2017/5/8
     */



    /**
     * @class
     */
    class Mat3 {
        /**
         * Creates a new identity mat3
         */
        constructor() {
            /**
             * an array to store the 3*3 matrix data
             * [1,0,0]
             * [0,1,0]
             * [0,0,1]
             * @private 
            */
            this._out = new GLMatrix_1.ARRAY_TYPE(9);
            _out[0] = 1;
            _out[1] = 0;
            _out[2] = 0;
            _out[3] = 0;
            _out[4] = 1;
            _out[5] = 0;
            _out[6] = 0;
            _out[7] = 0;
            _out[8] = 1;
            return this;
        }
        /**
         * adapter for webgl matrix
         * get the array directly
         * @memberof mat3
         * @return {Array}
         */
        get value() {
            return this._out;
        }
        /**
         * set matrix value
         */
        set(m00, m01, m02, m10, m11, m12, m20, m21, m22) {
            _out[0] = m00;
            _out[1] = m01;
            _out[2] = m02;
            _out[3] = m10;
            _out[4] = m11;
            _out[5] = m12;
            _out[6] = m20;
            _out[7] = m21;
            _out[8] = m22;
            return this;
        }
        /**
         * clone the mat3 matrix
         * @return {Mat3}
         */
        clone() {
            let mat = new Mat3().set(
                this._out[0], this._out[1], this._out[2],
                this._out[3], this._out[4], this._out[5],
                this._out[6], this._out[7], this._out[8]);
            return mat;
        }
        /**
         *  Copies the upper-left 3x3 values into the given mat3.
         *  construct from mat4
         *  @method fromMat4
         *  @param {mat3} m
         *  @return {mat3}
         */
        static fromMat4(m) {
            let mat = new Mat3();
            mat.set(m.value[0], m.value[1], m.value[2],
                m.value[4], m.value[5], m.value[6],
                m.value[8], m.value[9], m.value[10]);
            return mat;
        }
        /**
        * Set a mat3 to the identity matrix
        * @method identity
        * @param {Mat3} out the receiving matrix
        * @returns {mat3} out
        */
        identity() {
            _out[0] = 1;
            _out[1] = 0;
            _out[2] = 0;
            _out[3] = 0;
            _out[4] = 1;
            _out[5] = 0;
            _out[6] = 0;
            _out[7] = 0;
            _out[8] = 1;
            return this;
        }
        /**
         * Inverts a mat3
         * @method invert
         */
        invert() {
            const [a00, a01, a02, a10, a11, a12, a20, a21, a22] = this._out;
            const b01 = a22 * a11 - a12 * a21,
                b11 = -a22 * a10 + a12 * a20,
                b21 = a21 * a10 - a11 * a20;
            let det = a00 * b01 + a01 * b11 + a02 * b21;
            if (!det)
                return null;
            det = 1.0 / det;
            this._out[0] = b01 * det;
            this._out[1] = (-a22 * a01 + a02 * a21) * det;
            this._out[2] = (a12 * a01 - a02 * a11) * det;
            this._out[3] = b11 * det;
            this._out[4] = (a22 * a00 - a02 * a20) * det;
            this._out[5] = (-a12 * a00 + a02 * a10) * det;
            this._out[6] = b21 * det;
            this._out[7] = (-a21 * a00 + a01 * a20) * det;
            this._out[8] = (a11 * a00 - a01 * a10) * det;
            return this;
        }
        /**
         * Calculates the adjugate of a mat3
         * 
         */
        adjoint() {
            let [a00, a01, a02, a10, a11, a12, a20, a21, a22] = this._out;
            this._out[0] = (a11 * a22 - a12 * a21);
            this._out[1] = (a02 * a21 - a01 * a22);
            this._out[2] = (a01 * a12 - a02 * a11);
            this._out[3] = (a12 * a20 - a10 * a22);
            this._out[4] = (a00 * a22 - a02 * a20);
            this._out[5] = (a02 * a10 - a00 * a12);
            this._out[6] = (a10 * a21 - a11 * a20);
            this._out[7] = (a01 * a20 - a00 * a21);
            this._out[8] = (a00 * a11 - a01 * a10);
            return this;
        }
        /**
         * Calculates the determinant of a mat3
         */
        determinant() {
            const [a00, a01, a02, a10, a11, a12, a20, a21, a22] = this._out;
            return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
        }
        /**
         * Multiplies other mat3
         * @param {Mat3} mat a matrix 3*3 wait to multiply
         */
        multiply(mat) {
            const [a00, a01, a02, a10, a11, a12, a20, a21, a22] = this._out;
            const [b00, b01, b02, b10, b11, b12, b20, b21, b22] = mat.value;
            this._out[0] = b00 * a00 + b01 * a10 + b02 * a20;
            this._out[1] = b00 * a01 + b01 * a11 + b02 * a21;
            this._out[2] = b00 * a02 + b01 * a12 + b02 * a22;
            this._out[3] = b10 * a00 + b11 * a10 + b12 * a20;
            this._out[4] = b10 * a01 + b11 * a11 + b12 * a21;
            this._out[5] = b10 * a02 + b11 * a12 + b12 * a22;
            this._out[6] = b20 * a00 + b21 * a10 + b22 * a20;
            this._out[7] = b20 * a01 + b21 * a11 + b22 * a21;
            this._out[8] = b20 * a02 + b21 * a12 + b22 * a22;
            return this;
        }
        /**
         * Translate a mat3 by the given vector
         * @param {vec2} vec vetor to translate by
         * @return {mat3} 
         */
        translate(vec) {
            const [a00, a01, a02, a10, a11, a12, a20, a21, a22] = this._out;
            const [x, y] = vec.value;
            this._out[0] = a00;
            this._out[1] = a01;
            this._out[2] = a02;
            this._out[3] = a10;
            this._out[4] = a11;
            this._out[5] = a12;
            this._out[6] = x * a00 + y * a10 + a20;
            this._out[7] = x * a01 + y * a11 + a21;
            this._out[8] = x * a02 + y * a12 + a22;
            return this;
        }
        /**
         * Rotates a mat3 by the given angle
         * @param {Number} rad the angle to rotate the matrix by
         */
        rotate(rad) {
            const [a00, a01, a02, a10, a11, a12, a20, a21, a22] = this._out;
            const s = Math.sin(rad), c = Math.cos(rad);
            this._out[0] = c * a00 + s * a10;
            this._out[1] = c * a01 + s * a11;
            this._out[2] = c * a02 + s * a12;
            this._out[3] = c * a10 - s * a00;
            this._out[4] = c * a11 - s * a01;
            this._out[5] = c * a12 - s * a02;
            this._out[6] = a20;
            this._out[7] = a21;
            this._out[8] = a22;
            return this;
        }
        /**
         * Scales the mat3 by the dimensions in the given vec2
         * @param {vec2} v the vec2 to scale the matrix by
         */
        scale(vec) {
            const [x, y] = vec.value;
            this._out[0] = x * this._out[0];
            this._out[1] = x * this._out[1];
            this._out[2] = x * this._out[2];
            this._out[3] = y * this._out[3];
            this._out[4] = y * this._out[4];
            this._out[5] = y * this._out[5];
            return this;
        }
        /**
         * Calculates a 3x3 matrix from the given quaternion
         * @param {quat} q Quaternion to create matrix from
         */
        fromQuat(q) {
            const [x, y, z, w] = q.value;
            const x2 = x + x,
                y2 = y + y,
                z2 = z + z,
                xx = x * x2,
                yx = y * x2,
                yy = y * y2,
                zx = z * x2,
                zy = z * y2,
                zz = z * z2,
                wx = w * x2,
                wy = w * y2,
                wz = w * z2;
            let _mat = new Mat3().set(
                1 - yy - zz, yx + wz, zx - wy,
                yx - wz, 1 - xx - zz, zy + wx,
                zx + wy, zy - wx, 1 - xx - yy);
            return _mat;
        }
        /**
         * 
         * Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
         * @param {mat4} mat 
         */
        normalFromMat4(mat) {
            const [a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, a30, a31, a32, a33] = mat.value;
            const b00 = a00 * a11 - a01 * a10,
                b01 = a00 * a12 - a02 * a10,
                b02 = a00 * a13 - a03 * a10,
                b03 = a01 * a12 - a02 * a11,
                b04 = a01 * a13 - a03 * a11,
                b05 = a02 * a13 - a03 * a12,
                b06 = a20 * a31 - a21 * a30,
                b07 = a20 * a32 - a22 * a30,
                b08 = a20 * a33 - a23 * a30,
                b09 = a21 * a32 - a22 * a31,
                b10 = a21 * a33 - a23 * a31,
                b11 = a22 * a33 - a23 * a32;
            let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
            if (!det) return null;
            det = 1.0 / det;
            let m00 = (a11 * b11 - a12 * b10 + a13 * b09) * det,
                m01 = (a12 * b08 - a10 * b11 - a13 * b07) * det,
                m02 = (a10 * b10 - a11 * b08 + a13 * b06) * det,
                m10 = (a02 * b10 - a01 * b11 - a03 * b09) * det,
                m11 = (a00 * b11 - a02 * b08 + a03 * b07) * det,
                m12 = (a01 * b08 - a00 * b10 - a03 * b06) * det,
                m20 = (a31 * b05 - a32 * b04 + a33 * b03) * det,
                m21 = (a32 * b02 - a30 * b05 - a33 * b01) * det,
                m22 = (a30 * b04 - a31 * b02 + a33 * b00) * det;
            let _mat = new Mat3().set(
                m00, m01, m02,
                m10, m11, m12,
                m20, m21, m22);
            return _mat;
        }
        /**
         * Returns a string representation of a mat3
         */
        toString() {
            return 'mat3(' + this._out[0] + ', ' + this._out[1] + ', ' + this._out[2] + ', ' + this._out[3] + ', ' + this._out[4] + ', ' + this._out[5] + ', ' + this._out[6] + ', ' + this._out[7] + ', ' + this._out[8] + ')';
        }
        /**
         * Returns Frobenius norm of a mat3 
         * mat3 Frobenius norm
         */
        frob() {
            return (Math.sqrt(Math.pow(this._out[0], 2) + Math.pow(this._out[1], 2) + Math.pow(this._out[2], 2) + Math.pow(this._out[3], 2) + Math.pow(this._out[4], 2) + Math.pow(this._out[5], 2) + Math.pow(this._out[6], 2) + Math.pow(this._out[7], 2) + Math.pow(this._out[8], 2)))
        }
        /**
         * Adds two mat3's
         * @param {Mat3} mat 
         * @return {Mat3}
         */
        add(mat) {
            this._out[0] += mat.value[0];
            this._out[1] += mat.value[1];
            this._out[2] += mat.value[2];
            this._out[3] += mat.value[3];
            this._out[4] += mat.value[4];
            this._out[5] += mat.value[5];
            this._out[6] += mat.value[6];
            this._out[7] += mat.value[7];
            this._out[8] += mat.value[8];
            return this;
        }
        /**
         * Subtracts matrix b from matrix a
         * @param {Mat3} mat 
         * @return {Mat3}
         */
        sub(mat) {
            this._out[0] -= mat.value[0];
            this._out[1] -= mat.value[1];
            this._out[2] -= mat.value[2];
            this._out[3] -= mat.value[3];
            this._out[4] -= mat.value[4];
            this._out[5] -= mat.value[5];
            this._out[6] -= mat.value[6];
            this._out[7] -= mat.value[7];
            this._out[8] -= mat.value[8];
            return this;
        }
        /**
         * Multiply each element of the matrix by a vec3.
         * @param {Vec3} vec 
         */
        scale(vec) {
            this._out[0] *= vec.value[0];
            this._out[0] *= vec.value[0];
            this._out[0] *= vec.value[0];
            this._out[0] *= vec.value[1];
            this._out[0] *= vec.value[1];
            this._out[0] *= vec.value[1];
            this._out[0] *= vec.value[2];
            this._out[0] *= vec.value[2];
            this._out[0] *= vec.value[2];
            return this;
        }
        /**
         * @param {any} mat 
         * @memberof mat3
         */
        equals(mat) {
            const [a0, a1, a2, a3, a4, a5, a6, a7, a8] = this._out;
            const [b0, b1, b2, b3, b4, b5, b6, b7, b8] = mat.value;
            return (Math.abs(a0 - b0) <= GLMatrix_1.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
                Math.abs(a1 - b1) <= GLMatrix_1.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
                Math.abs(a2 - b2) <= GLMatrix_1.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
                Math.abs(a3 - b3) <= GLMatrix_1.EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) &&
                Math.abs(a4 - b4) <= GLMatrix_1.EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) &&
                Math.abs(a5 - b5) <= GLMatrix_1.EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)) &&
                Math.abs(a6 - b6) <= GLMatrix_1.EPSILON * Math.max(1.0, Math.abs(a6), Math.abs(b6)) &&
                Math.abs(a7 - b7) <= GLMatrix_1.EPSILON * Math.max(1.0, Math.abs(a7), Math.abs(b7)) &&
                Math.abs(a8 - b8) <= GLMatrix_1.EPSILON * Math.max(1.0, Math.abs(a8), Math.abs(b8)));
        }

    }

    var Mat3_1 = Mat3;

    /**
     * reference https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/quat.js
     * switch to es6 syntax
     * warning:if you don't want to change the source value,please use quat.clone().* instead of quat.*
     * @author yellow 2017/5/10
     */

    /**
     * @class Quaternion
     * @name quat
     */
    class Quat {
        /**
         * Creates a new identity quat
         */
        constructor() {
            /**
             * quat array store
             * @private
             */
            this._out = new GLMatrix_1.ARRAY_TYPE(4);
            this._out[0] = 0;
            this._out[1] = 0;
            this._out[2] = 0;
            this._out[3] = 1;
        }
        /**
         * 
         */
        get x(){
            return this._out[0];
        }
        /**
         * 
         */
        get y(){
            return this._out[1];
        }
        /**
         * 
         */
        get z(){
            return this._out[2];
        }
        /**
         * 
         */
        get w(){
            return this._out[3];
        }
        /**
         * adapter for webgl matrix
         * get the array directly
         * @memberof quat
         * @return {Array}
         */
        get value() {
            return this._out;
        }
        /**
         * generic a quat from mat3
         * @param {mat3} mat the 3x3 matrix 
         */
        static fromMat3(mat) {
            // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
            // article "Quaternion Calculus and Fast Animation".
            let fTrace = mat._out[0] + mat._out[4] + mat._out[8],
                qua = new Quat(),
                fRoot;
            if (fTrace > 0.0) {
                // |w| > 1/2, may as well choose w > 1/2
                fRoot = Math.sqrt(fTrace + 1.0);  // 2w
                out[3] = 0.5 * fRoot;
                fRoot = 0.5 / fRoot;  // 1/(4w)
                qua._out[0] = (mat._out[5] - mat._out[7]) * fRoot;
                qua._out[1] = (mat._out[6] - mat._out[2]) * fRoot;
                qua._out[2] = (mat._out[1] - mat._out[3]) * fRoot;
            } else {
                // |w| <= 1/2
                var i = 0;
                if (m[4] > m[0]) i = 1;
                if (m[8] > m[i * 3 + i]) i = 2;
                var j = (i + 1) % 3;
                var k = (i + 2) % 3;
                fRoot = Math.sqrt(mat._out[i * 3 + i] - mat._out[j * 3 + j] - mat._out[k * 3 + k] + 1.0);
                out[i] = 0.5 * fRoot;
                fRoot = 0.5 / fRoot;
                qua._out[3] = (mat._out[j * 3 + k] - mat._out[k * 3 + j]) * fRoot;
                qua._out[j] = (mat._out[j * 3 + i] + mat._out[i * 3 + j]) * fRoot;
                qua._out[k] = (mat._out[k * 3 + i] + mat._out[i * 3 + k]) * fRoot;
            }
            return this;
        }
        /**
         * set the value of quat
         */
        set(x, y, z, w) {
            this._out[0] = x;
            this._out[1] = y;
            this._out[2] = z;
            this._out[3] = w;
            return this;
        }
        /**
         * Creates a new quat initialized with values from an existing quaternion
         */
        clone() {
            let qua = new Quat();
            qua.set(qua._out[0], qua._out[1], qua._out[2], qua._out[3]);
            return qua;
        }
        /**
         * Set a quat to the identity quaternion
         */
        identity() {
            this._out[0] = 0;
            this._out[1] = 0;
            this._out[2] = 0;
            this._out[3] = 1;
            return this;
        }
        /**
         * @param {Vec3} vI the initial vector
         * @param {Vec3} vII the destination vector
         * 
         */
        rotationTo(vI, vII) {
            this.r1 = this.r1 || new Vec3_1();
            this.r2 = this.r2 || new Vec3_1().set(1, 0, 0);
            this.r3 = this.r3 || new Vec3_1().set(0, 1, 0);
            //
            const dot = vI.dot(vII);
            if (dot < -0.999999) {
                this.r1 = this.r3.clone().cross(vI);
                if (this.r1.len() < 0.000001) {
                    this.r1 = this.r3.clone().cross(vI);
                }
                this.r3.normalize();
                this.setAxisAngle(this.r1, Math.PI);
                return this;
            } else if (dot > 0.999999) {
                this._out[0] = 0;
                this._out[1] = 0;
                this._out[2] = 0;
                this._out[3] = 1;
                return this;
            } else {
                this.r1 = vI.clone().cross(vII);
                this._out[0] = tmpvec3[0];
                this._out[1] = tmpvec3[1];
                this._out[2] = tmpvec3[2];
                this._out[3] = 1 + dot;
                return this.normalize();
            }
        }
        /**
         * Sets the specified quaternion with values corresponding to the given
         * axes. Each axis is a vec3 and is expected to be unit length and
         * perpendicular to all other specified axes.
         * @param {Vec3} vecView  the vector representing the viewing direction
         * @param {Vec3} vecRight the vector representing the local "right" direction
         * @param {Vec3} vecUp    the vector representing the local "up" direction
         */
        setAxes(vecView, vecRight, vecUp) {
            const mat = new Mat3_1().set(
                vecRight._out[0], vecUp._out[0], -vecView._out[0],
                vecRight._out[1], vecUp._out[1], -vecView._out[1],
                vecRight._out[2], vecUp._out[2], -vecView._out[2]
            );
            return Quat.fromMat3(mat);
        }
        /**
         * Sets a quat from the given angle and rotation axis,
         * then returns it.
         * @param {Vec3} axis the axis around which to rotate
         * @param {number} rad
         */
        setAxisAngle(axis, rad) {
            rad = rad * 0.5;
            var s = Math.sin(rad);
            this._out[0] = s * axis._out[0];
            this._out[1] = s * axis._out[1];
            this._out[2] = s * axis._out[2];
            this._out[3] = Math.cos(rad);
            return this;
        }
        /**
         * Gets the rotation axis and angle for a given quaternion. 
         * If a quaternion is created with setAxisAngle, 
         * this method will return the same values as providied in the original parameter list OR functionally equivalent values.
         * @example The quaternion formed by axis [0, 0, 1] and angle -90 is the same as the quaternion formed by [0, 0, 1] and 270. 
         *          This method favors the latter.
         * @return [axis,angle]
         */
        getAxisAngle() {
            let rad = Math.acos(this._out[3]) * 2.0,
                s = Math.sin(rad / 2.0);
            let axis = new Vec3_1();
            s === 0.0 ? axis.set(1, 0, 0) : axis.set(q[0] / s, q[1] / s, q[2] / s);
            return [axis, rad];
        }
        /**
         * add two quat's
         * @param {Quat} qua 
         */
        add(qua) {
            this._out[0] += qua._out[0];
            this._out[1] += qua._out[1];
            this._out[2] += qua._out[2];
            this._out[3] += qua._out[3];
            return this;
        }
        /**
         * Multiplies two quat's
         */
        multiply(qua) {
            let [ax, ay, az, aw] = this._out,
                [bx, by, bz, bw] = qua._out;
            this._out[0] = ax * bw + aw * bx + ay * bz - az * by;
            this._out[1] = ay * bw + aw * by + az * bx - ax * bz;
            this._out[2] = az * bw + aw * bz + ax * by - ay * bx;
            this._out[3] = aw * bw - ax * bx - ay * by - az * bz;
            return this;
        }
        /**
         * @param {number} s
         */
        scale(s) {
            this._out[0] *= s;
            this._out[1] *= s;
            this._out[2] *= s;
            this._out[3] *= s;
            return this;
        }
        /**
         * Rotates a quaternion by the given angle about the X axis
         * @param {number} rad angle (in radians) to rotate
         */
        rotateX(rad) {
            rad *= 0.5;
            let [ax, ay, az, aw] = this._out,
                bx = Math.sin(rad),
                bw = Math.cos(rad);
            this._out[0] = ax * bw + aw * bx;
            this._out[1] = ay * bw + az * bx;
            this._out[2] = az * bw - ay * bx;
            this._out[3] = aw * bw - ax * bx;
            return this;
        }
        /**
         * Rotates a quaternion by the given angle about the Y axis
         * @param {number} rad angle (in radians) to rotate
         */
        rotateY(rad) {
            rad *= 0.5;
            let [ax, ay, az, aw] = this._out,
                by = Math.sin(rad),
                bw = Math.cos(rad);
            this._out[0] = ax * bw - az * by;
            this._out[1] = ay * bw + aw * by;
            this._out[2] = az * bw + ax * by;
            this._out[3] = aw * bw - ay * by;
            return this;
        }
        /**
         * Rotates a quaternion by the given angle about the Z axis
         * @param {number} rad angle (in radians) to rotate
         */
        rotateZ(rad) {
            rad *= 0.5;
            let [ax, ay, az, aw] = this._out,
                bz = Math.sin(rad),
                bw = Math.cos(rad);
            out[0] = ax * bw + ay * bz;
            this._out[1] = ay * bw - ax * bz;
            this._out[2] = az * bw + aw * bz;
            this._out[3] = aw * bw - az * bz;
            return this;
        }
        /**
         * Calculates the W component of a quat from the X, Y, and Z components.
         * Assumes that quaternion is 1 unit in length
         * Any existing W component will be ignored.
         */
        calculateW() {
            let [x, y, z, w] = this._out;
            this._out[3] = Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
            return this;
        }
        /**
         * Calculates the dot product of two quat's
         * @return {number} dot product of two quat's
         */
        dot(qua) {
            let [x0, y0, z0, w0] = this._out,
                [x1, y1, z1, w1] = qua._out;
            return x0 * x1 + y0 * y1 + z0 * z1 + w0 * w1;
        }
        /**
         * Performs a linear interpolation between two quat's
         * @param {Quat} qua the second operand
         * @param {Number} t interpolation amount between the two inputs
         */
        lerp(qua, t) {
            let [ax, ay, az, aw] = this._out;
            this._out[0] = ax + t * (qua._out[0] - ax);
            this._out[1] = ay + t * (qua._out[1] - ay);
            this._out[2] = az + t * (qua._out[2] - az);
            this._out[3] = aw + t * (qua._out[3] - aw);
            return this;
        }
        /**
         * Performs a spherical linear interpolation between two quat
         * benchmarks: http://jsperf.com/quaternion-slerp-implementations
         */
        slerp(qua, t) {
            let [ax, ay, az, aw] = this._out,
                [bx, by, bz, bw] = qua._out;
            let omega, cosom, sinom, scale0, scale1;
            // calc cosine
            cosom = ax * bx + ay * by + az * bz + aw * bw;
            // adjust signs (if necessary)
            if (cosom < 0.0) {
                cosom = -cosom;
                bx = - bx;
                by = - by;
                bz = - bz;
                bw = - bw;
            }
            // calculate coefficients
            if ((1.0 - cosom) > 0.000001) {
                // standard case (slerp)
                omega = Math.acos(cosom);
                sinom = Math.sin(omega);
                scale0 = Math.sin((1.0 - t) * omega) / sinom;
                scale1 = Math.sin(t * omega) / sinom;
            } else {
                // "from" and "to" quaternions are very close 
                //  ... so we can do a linear interpolation
                scale0 = 1.0 - t;
                scale1 = t;
            }
            // calculate final values
            this._out[0] = scale0 * ax + scale1 * bx;
            this._out[1] = scale0 * ay + scale1 * by;
            this._out[2] = scale0 * az + scale1 * bz;
            this._out[3] = scale0 * aw + scale1 * bw;
            return this;
        }
        /**
         * Performs a spherical linear interpolation with two control points
         * @param {Quat} quaI
         * @param {Quat} quaII
         * @param {Quat} quaIII
         * @return
         */
        sqlerp(quaI, quaII, quaIII, t) {
            this.sqlery1 = this.sqlery1 || new Quat();
            this.sqlery2 = this.sqlery1 || new Quat();
            //a.slerp(d,t)  b.slerp(c,t)
            this.sqlery1 = this.clone().slerp(quaIII, t);
            this.sqlery2 = quaI.clone().slerp(quaII, t);
            let qua = this.sqlery1.clone().slerp(this.sqlery2, 2 * t * (1 - t));
            return qua;
        }
        /**
         * Calculates the inverse of a quat
         * @return {Quat} the inversed quat 
         */
        invert() {
            let [a0, a1, a2, a3] = this._out,
                dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3,
                invDot = dot ? 1.0 / dot : 0;
            this._out[0] = -a0 * invDot;
            this._out[1] = -a1 * invDot;
            this._out[2] = -a2 * invDot;
            this._out[3] = a3 * invDot;
            return this;
        }
        /**
         * Calculates the conjugate of a quat
         * If the quaternion is normalized, this function is faster than quat.inverse and produces the same result.
         */
        conjugate() {
            this._out[0] = -this._out[0];
            this._out[1] = -this._out[1];
            this._out[2] = -this._out[2];
            //this._out[3] = this._out[3]; omit to reduce assignment operation
            return this;
        }
        /**
         * retrun the length of quat
         * @return {number} 
         */
        len() {
            let [x, y, z, w] = this._out;
            return Math.sqrt(x * x + y * y + z * z + w * w);
        }
        /**
         * Normalize a quat
         */
        normalize() {
            let len = this.len();
            if (len > 0) {
                len = 1.0 / len;
                this._out[0] *= len;
                this._out[0] *= len;
                this._out[0] *= len;
                this._out[0] *= len;
            }
            return this;
        }
        /**
         * Returns a string representation of a quatenion
         * @returns {String} string representation of the vector
         */
        toString() {
            return 'quat(' + this._out[0] + ', ' + this._out[1] + ', ' + this._out[2] + ', ' + this._out[3] + ')';
        }
        /**
         * Returns whether or not the quat have approximately the same elements in the same position.
         * @param 
         */
        equals(qua) {
            let [a0, a1, a2, a3] = this._out,
                [b0, b1, b2, b3] = qua._out;
            return (Math.abs(a0 - b0) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
                Math.abs(a1 - b1) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
                Math.abs(a2 - b2) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
                Math.abs(a3 - b3) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)));
        }
    }

    var Quat_1 = Quat;

    /**
     * reference https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/mat4.js
     * switch to es6 syntax
     * warning:if you don't want to change the source value,please use mat4.clone().* instead of mat4.* (* means matrix operations)
     * @author yellow 2017/5/10
     * translation:
     * [1, 0, 0, 0,
     *  0, 1, 0, 0,
     *  0, 0, 1, 0,
     *  tx,ty,tz,1]
     * x-rotation:
     * [1, 0, 0, 0,
     *  0, c, s, 0,
     *  0,-s, c, 0,
     *  0, 0, 0, 1]
     * y-rotation:
     * [c, 0,-s, 0,
     *  0, 1, 0, 0,
     *  s, 0, c, 0,
     *  0, 0, 0, 1]
     * z-rotation:
     * [c, s, 0, 0,
     *  -s,c, s, 0,
     *  0, 0, 1, 0,
     *  0, 0, 0, 1]
     * scale:
     * [sx,0, 0, 0,
     *  0, sy,0, 0,
     *  0, 0, sz,0,
     *  0, 0, 0, 1]
     * notice that multlpy as translation*vec
     */

    /**
     * @class
     */
    class Mat4 {
        /**
         *  Creates a new identity mat4
         */
        constructor() {
            /**
             * 4x4 matrix array store
             * @private
             */
            this._out = new GLMatrix_1.ARRAY_TYPE(16);
            this._out[0] = 1;
            this._out[1] = 0;
            this._out[2] = 0;
            this._out[3] = 0;
            this._out[4] = 0;
            this._out[5] = 1;
            this._out[6] = 0;
            this._out[7] = 0;
            this._out[8] = 0;
            this._out[9] = 0;
            this._out[10] = 1;
            this._out[11] = 0;
            this._out[12] = 0;
            this._out[13] = 0;
            this._out[14] = 0;
            this._out[15] = 1;
            return this;
        }
        /**
         * adapter for webgl matrix
         * get the array directly
         * @memberof mat4
         * @return {Array}
         */
        get value() {
            return this._out;
        }
        /**
         * set the value of 4x4 matrix
         */
        set(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
            this._out[0] = m00;
            this._out[1] = m01;
            this._out[2] = m02;
            this._out[3] = m03;
            this._out[4] = m10;
            this._out[5] = m11;
            this._out[6] = m12;
            this._out[7] = m13;
            this._out[8] = m20;
            this._out[9] = m21;
            this._out[10] = m22;
            this._out[11] = m23;
            this._out[12] = m30;
            this._out[13] = m31;
            this._out[14] = m32;
            this._out[15] = m33;
            return this;
        }
        /**
         * Creates a new mat4 initialized with values from an existing matrix
         */
        clone() {
            let mat = new Mat4();
            mat.set(this._out[0], this._out[1], this._out[2], this._out[3],
                this._out[4], this._out[5], this._out[6], this._out[7],
                this._out[8], this._out[9], this._out[10], this._out[11],
                this._out[12], this._out[13], this._out[14], this._out[15]);
            return mat;
        }
        /**
         * Set a mat4 to the identity matrix
         */
        identity() {
            this.set(
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1);
            return this;
        }
        /**
         * Inverts a mat4
         */
        invert() {
            //deconstruction assignment
            const [a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, a30, a31, a32, a33] = this._out,
                b00 = a00 * a11 - a01 * a10,
                b01 = a00 * a12 - a02 * a10,
                b02 = a00 * a13 - a03 * a10,
                b03 = a01 * a12 - a02 * a11,
                b04 = a01 * a13 - a03 * a11,
                b05 = a02 * a13 - a03 * a12,
                b06 = a20 * a31 - a21 * a30,
                b07 = a20 * a32 - a22 * a30,
                b08 = a20 * a33 - a23 * a30,
                b09 = a21 * a32 - a22 * a31,
                b10 = a21 * a33 - a23 * a31,
                b11 = a22 * a33 - a23 * a32;
                // Calculate the determinant
            let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
            if (!det)
                return null;
            det = 1.0 / det;
            this._out = [(a11 * b11 - a12 * b10 + a13 * b09) * det, (a02 * b10 - a01 * b11 - a03 * b09) * det, (a31 * b05 - a32 * b04 + a33 * b03) * det, (a22 * b04 - a21 * b05 - a23 * b03) * det,
            (a12 * b08 - a10 * b11 - a13 * b07) * det, (a00 * b11 - a02 * b08 + a03 * b07) * det, (a32 * b02 - a30 * b05 - a33 * b01) * det, (a20 * b05 - a22 * b02 + a23 * b01) * det,
            (a10 * b10 - a11 * b08 + a13 * b06) * det, (a01 * b08 - a00 * b10 - a03 * b06) * det, (a30 * b04 - a31 * b02 + a33 * b00) * det, (a21 * b02 - a20 * b04 - a23 * b00) * det,
            (a11 * b07 - a10 * b09 - a12 * b06) * det, (a00 * b09 - a01 * b07 + a02 * b06) * det, (a31 * b01 - a30 * b03 - a32 * b00) * det, (a20 * b03 - a21 * b01 + a22 * b00) * det];
            return this;
        }
        /**
         * Calculates the adjugate of a mat4 not using SIMD
         */
        adjoint() {
            const [a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, a30, a31, a32, a33] = this._out;
            this._out[0] = (a11 * (a22 * a33 - a23 * a32) - a21 * (a12 * a33 - a13 * a32) + a31 * (a12 * a23 - a13 * a22));
            this._out[1] = -(a01 * (a22 * a33 - a23 * a32) - a21 * (a02 * a33 - a03 * a32) + a31 * (a02 * a23 - a03 * a22));
            this._out[2] = (a01 * (a12 * a33 - a13 * a32) - a11 * (a02 * a33 - a03 * a32) + a31 * (a02 * a13 - a03 * a12));
            this._out[3] = -(a01 * (a12 * a23 - a13 * a22) - a11 * (a02 * a23 - a03 * a22) + a21 * (a02 * a13 - a03 * a12));
            this._out[4] = -(a10 * (a22 * a33 - a23 * a32) - a20 * (a12 * a33 - a13 * a32) + a30 * (a12 * a23 - a13 * a22));
            this._out[5] = (a00 * (a22 * a33 - a23 * a32) - a20 * (a02 * a33 - a03 * a32) + a30 * (a02 * a23 - a03 * a22));
            this._out[6] = -(a00 * (a12 * a33 - a13 * a32) - a10 * (a02 * a33 - a03 * a32) + a30 * (a02 * a13 - a03 * a12));
            this._out[7] = (a00 * (a12 * a23 - a13 * a22) - a10 * (a02 * a23 - a03 * a22) + a20 * (a02 * a13 - a03 * a12));
            this._out[8] = (a10 * (a21 * a33 - a23 * a31) - a20 * (a11 * a33 - a13 * a31) + a30 * (a11 * a23 - a13 * a21));
            this._out[9] = -(a00 * (a21 * a33 - a23 * a31) - a20 * (a01 * a33 - a03 * a31) + a30 * (a01 * a23 - a03 * a21));
            this._out[10] = (a00 * (a11 * a33 - a13 * a31) - a10 * (a01 * a33 - a03 * a31) + a30 * (a01 * a13 - a03 * a11));
            this._out[11] = -(a00 * (a11 * a23 - a13 * a21) - a10 * (a01 * a23 - a03 * a21) + a20 * (a01 * a13 - a03 * a11));
            this._out[12] = -(a10 * (a21 * a32 - a22 * a31) - a20 * (a11 * a32 - a12 * a31) + a30 * (a11 * a22 - a12 * a21));
            this._out[13] = (a00 * (a21 * a32 - a22 * a31) - a20 * (a01 * a32 - a02 * a31) + a30 * (a01 * a22 - a02 * a21));
            this._out[14] = -(a00 * (a11 * a32 - a12 * a31) - a10 * (a01 * a32 - a02 * a31) + a30 * (a01 * a12 - a02 * a11));
            this._out[15] = (a00 * (a11 * a22 - a12 * a21) - a10 * (a01 * a22 - a02 * a21) + a20 * (a01 * a12 - a02 * a11));
            return this;
        }
        /**
         * Calculates the determinant of a mat4
         * @return {number} determinant of this matrix
         */
        determinant() {
            const [a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, a30, a31, a32, a33] = this._out;
            let b00 = a00 * a11 - a01 * a10,
                b01 = a00 * a12 - a02 * a10,
                b02 = a00 * a13 - a03 * a10,
                b03 = a01 * a12 - a02 * a11,
                b04 = a01 * a13 - a03 * a11,
                b05 = a02 * a13 - a03 * a12,
                b06 = a20 * a31 - a21 * a30,
                b07 = a20 * a32 - a22 * a30,
                b08 = a20 * a33 - a23 * a30,
                b09 = a21 * a32 - a22 * a31,
                b10 = a21 * a33 - a23 * a31,
                b11 = a22 * a33 - a23 * a32;
            // Calculate the determinant
            return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        }
        /**
         * Multiplies two mat4's explicitly not using SIMD
         * @param {Mat4} mat
         */
        multiply(mat) {
            const [a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, a30, a31, a32, a33] = this._out;
            // Cache only the current line of the second matrix
            let b0 = mat.value[0], b1 = mat.value[1], b2 = mat.value[2], b3 = mat.value[3];
            this._out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            this._out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            this._out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            this._out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

            b0 = mat.value[4]; b1 = mat.value[5]; b2 = mat.value[6]; b3 = mat.value[7];
            this._out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            this._out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            this._out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            this._out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

            b0 = mat.value[8]; b1 = mat.value[9]; b2 = mat.value[10]; b3 = mat.value[11];
            this._out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            this._out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            this._out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            this._out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

            b0 = mat.value[12]; b1 = mat.value[13]; b2 = mat.value[14]; b3 = mat.value[15];
            this._out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            this._out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            this._out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            this._out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

            return this;
        }
        /**
         * add two 4x4 matrixs 
         */
        add(mat) {
            this._out[0] += mat.value[0];
            this._out[1] += mat.value[1];
            this._out[2] += mat.value[2];
            this._out[3] += mat.value[3];
            this._out[4] += mat.value[4];
            this._out[5] += mat.value[5];
            this._out[6] += mat.value[6];
            this._out[7] += mat.value[7];
            this._out[8] += mat.value[8];
            this._out[9] += mat.value[9];
            this._out[10] += mat.value[10];
            this._out[11] += mat.value[11];
            this._out[12] += mat.value[12];
            this._out[13] += mat.value[13];
            this._out[14] += mat.value[14];
            this._out[15] += mat.value[15];
            return this;
        }
        /**
         * Translate a mat4 by the given vector not using SIMD
         * @param {Vec3} v3 vector to translate by
         * @return {Mat4}
         * @example
         *  let m4=new mat4();
         *  m4.translate(new vec3(1,0,4));
         *  m4.getTranslation(); 
         */
        translate(v3) {
            const [x, y, z] = v3.value,
                [a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, a30, a31, a32, a33] = this._out;
            this._out[12] = a00 * x + a10 * y + a20 * z + a30;
            this._out[13] = a01 * x + a11 * y + a21 * z + a31;
            this._out[14] = a02 * x + a12 * y + a22 * z + a32;
            this._out[15] = a03 * x + a13 * y + a23 * z + a33;
            return this;
        }
        /**
         * Scales the mat4 by the dimensions in the given vec3 not using vectorization
         * @param {Vec3} vec the vec3 to scale the matrix by
         */
        scale(vec) {
            let [x, y, z] = vec._out;
            this._out[0] *= x;
            this._out[1] *= x;
            this._out[2] *= x;
            this._out[3] *= x;
            this._out[4] *= y;
            this._out[5] *= y;
            this._out[6] *= y;
            this._out[7] *= y;
            this._out[8] *= z;
            this._out[9] *= z;
            this._out[10] *= z;
            this._out[11] *= z;
            return this;
        }
        /**
         * Rotates a mat4 by the given angle around the given axis
         * @param {number} rad the angle to rotate the matrix by
         * @param {Vec3} axis the axis to rotate around
         */
        rotate(rad, axis) {
            var [x, y, z] = axis._out,
                len = axis.len(),
                s, c, t,
                a00, a01, a02, a03,
                a10, a11, a12, a13,
                a20, a21, a22, a23,
                b00, b01, b02,
                b10, b11, b12,
                b20, b21, b22;
            if (Math.abs(len) < GLMatrix_1.EPSILON) { return null; }
            len = 1.0 / len;
            x *= len;
            y *= len;
            z *= len;
            s = Math.sin(rad);
            c = Math.cos(rad);
            t = 1 - c;
            a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
            a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
            a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];
            // Construct the elements of the rotation matrix
            b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
            b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
            b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;
            // Perform rotation-specific matrix multiplication
            this._out[0] = a00 * b00 + a10 * b01 + a20 * b02;
            this._out[1] = a01 * b00 + a11 * b01 + a21 * b02;
            this._out[2] = a02 * b00 + a12 * b01 + a22 * b02;
            this._out[3] = a03 * b00 + a13 * b01 + a23 * b02;
            this._out[4] = a00 * b10 + a10 * b11 + a20 * b12;
            this._out[5] = a01 * b10 + a11 * b11 + a21 * b12;
            this._out[6] = a02 * b10 + a12 * b11 + a22 * b12;
            this._out[7] = a03 * b10 + a13 * b11 + a23 * b12;
            this._out[8] = a00 * b20 + a10 * b21 + a20 * b22;
            this._out[9] = a01 * b20 + a11 * b21 + a21 * b22;
            this._out[10] = a02 * b20 + a12 * b21 + a22 * b22;
            this._out[11] = a03 * b20 + a13 * b21 + a23 * b22;
            return this;
        }
        /**
         * Rotates a matrix by the given angle around the X axis not using SIMD
         * @param {number} rad
         */
        rotateX(rad) {
            var s = Math.sin(rad),
                c = Math.cos(rad),
                a10 = this._out[4],
                a11 = this._out[5],
                a12 = this._out[6],
                a13 = this._out[7],
                a20 = this._out[8],
                a21 = this._out[9],
                a22 = this._out[10],
                a23 = this._out[11];
            // Perform axis-specific matrix multiplication
            this._out[4] = a10 * c + a20 * s;
            this._out[5] = a11 * c + a21 * s;
            this._out[6] = a12 * c + a22 * s;
            this._out[7] = a13 * c + a23 * s;
            this._out[8] = a20 * c - a10 * s;
            this._out[9] = a21 * c - a11 * s;
            this._out[10] = a22 * c - a12 * s;
            this._out[11] = a23 * c - a13 * s;
            return this;
        }
        /**
         * Rotates a matrix by the given angle around the Y axis not using SIMD
         * @param {Number} rad the angle to rotate the matrix by
         */
        rotateY(rad) {
            var s = Math.sin(rad),
                c = Math.cos(rad),
                a00 = this._out[0],
                a01 = this._out[1],
                a02 = this._out[2],
                a03 = this._out[3],
                a20 = this._out[8],
                a21 = this._out[9],
                a22 = this._out[10],
                a23 = this._out[11];
            // Perform axis-specific matrix multiplication
            this._out[0] = a00 * c - a20 * s;
            this._out[1] = a01 * c - a21 * s;
            this._out[2] = a02 * c - a22 * s;
            this._out[3] = a03 * c - a23 * s;
            this._out[8] = a00 * s + a20 * c;
            this._out[9] = a01 * s + a21 * c;
            this._out[10] = a02 * s + a22 * c;
            this._out[11] = a03 * s + a23 * c;
            return this;
        }
        /**
         * Rotates a matrix by the given angle around the Z axis not using SIMD
         * @param {Number} rad the angle to rotate the matrix by
         */
        rotateZ(rad) {
            var s = Math.sin(rad),
                c = Math.cos(rad),
                a00 = this._out[0],
                a01 = this._out[1],
                a02 = this._out[2],
                a03 = this._out[3],
                a10 = this._out[4],
                a11 = this._out[5],
                a12 = this._out[6],
                a13 = this._out[7];
            // Perform axis-specific matrix multiplication
            this._out[0] = a00 * c + a10 * s;
            this._out[1] = a01 * c + a11 * s;
            this._out[2] = a02 * c + a12 * s;
            this._out[3] = a03 * c + a13 * s;
            this._out[4] = a10 * c - a00 * s;
            this._out[5] = a11 * c - a01 * s;
            this._out[6] = a12 * c - a02 * s;
            this._out[7] = a13 * c - a03 * s;
            return this;
        }
        /**
         * Creates a matrix from a vector translation
         * This is equivalent to (but much faster than):
         *      mat4.identity(dest);
         *      mat4.translate(dest, dest, vec);
         * @param {Vec3} v3 Translation vector
         */
        static fromVec3Translation(v3) {
            let m4 = new Mat4(),
                [x, y, z] = v3.value;
            m4.set(1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                x, y, z, 1);
            return m4;
        }
        /**
         * Creates a matrix from a vector scaling
         * This is equivalent to (but much faster than):
         *  mat4.identity(dest);
         *  mat4.scale(dest, dest, vec);
         * @param {Vec3} vec Scaling vector
         * @returns {Mat4} 
         */
        static fromScaling(vec) {
            let mat = new Mat4(),
                [x, y, z] = vec._out;
            mat.set(x, 0, 0, 0,
                0, y, 0, 0,
                0, 0, z, 0,
                0, 0, 0, 1);
            return mat;
        }
        /**
         * Creates a matrix from a given angle around a given axis
         * This is equivalent to (but much faster than):
         *  mat4.identity(dest);
         *  mat4.rotate(dest, dest, rad, axis);
         * @param {Number} rad the angle to rotate the matrix by
         * @param {Vec3} axis the axis to rotate around
         */
        static fromRotation(rad, axis) {
            var [x, y, z] = axis._out,
                len = axis.len(),
                mat = new Mat4(),
                s, c, t;
            if (len < GLMatrix_1.EPSILON) { return null; }
            len = 1.0 / len;
            x *= len;
            y *= len;
            z *= len;
            s = Math.sin(rad);
            c = Math.cos(rad);
            t = 1 - c;
            // Perform rotation-specific matrix multiplication
            mat.set(x * x * t + c, y * x * t + z * s, z * x * t - y * s, 0,
                x * y * t - z * s, y * y * t + c, z * y * t + x * s, 0,
                x * z * t + y * s, y * z * t - x * s, z * z * t + c, 0,
                0, 0, 0, 1);
            return mat;
        }
        /**
         * Creates a matrix from the given angle around the X axis
         * This is equivalent to (but much faster than):
         *  mat4.identity(dest);
         *  mat4.rotateX(dest, dest, rad);
         * @param {Number} rad the angle to rotate the matrix by
         */
        static fromXRotation(rad) {
            let mat = new Mat4(),
                s = Math.sin(rad),
                c = Math.cos(rad);
            mat.set(1, 0, 0, 0,
                0, c, s, 0,
                0, -s, c, 0,
                0, 0, 0, 1);
            return mat;
        }
        /**
         * Creates a matrix from the given angle around the Y axis
         * This is equivalent to (but much faster than):
         *  mat4.identity(dest);
         *  mat4.rotateY(dest, dest, rad);
         * 
         * @param {Number} rad the angle to rotate the matrix by
         */
        static fromYRotation(rad) {
            let mat = new Mat4(),
                s = Math.sin(rad),
                c = Math.cos(rad);
            // Perform axis-specific matrix multiplication
            mat.set(c, 0, -s, 0,
                0, 1, 0, 0,
                s, 0, c, 0,
                0, 0, 0, 1);
            return mat;
        }
        /**
         * Creates a matrix from the given angle around the Z axis
         * This is equivalent to (but much faster than):
         *  mat4.identity(dest);
         *  mat4.rotateZ(dest, dest, rad);
         * 
         * @param {Number} rad the angle to rotate the matrix by
         */
        static fromZRotation(rad) {
            let mat = new Mat4(),
                s = Math.sin(rad),
                c = Math.cos(rad);
            // Perform axis-specific matrix multiplication
            mat.set(c, s, 0, 0,
                -s, c, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1);
            return mat;
        }
        /**
         * Returns the translation vector component of a transformation
         *  matrix. If a matrix is built with fromRotationTranslation,
         *  the returned vector will be the same as the translation vector
         *  originally supplied.
         * @return {Vec3} out
        */
        getTranslation() {
            let v3 = new Vec3_1();
            v3.set(this._out[12], this._out[13], this._out[14]);
            return v3;
        }
        /**
         * Creates a matrix from a quaternion rotation and vector translation
         * This is equivalent to (but much faster than):
         *  mat4.identity(dest);
         *  mat4.translate(dest, vec);
         *  var quatMat = mat4.create();
         *  quat4.toMat4(quat, quatMat);
         *  mat4.multiply(dest, quatMat);
         * 
         * @param {quat} qua Rotation quaternion
         * @param {Vec3} vec Translation vector
         */
        static fromRotationTranslation(qua, vec) {
            // Quaternion math
            let mat = new Mat4(),
                [x, y, z, w] = qua._out,
                [v0, v1, v2] = vec._out,
                x2 = x + x,
                y2 = y + y,
                z2 = z + z,
                xx = x * x2,
                xy = x * y2,
                xz = x * z2,
                yy = y * y2,
                yz = y * z2,
                zz = z * z2,
                wx = w * x2,
                wy = w * y2,
                wz = w * z2;
            mat.set(1 - (yy + zz), xy + wz, xz - wy, 0,
                xy - wz, 1 - (xx + zz), yz + wx, 0,
                xz + wy, yz - wx, 1 - (xx + yy), 0,
                v0, v1, v2, 1);
            return mat;
        }
        /**
         * Returns the scaling factor component of a transformation
         * matrix. If a matrix is built with fromRotationTranslationScale
         * with a normalized Quaternion paramter, the returned vector will be 
         * the same as the scaling vector
         * originally supplied.
         * @return {Vec3} 
         */
        getScaling() {
            let vec = new Vec3_1(),
                m11 = mat[0],
                m12 = mat[1],
                m13 = mat[2],
                m21 = mat[4],
                m22 = mat[5],
                m23 = mat[6],
                m31 = mat[8],
                m32 = mat[9],
                m33 = mat[10];
            x = Math.sqrt(m11 * m11 + m12 * m12 + m13 * m13);
            y = Math.sqrt(m21 * m21 + m22 * m22 + m23 * m23);
            z = Math.sqrt(m31 * m31 + m32 * m32 + m33 * m33);
            vec.set(x, y, z);
            return vec;
        }
        /**
         * Returns a quaternion representing the rotational component
         * of a transformation matrix. If a matrix is built with
         * fromRotationTranslation, the returned quaternion will be the
         * same as the quaternion originally supplied.
         * Algorithm taken from http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm
         * @return {quat} 
         */
        getRotation() {
            let S = 0,
                x, y, z, w,
                qua = new Quat_1(),
                trace = this._out[0] + this._out[5] + this._out[10];

            if (trace > 0) {
                S = Math.sqrt(trace + 1.0) * 2;
                w = 0.25 * S;
                x = (this._out[6] - this._out[9]) / S;
                y = (this._out[8] - this._out[2]) / S;
                z = (this._out[1] - this._out[4]) / S;
            } else if ((this._out[0] > this._out[5]) & (this._out[0] > this._out[10])) {
                S = Math.sqrt(1.0 + this._out[0] - this._out[5] - this._out[10]) * 2;
                w = (this._out[6] - this._out[9]) / S;
                x = 0.25 * S;
                y = (this._out[1] + this._out[4]) / S;
                z = (this._out[8] + this._out[2]) / S;
            } else if (this._out[5] > this._out[10]) {
                S = Math.sqrt(1.0 + this._out[5] - this._out[0] - this._out[10]) * 2;
                w = (this._out[8] - this._out[2]) / S;
                x = (this._out[1] + this._out[4]) / S;
                y = 0.25 * S;
                z = (this._out[6] + this._out[9]) / S;
            } else {
                S = Math.sqrt(1.0 + this._out[10] - this._out[0] - this._out[5]) * 2;
                w = (this._out[1] - this._out[4]) / S;
                x = (this._out[8] + this._out[2]) / S;
                y = (this._out[6] + this._out[9]) / S;
                z = 0.25 * S;
            }
            qua.set(x, y, z, w);
            return qua;
        }
        /**
         * Creates a matrix from a quaternion rotation, vector translation and vector scale
         * This is equivalent to (but much faster than):
         *  mat4.identity(dest);
         *  mat4.translate(dest, vec);
         *  var quatMat = mat4.create();
         *  quat4.toMat4(quat, quatMat);
         *  mat4.multiply(dest, quatMat);
         *  mat4.scale(dest, scale)
         * @param {quat} q rotation quaternion
         * @param {Vec3} v translation vector
         * @param {Vec3} s scaling vectoer
         * @return {Mat4} 
         */
        static fromRotationTranslationScale(q, v, s) {
            let mat = new Mat4(),
                [x, y, z, w] = qua._out,
                [v0, v1, v2] = v._out,
                x2 = x + x,
                y2 = y + y,
                z2 = z + z,
                xx = x * x2,
                xy = x * y2,
                xz = x * z2,
                yy = y * y2,
                yz = y * z2,
                zz = z * z2,
                wx = w * x2,
                wy = w * y2,
                wz = w * z2,
                sx = s[0],
                sy = s[1],
                sz = s[2];
            mat.set((1 - (yy + zz)) * sx, (xy + wz) * sx, (xz - wy) * sx, 0
                (xy - wz) * sy, (1 - (xx + zz)) * sy, (yz + wx) * sy, 0,
                (xz + wy) * sz, (yz - wx) * sz, (1 - (xx + yy)) * sz, 0,
                v0, v1, v2, 1);
            return mat;
        }
        /**
         * Creates a matrix from a quaternion rotation, vector translation and vector scale, rotating and scaling around the given origin
         * This is equivalent to (but much faster than):
         *  mat4.identity(dest);
         *  mat4.translate(dest, vec);
         *  mat4.translate(dest, origin);
         *  var quatMat = mat4.create();
         *  quat4.toMat4(quat, quatMat);
         *  mat4.multiply(dest, quatMat);
         *  mat4.scale(dest, scale);
         *  mat4.translate(dest, negativeOrigin);
         * 
         * @param {quat} q Rotation quaternion
         * @param {Vec3} v Translation vector
         * @param {Vec3} s Scaling vector
         * @param {Vec3} o The origin vector around which to scale and rotate
         * @return {Mat4}
         */
        static fromRotationTranslationScaleOrigin(q, v, s, o) {
            // Quaternion math
            var mat = new Mat4(),
                [x, y, z, w] = q._out,
                [sx, sy, sz] = v._out,
                [ox, oy, oz] = o._out,
                [vx, vy, vz] = v._out,
                x2 = x + x,
                y2 = y + y,
                z2 = z + z,
                xx = x * x2,
                xy = x * y2,
                xz = x * z2,
                yy = y * y2,
                yz = y * z2,
                zz = z * z2,
                wx = w * x2,
                wy = w * y2,
                wz = w * z2;
            mat.set((1 - (yy + zz)) * sx, (xy + wz) * sx, (xz - wy) * sx, 0,
                (xy - wz) * sy, (1 - (xx + zz)) * sy, (yz + wx) * sy, 0,
                (xz + wy) * sz, (yz - wx) * sz, (1 - (xx + yy)) * sz, 0,
                vx + ox - (out[0] * ox + out[4] * oy + out[8] * oz), vy + oy - (out[1] * ox + out[5] * oy + out[9] * oz), vz + oz - (out[2] * ox + out[6] * oy + out[10] * oz), 1);
            return mat;
        }
        /**
         * Calculates a 4x4 matrix from the given quaternion
         * @param {quat} q Quaternion to create matrix from
         * @return {Mat4}
         */
        static fromQuat(q) {
            let mat = new Mat4(),
                [x, y, z, w] = q._out,
                x2 = x + x,
                y2 = y + y,
                z2 = z + z,

                xx = x * x2,
                yx = y * x2,
                yy = y * y2,
                zx = z * x2,
                zy = z * y2,
                zz = z * z2,
                wx = w * x2,
                wy = w * y2,
                wz = w * z2;
            mat.set(1 - yy - zz, yx + wz, zx - wy, 0,
                yx - wz, 1 - xx - zz, zy + wx, 0,
                zx + wy, zy - wx, 1 - xx - yy, 0,
                0, 0, 0, 1);
            return mat;
        }
        /**
         * Generates a frustum matrix with the given bounds
         * @param {Number} left Left bound of the frustum
         * @param {Number} right Right bound of the frustum
         * @param {Number} bottom Bottom bound of the frustum
         * @param {Number} top Top bound of the frustum
         * @param {Number} near Near bound of the frustum
         * @param {Number} far Far bound of the frustum
         * @return {Mat4}
         */
        static frustum(left, right, bottom, top, near, far) {
            var mat = new Mat4(),
                rl = 1 / (right - left),
                tb = 1 / (top - bottom),
                nf = 1 / (near - far);
            mat.set((near * 2) * rl, 0, 0, 0,
                0, (near * 2) * tb, 0, 0,
                (right + left) * rl, (top + bottom) * tb, (far + near) * nf, -1,
                0, 0, (far * near * 2) * nf, 0);
            return mat;
        }
        /**
         * Generates a perspective projection matrix with the given bounds
         * @param {number} fovy Vertical field of view in radians
         * @param {number} aspect Aspect ratio. typically viewport width/height
         * @param {number} near Near bound of the frustum
         * @param {number} far Far bound of the frustum
         * @return {Mat4}
         */
        static perspective(fovy, aspect, near, far) {
            var m4 = new Mat4(),
                //f = 1.0 / Math.tan(fovy / 2), discard
                //tan（π/2-α）= cotα 
                //cot(fovy/2) = tan(pi/2 - fovy/2);
                f = Math.tan((Math.PI - fovy) * 0.5),
                nf = 1.0 / (near - far);
            m4.set(f / aspect, 0, 0, 0,
                0, f, 0, 0,
                0, 0, (far + near) * nf, -1,
                0, 0, (2 * far * near) * nf, 0);
            return m4;
        }
        /**
         * Generates a perspective projection matrix with the given field of view.
         * This is primarily useful for generating projection matrices to be used
         * with the still experiemental WebVR API.
         * @param {Object} fov Object containing the following values: upDegrees, downDegrees, leftDegrees, rightDegrees
         * @param {number} near Near bound of the frustum
         * @param {number} far Far bound of the frustum
         * @return {Mat4} out
         */
        static perspectiveFromFieldOfView(fov, near, far) {
            let m4 = new Mat4(),
                upTan = Math.tan(fov.upDegrees * Math.PI / 180.0),
                downTan = Math.tan(fov.downDegrees * Math.PI / 180.0),
                leftTan = Math.tan(fov.leftDegrees * Math.PI / 180.0),
                rightTan = Math.tan(fov.rightDegrees * Math.PI / 180.0),
                xScale = 2.0 / (leftTan + rightTan),
                yScale = 2.0 / (upTan + downTan);
            m4.set(xScale, 0, 0, 0,
                0, yScale, 0, 0,
                -((leftTan - rightTan) * xScale * 0.5), ((upTan - downTan) * yScale * 0.5), far / (near - far), -1,
                0, 0, (far * near) / (near - far), 0);
            return m4;
        }
        /**
         * Generates a orthogonal projection matrix with the given bounds
         * reference https://webgl2fundamentals.org/webgl/lessons/webgl-3d-orthographic.html
         * @param {number} left Left bound of the frustum
         * @param {number} right Right bound of the frustum
         * @param {number} bottom Bottom bound of the frustum
         * @param {number} top Top bound of the frustum
         * @param {number} near Near bound of the frustum
         * @param {number} far Far bound of the frustum
         * @return {Mat4} 
         */
        static ortho(left, right, bottom, top, near, far) {
            let mat = new Mat4(),
                lr = 1.0 / (left - right),
                bt = 1.0 / (bottom - top),
                nf = 1.0 / (near - far);
            mat.set(-2 * lr, 0, 0, 0,
                0, -2 * bt, 0, 0,
                0, 0, 2 * nf, 0,
                (left + right) * lr, (top + bottom) * bt, (far + near) * nf, 1);
            return mat;
        }
        /**
         * Generates a look-at matrix with the given eye position, focal point, and up axis
         * @param {Vec3} eye the camera Position of the viewer
         * @param {Vec3} center the target point the viewer is looking at
         * @param {Vec3} up vec3 pointing up
         * @return {Mat4}
         */
        // lookAt(eye, center, up) {
        //     let x0, x1, x2, y0, y1, y2, z0, z1, z2, len,
        //         [eyex, eyey, eyez] = eye.value,
        //         [upx, upy, upz] = up.value,
        //         [centerx, centery, centerz] = center._out;

        //     if (Math.abs(eyex - centerx) < GLMatrix.EPSILON &&
        //         Math.abs(eyey - centery) < GLMatrix.EPSILON &&
        //         Math.abs(eyez - centerz) < GLMatrix.EPSILON) {
        //         return this.identity();
        //     }
        //     z0 = eyex - centerx;
        //     z1 = eyey - centery;
        //     z2 = eyez - centerz;
        //     len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
        //     z0 *= len;
        //     z1 *= len;
        //     z2 *= len;
        //     x0 = upy * z2 - upz * z1;
        //     x1 = upz * z0 - upx * z2;
        //     x2 = upx * z1 - upy * z0;
        //     len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
        //     if (!len) {
        //         x0 = 0;
        //         x1 = 0;
        //         x2 = 0;
        //     } else {
        //         len = 1 / len;
        //         x0 *= len;
        //         x1 *= len;
        //         x2 *= len;
        //     }
        //     y0 = z1 * x2 - z2 * x1;
        //     y1 = z2 * x0 - z0 * x2;
        //     y2 = z0 * x1 - z1 * x0;
        //     len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
        //     if (!len) {
        //         y0 = 0;
        //         y1 = 0;
        //         y2 = 0;
        //     } else {
        //         len = 1 / len;
        //         y0 *= len;
        //         y1 *= len;
        //         y2 *= len;
        //     }
        //     this.set(x0, y0, z0, 0,
        //         x1, y1, z1, 0,
        //         x2, y2, z2, 0,
        //         -(x0 * eyex + x1 * eyey + x2 * eyez), -(y0 * eyex + y1 * eyey + y2 * eyez), -(z0 * eyex + z1 * eyey + z2 * eyez), 1);
        //     return this;
        // }
        /**
         * Generates a look-at matrix with the given eye position, focal point, and up axis
         * @param {Vec3} cameraPosition the camera Position of the viewer
         * @param {Vec3} center the target point the viewer is looking at
         * @param {Vec3} up vec3 pointing up
         * @return {Mat4}
         */
        lookAt(cameraPosition,target,up){
            let zAxis = cameraPosition.clone().sub(target).normalize(),
                xAxis = up.clone().cross(zAxis),
                yAxis = zAxis.clone().cross(xAxis);
            this.set(
                xAxis.value[0], xAxis.value[1], xAxis.value[2], 0,
                yAxis.value[0], yAxis.value[1], yAxis.value[2], 0,
                zAxis.value[0], zAxis.value[1], zAxis.value[2], 0,
                cameraPosition.value[0],cameraPosition.value[1],cameraPosition.value[2],1
            );
            return this;
        }
        /**
         * Returns a string representation of a mat4
         * @return {String}
         */
        toString() {
            return 'mat4(' +
                this._out[0] + ', ' + this._out[1] + ', ' + this._out[2] + ', ' + this._out[3] + ', ' +
                this._out[4] + ', ' + this._out[5] + ', ' + this._out[6] + ', ' + this._out[7] + ', ' +
                this._out[8] + ', ' + this._out[9] + ', ' + this._out[10] + ', ' + this._out[11] + ', ' +
                this._out[12] + ', ' + this._out[13] + ', ' + this._out[14] + ', ' + this._out[15] + ')';
        }
        /**
         * Returns Frobenius norm of a mat4
         * @return {Number} Frobenius norm
         */
        forb() {
            return Math.sqrt(Math.pow(this._out[0], 2) + Math.pow(this._out[1], 2) + Math.pow(this._out[2], 2) + Math.pow(this._out[3], 2) +
                Math.pow(this._out[4], 2) + Math.pow(this._out[5], 2) + Math.pow(this._out[6], 2) + Math.pow(this._out[7], 2) +
                Math.pow(this._out[8], 2) + Math.pow(this._out[9], 2) + Math.pow(this._out[10], 2) + Math.pow(this._out[11], 2) +
                Math.pow(this._out[12], 2) + Math.pow(this._out[13], 2) + Math.pow(this._out[14], 2) + Math.pow(this._out[15], 2));
        }
        /**
         * Adds two mat4's
         * @param {Mat4} m4
         */
        add(m4) {
            this._out[0] += m4.value[0];
            this._out[1] += m4.value[1];
            this._out[2] += m4.value[2];
            this._out[3] += m4.value[3];
            this._out[4] += m4.value[4];
            this._out[5] += m4.value[5];
            this._out[6] += m4.value[6];
            this._out[7] += m4.value[7];
            this._out[8] += m4.value[8];
            this._out[9] += m4.value[9];
            this._out[10] += m4.value[10];
            this._out[11] += m4.value[11];
            this._out[12] += m4.value[12];
            this._out[13] += m4.value[13];
            this._out[14] += m4.value[14];
            this._out[15] += m4.value[15];
            return this;
        }
        /**
         * Subtracts matrix b from matrix a
         * @param {Mat4} m4
         * @return {Mat4}
         */
        sub(m4) {
            this._out[0] -= m4.value[0];
            this._out[1] -= m4.value[1];
            this._out[2] -= m4.value[2];
            this._out[3] -= m4.value[3];
            this._out[4] -= m4.value[4];
            this._out[5] -= m4.value[5];
            this._out[6] -= m4.value[6];
            this._out[7] -= m4.value[7];
            this._out[8] -= m4.value[8];
            this._out[9] -= m4.value[9];
            this._out[10] -= m4.value[10];
            this._out[11] -= m4.value[11];
            this._out[12] -= m4.value[12];
            this._out[13] -= m4.value[13];
            this._out[14] -= m4.value[14];
            this._out[15] -= m4.value[15];
            return this;
        }
        /**
         * Returns whether or not the matrices have approximately the same elements in the same position.
         * @param {Mat4} m4
         * @param {boolean}
         */
        equals(m4) {
            let [a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15] = this._out,
                [b0, b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11, b12, b13, b14, b15] = m4.value;
            return (Math.abs(a0 - b0) <= GLMatrix_1.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
                Math.abs(a1 - b1) <= GLMatrix_1.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
                Math.abs(a2 - b2) <= GLMatrix_1.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
                Math.abs(a3 - b3) <= GLMatrix_1.EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) &&
                Math.abs(a4 - b4) <= GLMatrix_1.EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) &&
                Math.abs(a5 - b5) <= GLMatrix_1.EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)) &&
                Math.abs(a6 - b6) <= GLMatrix_1.EPSILON * Math.max(1.0, Math.abs(a6), Math.abs(b6)) &&
                Math.abs(a7 - b7) <= GLMatrix_1.EPSILON * Math.max(1.0, Math.abs(a7), Math.abs(b7)) &&
                Math.abs(a8 - b8) <= GLMatrix_1.EPSILON * Math.max(1.0, Math.abs(a8), Math.abs(b8)) &&
                Math.abs(a9 - b9) <= GLMatrix_1.EPSILON * Math.max(1.0, Math.abs(a9), Math.abs(b9)) &&
                Math.abs(a10 - b10) <= GLMatrix_1.EPSILON * Math.max(1.0, Math.abs(a10), Math.abs(b10)) &&
                Math.abs(a11 - b11) <= GLMatrix_1.EPSILON * Math.max(1.0, Math.abs(a11), Math.abs(b11)) &&
                Math.abs(a12 - b12) <= GLMatrix_1.EPSILON * Math.max(1.0, Math.abs(a12), Math.abs(b12)) &&
                Math.abs(a13 - b13) <= GLMatrix_1.EPSILON * Math.max(1.0, Math.abs(a13), Math.abs(b13)) &&
                Math.abs(a14 - b14) <= GLMatrix_1.EPSILON * Math.max(1.0, Math.abs(a14), Math.abs(b14)) &&
                Math.abs(a15 - b15) <= GLMatrix_1.EPSILON * Math.max(1.0, Math.abs(a15), Math.abs(b15)));
        }
    }

    var Mat4_1 = Mat4;

    /**
     * make a package of matrix
     */


    var init = {
        Vec2: Vec2_1, 
        Vec3: Vec3_1, 
        Vec4: Vec4_1,
        Mat3: Mat3_1,
        Mat4: Mat4_1, 
        Quat: Quat_1, 
        GLMatrix: GLMatrix_1
    };

    /**
     * reference:
     * https://juejin.im/post/5a0872d4f265da43062a4156
     * https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-3d-camera.html
     * 
     * 相机的矩阵分为三个：
     * 1. 投影矩阵（projectMatrix)
     * 2. 视图矩阵（cameraMatrixWorldInverse 或 viewMatrix)
     * 3. 物体位置矩阵 (objectWorldMatrix)
     * 
     * const uMatrix = projectionMatrix * viewMatrix * objectMatrix
     */

    /**
     * 矩阵
     */

    var Mat4$1 = init.Mat4;
    /**
     * 
     */

    var Camera = function Camera() {
      _classCallCheck(this, Camera);

      /**
       * 视角矩阵 
       */
      this._viewMatrix = new Mat4$1();
      /**
       * 投影矩阵
       */

      this._projectionMatrix = new Mat4$1();
      /**
       * 视角投影矩阵
       */

      this._viewProjectionMatrix = this._projectionMatrix.clone().multiply(this._viewMatrix);
    };

    var Camera_1 = Camera;

    /**
     * 
     */

    var Mat4$2 = init.Mat4,
        Vec3$1 = init.Vec3,
        GLMatrix$1 = init.GLMatrix;
    /**
     * const viewProjectionMatrix = projectionMatrix * viewMatrix * [objectMatrix]
     */

    var PerspectiveCamera =
    /*#__PURE__*/
    function (_Camera) {
      _inherits(PerspectiveCamera, _Camera);

      /**
       * 
       * @param {*} fov 与垂面的夹角，使用角度表示
       * @param {*} aspect 视角,一般使用屏幕width/height
       * @param {*} near 近投影面
       * @param {*} far 远投影面
       */
      function PerspectiveCamera(fov, aspect, near, far) {
        var _this;

        _classCallCheck(this, PerspectiveCamera);

        _this = _possibleConstructorReturn(this, _getPrototypeOf(PerspectiveCamera).call(this));
        _this._fov = fov ? fov : 50;
        _this._zoom = 1;
        _this._near = near ? near : 0.1;
        _this._far = far ? far : 2000;
        _this._aspect = aspect ? aspect : 1.0;
        _this._target = new Vec3$1().set(0, 0, 0);
        _this._position = new Vec3$1().set(0, 0, 1);
        _this._up = new Vec3$1().set(0, 1, 0); //更新投影矩阵

        _this._updateProjectionMatrix();

        return _this;
      }
      /**
      * @param {Array} v,长度为3的数组，分别表示x,y,z
      */


      _createClass(PerspectiveCamera, [{
        key: "lookAt",
        value: function lookAt(v) {
          this._target.set(v[0], v[1], v[2]);

          this._update();
        }
        /**
        * @param {Array} v,长度为3的数组，分别表示x,y,z
        */

      }, {
        key: "_updateProjectionMatrix",

        /**
         * 更新投影矩阵
         */
        value: function _updateProjectionMatrix() {
          this._projectionMatrix = Mat4$2.perspective(GLMatrix$1.toRadian(this._fov), this._aspect, this._near, this._far);

          this._update();
        }
      }, {
        key: "_update",
        value: function _update() {
          /**
           * 相机矩阵，这个矩阵代表的是相机在世界坐标中的位置和姿态。
           * https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-3d-camera.html 
           */
          var cameraMatrix = new Mat4$2().lookAt(this._position, this._target, this._up);
          /**
           * 视图矩阵是将所有物体以相反于相机的方向运动
           */

          this._viewMatrix = cameraMatrix.clone().invert();
          /**
           * 
           */

          this._viewProjectionMatrix = this._projectionMatrix.clone().multiply(this._viewMatrix);
        }
      }, {
        key: "position",
        set: function set(v) {
          this._position.set(v[0], v[1], v[2]);

          this._update();
        }
        /**
         * @return {Vec3} position vec
         */
        ,
        get: function get() {
          return this._position;
        }
      }, {
        key: "target",
        get: function get() {
          return this._target;
        }
        /**
         * 返回identityMatrix，一般用作没有指定的modelMatrix填充
         */

      }, {
        key: "IdentityMatrix",
        get: function get() {
          return new Mat4$2().identity().value;
        }
        /**
         * 返回投影矩阵
         */

      }, {
        key: "ProjectionMatrix",
        get: function get() {
          return this._projectionMatrix.value;
        }
        /**
         * 
         */

      }, {
        key: "up",
        get: function get() {
          return this._up;
        }
        /**
         * 返回视角矩阵
         */

      }, {
        key: "ViewMatrix",
        get: function get() {
          return this._viewMatrix.value;
        }
        /**
         * 返回视角投影矩阵
         */

      }, {
        key: "ViewProjectionMatrix",
        get: function get() {
          return this._viewProjectionMatrix.value;
        }
      }]);

      return PerspectiveCamera;
    }(Camera_1);

    var PerspectiveCamera_1 = PerspectiveCamera;

    function getCjsExportFromNamespace (n) {
    	return n && n.default || n;
    }

    var glsl_earth_gl_camera_fs = getCjsExportFromNamespace(glslEarthGlCameraFs$1);

    var glsl_earth_gl_camera_vs = getCjsExportFromNamespace(glslEarthGlCameraVs$1);

    /**
     * 
     */

    var init$1 = {
      gl: {
        camera: {
          PerspectiveCamera: PerspectiveCamera_1
        },
        renderer: {
          GProgram: GProgram_1,
          GBuffer: GBuffer_1,
          GUniform: GUniform_1
        },
        shader: {
          glsl_earth_gl_camera_fs: glsl_earth_gl_camera_fs,
          glsl_earth_gl_camera_vs: glsl_earth_gl_camera_vs
        }
      }
    };
    var init_1$1 = init$1.gl;

    exports.default = init$1;
    exports.gl = init_1$1;

    return exports;

}({}));
