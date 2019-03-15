const GGlobal = require('./scene/GGlobal'),
    GSurface = require('./scene/GSurface'),
    G3DTiles = require('./scene/G3DTiles'),
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
            GGlobal: GGlobal,
            GSurface: GSurface,
            G3DTiles: G3DTiles
        },
    }
};