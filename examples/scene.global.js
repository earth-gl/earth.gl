const { gl, screen, document, requestAnimationFrame } = require("./common");

var pako = require('pako');
const http = require("./../src/utils/http");
const FileReader = require("../src/utils/FileReader");
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlMDMwZjllOS02MmM2LTRjYTAtYjY1Yy02Y2FhMzIxZDFkYWQiLCJpZCI6MjU5LCJhc3NldHMiOnsiMSI6eyJ0eXBlIjoiVEVSUkFJTiIsImV4dGVuc2lvbnMiOlt0cnVlLHRydWUsdHJ1ZV0sInB1bGxBcGFydFRlcnJhaW4iOnRydWV9fSwic3JjIjoiYjBkYzNkMWItODgzNi00MzAxLThiZjktZjQ5ZGNkNjYxODI3IiwiaWF0IjoxNTQ2OTUxODAzLCJleHAiOjE1NDY5NTU0MDN9.aEDmdjrkKwu21wNhkBZ5hxCq-kU75MLFzNd7Szzzlq8";
const url = "https://assets.cesium.com/1/13/12148/5370.terrain";
const header = {
    Accept: "application/vnd.quantized-mesh,application/octet-stream;q=0.9,*/*;q=0.01,*/*"
};
const { fetchArrayBuffer } = require("./../src/utils/resource");
fetchArrayBuffer(url, header, token).then(function (msg) { 
    var s1= msg;
}, function (err) {
    var s2 =err;
 });
//http://assets.agi.com/stk-terrain/world/tiles/1/0/0.terrain
http.get("https://assets.cesium.com/1/13/12148/5370.terrain", null, "terrain", {
    Accept: "application/vnd.quantized-mesh,application/octet-stream;q=0.9,*/*;q=0.01,*/*;" + "access_token=" + token
}).then(function (msg) {
    var s1 = pako.deflateRaw(msg);
    var s = pako.ungzip(msg);
    var buffer = new Uint16Array(msg, 0, 65 * 65);
}, function (err) {
    var s1 = err;
});

/**
 * --------------------------------------------------------------------------
 */
const GScene = require("../src/renderer/GScene");

const scene = new GScene({
    gl: gl,
    canvas: document,
    width: document.clientWidth,
    height: document.clientHeight
});

const update = function () {
    scene.render();
    //}{ node debug
    requestAnimationFrame(update);
    screen.draw();
};

update();

