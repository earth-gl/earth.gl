const Global = require('./Global'),
    ImagerySurface = require('./scene/ImagerySurface'),
    //camera
    PerspectiveCamera = require('./camera/PerspectiveCamera');

module.exports = {
    gl: {
        Global: Global,
        camera: {
            PerspectiveCamera
        },
        scene: {
            ImagerySurface
        },
    }
};