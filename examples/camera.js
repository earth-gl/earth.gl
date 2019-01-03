const fragText = earth.gl.shader.glsl_earth_gl_camera_fs;
const vertText = earth.gl.shader.glsl_earth_gl_camera_vs;

var width = 800, height = 600;
const canvas = document.getElementById('sceneCanvas');
canvas.width = width;
canvas.height = height;
const gl = canvas.getContext('webgl');
const program = new earth.gl.renderer.GProgram(gl, vertText, fragText);
program.useProgram();
const buffer = new earth.gl.renderer.GBuffer(program, gl.ARRAY_BUFFER, gl.STATIC_DRAW, 'a_position');
buffer.bindBuffer();
buffer.bufferData(new Float32Array([-0.5, -0.5, 0.0, 0.0, -0.5, 0.0, 0.0, 0.0, 0.0]));
buffer.linkPointerAndPosition(3, gl.FLOAT, false, 0, 0);
//
var camera = new earth.gl.camera.PerspectiveCamera(60,800/600,0.01,10);
camera.position = [0,0,3];
//
var u_projectionMatrix = new earth.gl.renderer.GUniform(program,"u_projectionMatrix");
var u_viewMatrix = new earth.gl.renderer.GUniform(program,"u_viewMatrix");
var u_modelMatrix = new earth.gl.renderer.GUniform(program,"u_modelMatrix");
//
gl.viewport(0, 0, 800, 600);
//
var i = 3;
var x =0;
var y=0;
Math.random()
const refresh = function(){
    //i = i+Math.random()*0.01;
    x = x+Math.random()*0.1;
    y = y +Math.random()*0.1;
    camera.position = [x,y,i];
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
}
refresh();



