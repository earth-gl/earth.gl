const GGlobal = require('./scene/GGlobal'),
    GSurface = require('./scene/GSurface'),
    G3dTiles = require('./scene/G3dTiles'),
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
            Global: GGlobal,
            Surface: GSurface,
            Tiles3D: G3dTiles
        },
    }
};