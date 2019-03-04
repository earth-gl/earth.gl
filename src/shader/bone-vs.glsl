precision mediump float;

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
//传递颜色
varying vec4 v_color;
//传递法线坐标
varying vec3 v_normal;

//joint matrix
uniform mat4 u_jointMatrix[2];
//jonits
attribute vec4 a_joints_0;
//weights
attribute vec4 a_weights_0;

void main() { 
    v_color = vec4(a_position,1.0);
    mat4 skinMatrix = 
        a_weights_0.x * u_jointMatrix[int(a_joints_0.x)] +
        a_weights_0.y * u_jointMatrix[int(a_joints_0.y)] +
        a_weights_0.z * u_jointMatrix[int(a_joints_0.z)] +
        a_weights_0.w * u_jointMatrix[int(a_joints_0.w)];
    mat4 modelSkinMatrix = u_modelMatrix * skinMatrix;
    gl_Position = targetpos(u_projectionMatrix, u_viewMatrix, modelSkinMatrix, a_position);
}