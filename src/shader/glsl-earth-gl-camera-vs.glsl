#pragma glslify: targetpos = require('./chunk/glsl-earth-gl-targetpos.glsl')

uniform mat4 u_projectionMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_modelMatrix;

attribute vec3 a_position;

void main() { gl_Position = targetpos(u_projectionMatrix, u_viewMatrix, u_modelMatrix, a_position); }