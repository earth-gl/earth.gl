const Global = require('./scene/Global'),
    Surface = require('./scene/Surface'),
    GLTFLoader = require('./loader/GLTFLoader'),
    PerspectiveCamera = require('./camera/PerspectiveCamera');

module.exports = {
    gl: {
        camera: {
            PerspectiveCamera: PerspectiveCamera
        },
        Loader:{
            GLTFLoader: GLTFLoader
        },
        scene: {
            Global: Global,
            Surface:Surface
        },
    }
};