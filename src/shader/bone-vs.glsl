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

//skin
//定义joint matrix, 最长matrix
uniform JointMatrix
{
    mat4 matrix[65];
} u_jointMatrix;



in vec4 joint0;
in vec4 weight0;


void main() { 
    v_color = vec4(a_position,1.0);
    mat4 skinMatrix = getBoneMatrix(a_joints[0]) * a_weights[0] +
                    getBoneMatrix(a_joints[1]) * a_weights[1] +
                    getBoneMatrix(a_joints[2]) * a_weights[2] +
                    getBoneMatrix(a_joints[3]) * a_weights[3];
    mat4 modelSkinMatrix = u_modelMatrix * skinMatrix;
    gl_Position = targetpos(u_projectionMatrix, u_viewMatrix, modelSkinMatrix, a_position);
}