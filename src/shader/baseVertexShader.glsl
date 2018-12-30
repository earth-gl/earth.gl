
#pragma glslify:camera = require('./camera.glsl')

attribute vec3 a_position;

void main(){
    #ifdef EARTH_GL_CAMERA
    //结点计算
    gl_Position = u_projectionMatrix*u_viewMatrix*u_modelMatrix*vec4(a_position,1.0);
    #else
    gl_Position = vec4(a_position,1.0);
    #endif
}