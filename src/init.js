const Global = require('./Global'),
    GlobalSurface = require('./scene/GlobalSurface'),
    //camera
    PerspectiveCamera = require('./camera/PerspectiveCamera');

module.exports = {
    gl: {
        Global: Global,
        camera: {
            PerspectiveCamera
        },
        scene: {
            GlobalSurface
        },
    }
};