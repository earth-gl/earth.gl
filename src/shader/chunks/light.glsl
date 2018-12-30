/**
 * reference:
 * https://github.com/Famous/engine/blob/master/webgl-shaders/chunks/applyLight.glsl
 * Calculates the intensity of light on a surface.
 * @method applyLight
 * @private
 */
vec4 applyLight(in vec4 baseColor, in vec3 normal, in vec4 glossiness, int numLights, vec3 ambientColor, vec3 eyeVector, mat4 lightPosition, mat4 lightColor, vec3 v_position) {
    vec3 diffuse = vec3(0.0);
    bool hasGlossiness = glossiness.a > 0.0;
    bool hasSpecularColor = length(glossiness.rgb) > 0.0;

    for(int i = 0; i < 4; i++) {
        if (i >= numLights) break;
        vec3 lightDirection = normalize(lightPosition[i].xyz - v_position);
        float lambertian = max(dot(lightDirection, normal), 0.0);

        if (lambertian > 0.0) {
            diffuse += lightColor[i].rgb * baseColor.rgb * lambertian;
            if (hasGlossiness) {
                vec3 halfVector = normalize(lightDirection + eyeVector);
                float specularWeight = pow(max(dot(halfVector, normal), 0.0), glossiness.a);
                vec3 specularColor = hasSpecularColor ? glossiness.rgb : lightColor[i].rgb;
                diffuse += specularColor * specularWeight * lambertian;
            }
        }

    }

    return vec4(ambientColor + diffuse, baseColor.a);
}

#pragma glslify: export(light)