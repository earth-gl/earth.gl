const Global = require('./scene/Global'),
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
        renderer: {
            Global: Global
        },
    }
};