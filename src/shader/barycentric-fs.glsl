#extension GL_OES_standard_derivatives : enable
precision highp float;

#pragma glslify: edgeFactor = require('./chunk/gl-edgeFactor.glsl')

//传出重心
varying vec2 v_barycentric;

//结点坐标
varying vec3 v_position;

void main() { 
    float g = edgeFactor(v_barycentric);
    //gl_FragColor = vec4(mix(vec3(0), vec3(0.8), g), 1.0);
    gl_FragColor = vec4(vec3(edgeFactor(v_barycentric)), 1);
}