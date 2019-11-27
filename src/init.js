const Global = require('./Global'),
    // GSurface = require('./scene/Surface'),
    //camera
    PerspectiveCamera = require('./camera/PerspectiveCamera');

module.exports = {
    gl: {
        camera: {
            PerspectiveCamera: PerspectiveCamera
        },
        Global: Global,
        scene: {
            // GSurface: GSurface,
        },
    }
};