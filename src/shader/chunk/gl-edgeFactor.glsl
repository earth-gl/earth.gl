/**
 *  将目标物体投影到屏幕坐标
 */

float edgeFactor(vec2 vBC){
    vec3 bary = vec3(vBC.x, vBC.y, 1.0 - vBC.x - vBC.y);
    vec3 d = fwidth(bary);
    vec3 a3 = smoothstep(d * (1.0 - 0.5), d * (1.0 + 0.5), bary);
    return min(min(a3.x, a3.y), a3.z);
}

#pragma glslify: export(edgeFactor)