const  {Vec3} = require("kiwi.matrix"),
    ellipsoid = require("../src/core/Ellipsoid").WGS84,
    maximumRadius = ellipsoid.maximumRadius;
//default direction Z, the latitude is 90
const cameraPosition = new Vec3().set(0,0,maximumRadius);
const geographic = ellipsoid.spaceToGeographic(cameraPosition);
const outcameraPosition = ellipsoid.geographicToSpace(geographic);


