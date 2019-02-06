precision highp float;

//纹理
uniform sampler2D u_texture;

varying vec2 v_texcoord;

void main() { 
    gl_FragColor = texture2D(u_texture, v_texcoord);
    // gl_FragColor = vec4(0.5, 0.5, 0.7, 0.9);
}