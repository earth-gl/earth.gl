const glslify = require("glslify");
const node3d = require("3d-core-raub");
global.document = global.window = node3d.doc;
const requestAnimationFrame = window.requestAnimationFrame;
const {gl,Screen} = node3d;
const screen = new Screen();
/**
 * 
 */
const fragText = glslify.file("./../src/shader/glsl-earth-gl-camera-fs.glsl");
const vertText = glslify.file("./../src/shader/glsl-earth-gl-camera-vs.glsl");
/**
 * 
 */
const GProgram = require("./../src/renderer/GProgram");
const GBuffer = require("./../src/renderer/GBuffer");
const GUniform = require("./../src/renderer/GUniform");
const PerspectiveCamera = require("./../src/camera/PerspectiveCamera");
const program = new GProgram(gl, vertText, fragText);
program.useProgram();
const buffer = new GBuffer(program, gl.ARRAY_BUFFER, gl.STATIC_DRAW, "a_position");
buffer.bindBuffer();
buffer.bufferData(new Float32Array([-0.5*65535, -0.5*65535, 0.0, 0.0, -0.5*65535, 0.0, 0.0, 0.0, 0.0]));
buffer.linkPointerAndPosition(3, gl.FLOAT, false, 0, 0);
gl.viewport(0, 0, 800, 600);
//
var camera = new PerspectiveCamera(60,800/600,0.01,10);
camera.position = [0,0,1];
//
var u_projectionMatrix = new GUniform(program,"u_projectionMatrix");
var u_viewMatrix = new GUniform(program,"u_viewMatrix");
var u_modelMatrix = new GUniform(program,"u_modelMatrix");
//
const refresh = function(){
    //
    u_projectionMatrix.assignValue(camera.ProjectionMatrix);
    u_viewMatrix.assignValue(camera.ViewMatrix);
    u_modelMatrix.assignValue(camera.IdentityMatrix);
    //
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(refresh);
    screen.draw();
};

refresh();

