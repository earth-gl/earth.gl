/**
 * 符合STM Terrain规范的高程数据加载
 * https://github.com/AnalyticalGraphicsInc/quantized-mesh
 * @class
 */
class TerrainTile{

    constructor(){

    }

}

module.exports = TerrainTile;

// const token ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3NDBiNjk2Zi1lNDljLTRjZTQtYjg2Ny0yMTAzMjdmNDE3MWQiLCJpZCI6NjYwMSwiYXNzZXRzIjp7IjEiOnsidHlwZSI6IlRFUlJBSU4iLCJleHRlbnNpb25zIjpbdHJ1ZSx0cnVlLHRydWVdLCJwdWxsQXBhcnRUZXJyYWluIjp0cnVlfX0sInNyYyI6IjZjYjk4MzM2LTJiYzEtNDVhZC04MWU0LWVmMjc4YTI0MGY1OSIsImlhdCI6MTU0NzAxODUxMywiZXhwIjoxNTQ3MDIyMTEzfQ.Vu6WIIziod4RvBGGKp_oBCbX4jND3KTr_ECW5W71yEQ';
// const url = "https://assets.cesium.com/1/9/789/370.terrain";
// //url格式：https://assets.cesium.com/{assertId}/{z}/{x}/{y}.terrain
// const header = {
//     Accept: "application/vnd.quantized-mesh,application/octet-stream;q=0.9,*/*;q=0.01,*/*"
// };
// const { fetchArrayBuffer } = require("./../src/utils/resource");
// fetchArrayBuffer(url, header, token).then(function (msg) {
//     var buffer = new ArrayBuffer(msg.length);
//     var view = new Uint8Array(buffer);
//     for (var i = 0; i < msg.length; i++) {
//         view[i] = msg.charCodeAt(i);
//     }
//     return buffer;
// }, function (err) {
//     console.log(err);
// });