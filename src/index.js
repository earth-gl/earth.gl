const 
    //Earth Object
    Global = require('./Global'),
    //TMS Surface
    ImagerySurface = require('./scene/ImagerySurface'),
    //Cameras
    PerspectiveCamera = require('./camera/PerspectiveCamera');

module.exports = {
    gl: {
        Global,
        PerspectiveCamera,
        ImagerySurface
    }
};