precision highp float;

//纹理
uniform sampler2D u_texture;

varying vec2 v_texcoord;

void main() { 
    gl_FragColor = texture2D(u_texture, v_texcoord);
}