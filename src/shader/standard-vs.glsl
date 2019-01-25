precision highp float;

//物体位置
attribute vec3 a_position;

varying vec4 v_color;

void main() { 
    v_color = vec4(normalize(a_position),1.0);
    gl_Position = v_color;
}