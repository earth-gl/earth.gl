#pragma glslify: applyMaterial = require(./chunks/material)
#pragma glslify: applyLight = require(./chunks/light)

/**
 * reference:
 * https://github.com/Famous/engine/blob/master/webgl-shaders/FragmentShader.glsl
 * Writes the color of the pixel onto the screen
 * @method main
 * @private
 */
void main() {
    //setting material
    vec4 material = u_baseColor.r >= 0.0 ? u_baseColor : applyMaterial(u_baseColor);
    //Apply lights only if flat shading is false,and at least one light is added to the scene
    bool lightsEnabled = (u_flatShading == 0.0) && (u_numLights > 0.0 || length(u_ambientLight) > 0.0);
    vec3 normal = normalize(v_normal);
    vec4 glossiness = u_glossiness.x < 0.0 ? applyMaterial(u_glossiness) : u_glossiness;
    //calcute color (rasterization)
    vec4 color = lightsEnabled ?applyLight(material, normalize(v_normal), glossiness, int(u_numLights), u_ambientLight * u_baseColor.rgb, normalize(v_eyeVector), u_lightPosition,u_lightColor,v_position): material;
    gl_FragColor = color;
    gl_FragColor.a *= u_opacity;   
}