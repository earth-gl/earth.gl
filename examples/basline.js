const { Vec3 } = require("kiwi.matrix"),
    ellipsoid = require("../src/core/Ellipsoid").WGS84,
    Camera = require("./../src/camera/PerspectiveCamera"),
    Quadtree = require("./../src/core/Quadtree"),
    maximumRadius = ellipsoid.maximumRadius;
//default direction Z, the latitude is 90
const camera = new Camera(60, 800, 600, 0.1, maximumRadius);
camera.position = [0, 0, maximumRadius*1.1];
// const geographic = ellipsoid.spaceToGeographic(cameraPosition);
// const outcameraPosition = ellipsoid.geographicToSpace(geographic);
const quadtree = new Quadtree(camera);
const errors = [];
//test space error
// for (var i = 0; i < quadtree._zeroLevelTiles.length; i++) {
//     const tile = quadtree._zeroLevelTiles[i];
//     errors[i] = quadtree._spaceError(tile);
// }
//pick
const tile = quadtree.pickZeroLevelQuadtreeTiles(camera.position);
//





