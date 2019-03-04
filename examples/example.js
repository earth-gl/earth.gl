const GScene = earth.gl.renderer.GScene,
    GLoader = earth.gl.GLoader;

const canvas = document.getElementById('mapCanvas');

const scene = new GScene({
    canvas: canvas,
    width: 800,
    height: 600
});

// const RiggedSimple = new GLoader(
//     'http://localhost:5500/examples/GLTFS/RiggedSimple/',
//     'RiggedSimple.gltf',
//     {
//         lng: 114.01,
//         lat: 30.58,
//         h: 0,
//         scale: 500000.0
//     }
// );

// scene.add(RiggedSimple);

// const CesiumMan = new GLoader(
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

const Monster = new GLoader(
    'http://localhost:5500/examples/GLTFS/Monster/',
    'Monster.gltf',
    {
        lng: 114.01,
        lat: 30.58,
        h: 0,
        scale: 10000.0
    }
);

scene.add(Monster);

const BoxAnimated = new GLoader(
    'http://localhost:5500/examples/GLTFS/BoxAnimated/',
    'BoxAnimated.gltf',
    {
        lng: 114.01,
        lat: 30.58,
        h: 0,
        scale: 100000.0,
        vertical: true,
    }
);

scene.add(BoxAnimated);

// const ElmTree = new GLoader(
//     'http://localhost:5500/examples/GLTFS/ElmTree/',
//     'ElmTree.gltf',
//     {
//         lng: 114.01,
//         lat: 30.58,
//         h: 0,
//         scale: 100000.0,
//         vertical: true,
//     }
// );

// scene.add(ElmTree);

// const ATrangle = new GLoader(
//     'http://localhost:5500/examples/GLTFS/ATrangle/',
//     'AnimatedTriangle.gltf',
//     {
//         lng: 114.01,
//         lat: 30.58,
//         h: 0,
//         scale: 2000000.0,
//         vertical: true,
//     }
// );

// scene.add(ATrangle);

const update = function () {
    scene.render();
    requestAnimationFrame(update);
};

update();