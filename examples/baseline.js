
    // { Vec3 } = require("kiwi.matrix"),
    // ellipsoid = require("../src/core/Ellipsoid").WGS84,
    // Camera = require("../src/camera/PerspectiveCamera"),
    // Quadtree = require("../src/core/Quadtree"),
    // maximumRadius = ellipsoid.maximumRadius;
    const fetch = require('node-fetch');
    //const url = "http://127.0.0.1:8002/tilesets/cut_n00e090_wgs84_tiles/0/0/0.terrain?v=1.0.0";
    const url = "https://assets.cesium.com/1/2/5/1.terrain?v=1.1.0"
    fetch(url,{
        method:"GET",
        headers:{
            'Accept': 'application/vnd.quantized-mesh,application/octet-stream;q=0.9,*/*;q=0.01,*/*;access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlNWVjMmIxNS1kMmY2LTQ5ZTctODVlYS1iNzRhOGNlZTE3YjUiLCJpZCI6MjU5LCJhc3NldHMiOnsiMSI6eyJ0eXBlIjoiVEVSUkFJTiIsImV4dGVuc2lvbnMiOlt0cnVlLHRydWUsdHJ1ZV0sInB1bGxBcGFydFRlcnJhaW4iOnRydWV9fSwic3JjIjoiYjBkYzNkMWItODgzNi00MzAxLThiZjktZjQ5ZGNkNjYxODI3IiwiaWF0IjoxNTQ3NzExMDYxLCJleHAiOjE1NDc3MTQ2NjF9.KSNNqyUjxOTnxvt-Z9ewNNnQM9Q0kxxjnXlUn_5YqVo',
        },
        responseType:"arraybuffer",
    }).then(function(res){
        return res.arrayBuffer();
    }).then(function(buffer){
        const s = buffer;
    });

// fetch("http://192.168.50.219:8002/tilesets/cut_n00e090_wgs84_tiles/12/6143/2047.terrain")
//     .then(response => response.body)
//     .then(body => {
//         const reader = body.getReader();
//         return new ReadableStream({
//             start(controller) {
//                 return pump();
//                 function pump() {
//                     return reader.read().then(({
//                         done,
//                         value
//                     }) => {
//                         // When no more data needs to be consumed, close the stream
//                         if (done) {
//                             controller.close();
//                             return;
//                         }

//                         // Enqueue the next data chunk into our target stream
//                         controller.enqueue(value);
//                         return pump();
//                     });
//                 }
//             }
//         })
//     })
//     .then(stream => new Response(stream))
//     .then(response => response.arrayBuffer())
//     .then(arrayBuffer => console.log(arrayBuffer))
//     .catch(err => console.error(err));
//default direction Z, the latitude is 90
// const camera = new Camera(60, 800, 600, 0.1, maximumRadius);
// camera.position = [0, 0, maximumRadius * 2];
// const geographic = ellipsoid.spaceToGeographic(cameraPosition);
// const outcameraPosition = ellipsoid.geographicToSpace(geographic);
// const quadtree = new Quadtree(camera);
// const errors = [];
//test space error
// for (var i = 0; i < quadtree._zeroLevelTiles.length; i++) {
//     const tile = quadtree._zeroLevelTiles[i];
//     errors[i] = quadtree._spaceError(tile);
// }
//pick
// const tiles = quadtree.pickZeroLevelQuadtreeTiles(camera.position);
// //
// const waitRenderingQuadtreeTile = [];
// //
// const liter = function (quadtreeTile) {
//     const error = quadtree._spaceError(quadtreeTile);
//     if (error > 2)
//         for (var i = 0; i < 4; i++)
//             liter(quadtreeTile.children[i])
//     else
//         waitRenderingQuadtreeTile.push(quadtreeTile);
// }
// //
// for (var i = 0, len = tiles.length; i < len; i++) {
//     const tile = tiles[i];
//     liter(tile);
// }
// //for
// var s = "";





