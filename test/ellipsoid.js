const glslify = require("glslify");
const node3d = require("3d-core-raub");
global.document = global.window = node3d.doc;
const requestAnimationFrame = window.requestAnimationFrame;
const { Screen } = node3d;
/**
 * @type {WebGLRenderingContext}
 */
const gl = node3d.gl;
const screen = new Screen();
/**
 * 
 */
const fragText = glslify.file("./../src/shader/glsl-earth-gl-camera-fs.glsl");
const vertText = glslify.file("./../src/shader/glsl-earth-gl-camera-vs.glsl");
/**
 * 
 */
const EarthObject = require("../src/scene/Global");
const earthObject = new EarthObject();

const GProgram = require("../src/renderer/GProgram");
const GBuffer = require("../src/renderer/GBuffer");
const GUniform = require("../src/renderer/GUniform");
const PerspectiveCamera = require("../src/camera/PerspectiveCamera");
const program = new GProgram(gl, vertText, fragText);
program.useProgram();

const buffer = new GBuffer(program, gl.ARRAY_BUFFER, gl.STATIC_DRAW, "a_position");
buffer.bindBuffer();
buffer.bufferData(new Float32Array(earthObject._vertices));
buffer.linkPointerAndPosition(3, gl.FLOAT, false, 0, 0);

const indexBuffer = new GBuffer(program, gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW);
indexBuffer.bindBuffer();
indexBuffer.bufferData(new Uint16Array(earthObject._indexs));

gl.viewport(0, 0, 800, 600);
//
var camera = new PerspectiveCamera(60, 800 / 600, 0.01,6356753);
camera.position = [0, 0, 6356753*3];
camera.lookAt([0, 0, 0]);
//
var u_projectionMatrix = new GUniform(program, "u_projectionMatrix");
var u_viewMatrix = new GUniform(program, "u_viewMatrix");
var u_modelMatrix = new GUniform(program, "u_modelMatrix");
//
const refresh = function () {
    //
    u_projectionMatrix.assignValue(camera.ProjectionMatrix);
    u_viewMatrix.assignValue(camera.ViewMatrix);
    u_modelMatrix.assignValue(camera.IdentityMatrix);
    //
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT);
    //gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.drawElements(gl.TRIANGLES, earthObject._indexs.length, gl.UNSIGNED_SHORT, 0);
    requestAnimationFrame(refresh);
    screen.draw();
};

refresh();

    // //
    // var pos = new Vec4().set(-0.5*6356753, -0.5*6356753, 0.0, 1.0);
    // var s = [];
    // for (var m = 0; m < 16; m += 4) {
    //     s1 = camera.ViewProjectionMatrix[m] * pos.value[0];
    //     s2 = camera.ViewProjectionMatrix[m + 1] * pos.value[1];
    //     s3 = camera.ViewProjectionMatrix[m + 2] * pos.value[2];
    //     s4 = camera.ViewProjectionMatrix[m + 3] * pos.value[3];
    //     var ss = s1 + s2 + s3 + s4;
    //     s.push(ss);
    // }