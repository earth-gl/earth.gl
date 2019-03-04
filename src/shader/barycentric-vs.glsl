precision highp float;

#pragma glslify: targetpos = require('./chunk/gl-targetpos.glsl')

uniform mat4 u_projectionMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_modelMatrix;

//物体位置
attribute vec3 a_position;
//顶点初始重心
attribute vec2 a_barycentric;

//传出重心
varying vec2 v_barycentric;

void main() { 
    v_barycentric = a_barycentric;
    gl_Position = targetpos(u_projectionMatrix, u_viewMatrix, u_modelMatrix) *vec4(a_position, 1.0);
}