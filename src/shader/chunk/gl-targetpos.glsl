/**
 *  将目标物体投影到屏幕坐标
 */

vec4 targetpos(mat4 u_projectionMatrix, mat4 u_viewMatrix, mat4 u_modelMatrix , vec3 a_position){
    return u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(a_position, 1.0);
}

#pragma glslify: export(targetpos)