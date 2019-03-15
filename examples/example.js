/* eslint-disable */
const GGlobal = earth.gl.scene.GGlobal,
    GSurface = earth.gl.scene.GSurface,
    G3DTiles = earth.gl.scene.G3DTiles,
    B3DMLoader = earth.gl.Loader.B3DMLoader,
    GLTFLoader = earth.gl.Loader.GLTFLoader;

//set doom
const canvas = document.getElementById('mapCanvas');
const width = window.innerWidth - 20;
const height = window.innerHeight - 20;
canvas.style.width = `${width}px`;
canvas.style.height = `${height}px`;

//create global
const scene = new GGlobal({
    canvas: canvas,
    width: width,
    height: height
});

//create surface
const surface = new GSurface();

scene.add(surface);

const tiles3d = new G3DTiles({
    rootPath:'http://localhost:5500/examples/B3DM/Scene/',
    name:'Cesium__3d.json'
});

scene.add(tiles3d);

//create b3dm
// const b3dm = new B3DMLoader('http://localhost:5500/examples/B3DM/Scene/Data/Tile_m003_m028/Tile_m003_m028_L14_0.b3dm', {
//     lng: 115.01,
//     lat: 33.58,
//     h: 0,
//     vertical:true,
//     scale: 4000.0
// });

// //
// scene.add(b3dm);

// const RiggedSimple = new GLTFLoader(
//     'http://localhost:5500/examples/GLTFS/RiggedSimple/',
//     'RiggedSimple.gltf',
//     {
//         lng: 115.01,
//         lat: 30.58,
//         h: 0,
//         scale: 50000.0
//     }
// );

// scene.add(RiggedSimple);

// const CesiumMan = new GLTFLoader(
//     'http://localhost:5500/examples/GLTFS/CesiumMan/',
//     'CesiumMan.gltf',
//     {
//         lng: 114.01,
//         lat: 30.58,
//         h: 0,
//         scale: 500000.0
//     }
// );

// scene.add(CesiumMan);

// const Monster = new GLTFLoader(
//     'http://localhost:5500/examples/GLTFS/Monster/',
//     'Monster.gltf',
//     {
//         lng: 113.780569,
//         lat: 22.77368856,
//         h: 0,
//         scale: 100.0
//     }
// );

// scene.add(Monster);

// const BoxAnimated = new GLTFLoader(
//     'http://localhost:5500/examples/GLTFS/BoxAnimated/',
//     'BoxAnimated.gltf',
//     {
//         lng: 113.780569,
//         lat: 22.77368856,
//         h: 0.0,
//         scale: 1000.0
//     }
// );

// scene.add(BoxAnimated);

// const ElmTree = new GLTFLoader(
//     'http://localhost:5500/examples/GLTFS/BoneTree/',
//     'bone.gltf',
//     {
//         lng: 113.980569,
//         lat: 22.77368856,
//         h: 0,
//         scale: 10000.0
//     }
// );

// scene.add(ElmTree);

const update = function () {
    scene.render();
    requestAnimationFrame(update);
};

update();