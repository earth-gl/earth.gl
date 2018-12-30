/**
 * 
 */

#define EARTH_GL_CAMERA

//投影矩阵
uniform mat4 u_projectionMatrix;
//视角矩阵
uniform mat4 u_viewMatrix;
//模型矩阵
uniform mat4 u_modelMatrix;

#endif

#pragma glslify: export(camera)