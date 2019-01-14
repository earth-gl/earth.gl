const  {Vec3} = require("kiwi.matrix"),
    ellipsoid = require("../src/core/Ellipsoid").WGS84,
    maximumRadius = ellipsoid.maximumRadius;

const cameraPosition = new Vec3().set(0,0,maximumRadius);
const geo = ellipsoid.cartesianToCartographic(cameraPosition);