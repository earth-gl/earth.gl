const PerspectiveCamera = require('./../src/camera/PerspectiveCamera');

var camera = new PerspectiveCamera(50,800/600,0.1,2000);
var s1 =camera.ProjectionMatrix;
var s2 = camera.ViewMatrix;
var s3 = camera.ViewProjectionMatrix;