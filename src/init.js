const GProgram = require('./renderer/GProgram'),
    GBuffer = require('./renderer/GBuffer'),
    GUniform = require('./renderer/GUniform'),
    GScene = require('./renderer/GScene'),
    GLoader = require('./renderer/GLoader'),
    PerspectiveCamera = require('./camera/PerspectiveCamera');

module.exports = {
    gl: {
        camera: {
            PerspectiveCamera: PerspectiveCamera,
        },
        GLoader:GLoader,
        renderer: {
            GScene: GScene,
            GProgram: GProgram,
            GBuffer: GBuffer,
            GUniform: GUniform
        },
    }
};