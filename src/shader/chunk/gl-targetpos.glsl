/**
 *  将目标物体投影到屏幕坐标
 */

mat4 targetpos(mat4 u_projectionMatrix, mat4 u_viewMatrix, mat4 u_modelMatrix){
    return u_projectionMatrix * u_viewMatrix * u_modelMatrix;
}

#pragma glslify: export(targetpos)