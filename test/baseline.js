const glslify = require("glslify");
const node3d = require("3d-core-raub");
global.document = global.window = node3d.doc;
const requestAnimationFrame = window.requestAnimationFrame;
const {gl,Screen} = node3d;
const screen = new Screen();
/**
 * 
 */
const fragText = glslify.file("./../src/shader/glsl-earth-gl-standard-fs.glsl");
const vertText = glslify.file("./../src/shader/glsl-earth-gl-standard-vs.glsl");
/**
 * 
 */
const GProgram = require("./../src/renderer/GProgram");
const GBuffer = require("./../src/renderer/GBuffer");
const program = new GProgram(gl, vertText, fragText);
program.useProgram();
const buffer = new GBuffer(program, gl.ARRAY_BUFFER, gl.STATIC_DRAW, "a_position");
buffer.bindBuffer();
buffer.bufferData(new Float32Array([-0.5, -0.5, 0.0, 0.0, -0.5, 0.0, 0.0, 0.0, 0.0]));
buffer.linkPointerAndPosition(3, gl.FLOAT, false, 0, 0);

const refresh = function(){
    gl.viewport(0, 0, 800, 600);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(refresh);
    screen.draw();
    //image.src = canvas.toDataURL("image/png");
};

refresh();

