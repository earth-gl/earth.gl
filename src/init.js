const glsl_earth_gl_camera_fs = require("./shader/glsl-earth-gl-camera-fs.glsl");
const glsl_earth_gl_camera_vs = require("./shader/glsl-earth-gl-camera-vs.glsl");
/**
 * 
 */
const GProgram = require('./renderer/GProgram');
const GBuffer = require('./renderer/GBuffer');
const GUniform = require('./renderer/GUniform');
const PerspectiveCamera = require('./camera/PerspectiveCamera');

module.exports = {
    gl:{
        camera:{
            PerspectiveCamera:PerspectiveCamera,
        },
        renderer:{
            GProgram:GProgram,
            GBuffer:GBuffer,
            GUniform:GUniform
        },
        shader:{
            glsl_earth_gl_camera_fs:glsl_earth_gl_camera_fs,
            glsl_earth_gl_camera_vs:glsl_earth_gl_camera_vs
        }
    }
};