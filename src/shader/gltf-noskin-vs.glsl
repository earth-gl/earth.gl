precision highp float;

#pragma glslify: targetpos = require('./chunk/gl-targetpos.glsl')

//投影矩阵
uniform mat4 u_projectionMatrix;
//视图矩阵
uniform mat4 u_viewMatrix;
//模型矩阵
uniform mat4 u_modelMatrix;
//法线矩阵
uniform mat4 u_nromalMatrix;

//物体位置
attribute vec3 a_position;
//法线坐标
attribute vec3 a_normal;
//纹理坐标
uniform sampler2D u_texture;

varying vec4 v_color;

varying vec3 v_normal;

void main() { 
    //v_normal = normalize((u_nromalMatrix * vec4(a_normal, 0)).xyz);
    v_color = vec4(a_position,1.0);
    gl_Position = targetpos(u_projectionMatrix, u_viewMatrix, u_modelMatrix) *vec4(a_position, 1.0);
}