const Global = require('./scene/Global'),
    Surface = require('./scene/Surface'),
    GLTFLoader = require('./loader/GLTFLoader'),
    B3DMLoader = require('./loader/B3DMLoader'),
    PerspectiveCamera = require('./camera/PerspectiveCamera');

module.exports = {
    gl: {
        camera: {
            PerspectiveCamera: PerspectiveCamera
        },
        Loader: {
            GLTFLoader: GLTFLoader,
            B3DMLoader: B3DMLoader
        },
        scene: {
            Global: Global,
            Surface: Surface
        },
    }
};