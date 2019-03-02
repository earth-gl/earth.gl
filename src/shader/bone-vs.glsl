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

varying vec4 v_color;

varying vec3 v_normal;

#define ROW0_U ((0.5 + 0.0) / 4.)
#define ROW1_U ((0.5 + 1.0) / 4.)
#define ROW2_U ((0.5 + 2.0) / 4.)
#define ROW3_U ((0.5 + 3.0) / 4.)

//skin 权重
attribute vec4 a_weights;
//连接结点
attribute vec4 a_joints;
//texture
uniform sampler2D u_jointTexture;
//总连接点数目
uniform float u_numJoints;

mat4 getBoneMatrix(float jointNdx) {
  float v = (jointNdx + 0.5) / u_numJoints;
  return mat4(
    texture2D(u_jointTexture, vec2(ROW0_U, v)),
    texture2D(u_jointTexture, vec2(ROW1_U, v)),
    texture2D(u_jointTexture, vec2(ROW2_U, v)),
    texture2D(u_jointTexture, vec2(ROW3_U, v)));
}

void main() { 
    v_color = vec4(a_position,1.0);
    mat4 skinMatrix = getBoneMatrix(a_joints[0]) * a_weights[0] +
                    getBoneMatrix(a_joints[1]) * a_weights[1] +
                    getBoneMatrix(a_joints[2]) * a_weights[2] +
                    getBoneMatrix(a_joints[3]) * a_weights[3];
    mat4 modelSkinMatrix = u_modelMatrix * skinMatrix;
    gl_Position = targetpos(u_projectionMatrix, u_viewMatrix, modelSkinMatrix, a_position);
}