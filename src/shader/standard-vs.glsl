precision highp float;

#pragma glslify: targetpos = require('./chunk/gl-targetpos.glsl')

//投影矩阵
uniform mat4 u_projectionMatrix;
//视图矩阵
uniform mat4 u_viewMatrix;
//模型矩阵
uniform mat4 u_modelMatrix;

//物体位置
attribute vec3 a_position;
//法线坐标
attribute vec3 a_normals;
//纹理坐标
uniform sampler2D u_texture;

varying vec4 v_color;

void main() { 
    v_color = vec4(a_position,1.0);
    gl_Position = targetpos(u_projectionMatrix, u_viewMatrix, u_modelMatrix, a_position);
}