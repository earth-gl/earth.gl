precision highp float;

#pragma glslify: targetpos = require('./chunk/gl-targetpos.glsl')

//投影矩阵
uniform mat4 u_projectionMatrix;
//视图矩阵
uniform mat4 u_viewMatrix;
//模型矩阵
uniform mat4 u_modelMatrix;

//物体顶点坐标
attribute vec3 a_position;
//纹理坐标
attribute vec2 a_texcoord;

//传递给fs的纹理坐标
varying vec2 v_texcoord;

void main() { 
    gl_Position = targetpos(u_projectionMatrix, u_viewMatrix, u_modelMatrix) *vec4(a_position, 1.0);
    v_texcoord = a_texcoord;
}