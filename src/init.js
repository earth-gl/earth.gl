const Global = require('./scene/Global'),
    Surface = require('./scene/Surface'),
    Tiles3D = require('./scene/Tiles3D'),
    //loader
    GLTFLoader = require('./loader/GLTFLoader'),
    B3DMLoader = require('./loader/B3DMLoader'),
    //camera
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
            Surface: Surface,
            Tiles3D: Tiles3D
        },
    }
};