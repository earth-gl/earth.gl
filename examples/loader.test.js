const { gl, screen, document, requestAnimationFrame } = require("./common");

const fetch = require("./../src/utils/fetch");
const root = "http://139.129.7.130/models/DamagedHelmet/glTF/";
const GLTFLoader = require("./../src/loader/GLTFLoader");

const request = function (url, cb) {
    const image = new Image();
    image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, image.width, image.height);
        //}{ use image-raub for testing, the ctx._data typedArray, and type is Uint8Array
        cb(null, ctx._data);
    };
    image.onerror = function (err) {
        cb(err);
    };
    image.src = url;
};

fetch(root + "DamagedHelmet.gltf", {
    responseType: "json"
}).then(response => {
    return response.json();
}).then(json => {
    const loader = new GLTFLoader(root, json, {requestImage : request});
    loader.load().then(gltf => {
        const name = gltf.scenes[gltf.scene].name;
        const nodes = gltf.scenes[gltf.scene].nodes;
        const mesh = nodes[0].meshes[0][0];
        const material = mesh.material;
    });
});