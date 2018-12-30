#float_definitions
float applyMaterial(float ID) {
    #float_applications
    return 1.;
}

#vec3_definitions
vec3 applyMaterial(vec3 ID) {
    #vec3_applications
    return vec3(0);
}

#vec4_definitions
vec4 applyMaterial(vec4 ID) {
    #vec4_applications

    return vec4(0);
}

#pragma glslify: export(material)