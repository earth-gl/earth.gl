/* eslint-disable */
const Global = earth.gl.scene.Global,
    Surface = earth.gl.scene.Surface,
    Tiles3D = earth.gl.scene.Tiles3D,
    B3DMLoader = earth.gl.Loader.B3DMLoader,
    GLTFLoader = earth.gl.Loader.GLTFLoader;
//set doom
const canvas = document.getElementById('mapCanvas');
const width = window.innerWidth - 20;
const height = window.innerHeight - 20;
canvas.style.width = `${width}px`;
canvas.style.height = `${height}px`;

//create global
const scene = new Global({
    canvas: canvas,
    width: width,
    height: height
});

//create surface
const surface = new Surface();

scene.add(surface);


// const tiles3d = new Tiles3D({
//     url: 'http://localhost:5500/examples/B3DM/Scene/Cesium__3d.json'
// });

// scene.add(tiles3d);

// //create b3dm
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
//         lng: 114.01,
//         lat: 30.58,
//         h: 0,
//         scale: 10000.0
//     }
// );

// scene.add(Monster);

// const BoxAnimated = new GLTFLoader(
//     'http://localhost:5500/examples/GLTFS/BoxAnimated/',
//     'BoxAnimated.gltf',
//     {
//         lng: 114.01,
//         lat: 37.58,
//         h: 0.0,
//         scale: 100000.0
//     }
// );

// scene.add(BoxAnimated);

const ElmTree = new GLTFLoader(
    'http://localhost:5500/examples/GLTFS/BoneTree/',
    'bone.gltf',
    {
        lng: 114.01,
        lat: 30.58,
        h: 0,
        scale: 10000000.0
    }
);

scene.add(ElmTree);

const update = function () {
    scene.render();
    requestAnimationFrame(update);
};

update();