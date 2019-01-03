const fragText = earth.gl.shader.glsl_earth_gl_standard_fs;
const vertText = earth.gl.shader.glsl_earth_gl_standard_vs;

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
const refresh = function(){
    gl.viewport(0, 0, 800, 600);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(refresh);
}
refresh();



