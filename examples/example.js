const GScene = earth.gl.renderer.GScene,
    GLoader = earth.gl.GLoader;

const canvas = document.getElementById('mapCanvas');

const scene = new GScene({
    canvas: canvas,
    width: 800,
    height: 600
});

// const tree = new GLoader(
//     'http://localhost:5500/examples/Tree/',
//     'tree.gltf',
//     {
//         lng: 114.01,
//         lat: 30.58,
//         h: 0,
//         scale: 10000.0
//     });

// scene.add(tree);

// const datePalmTree = new GLoader(
//     'http://localhost:5500/examples/DatePalmTree/',
//     'DatePalmTree.gltf',
//     {
//         lng: 179.13,
//         lat: 30.58
//     }
// );

// scene.add(datePalmTree);

// const ElmTree = new GLoader(
//     'http://localhost:5500/examples/ElmTree/',
//     'ElmTree.gltf',
//     {
//         lng: 114.53,
//         lat: 30.58
//     }
// );

// scene.add(ElmTree);

// const AnimatedMorphCube = new GLoader(
//     'http://localhost:5500/examples/GLTFS/AnimatedMorphCube/',
//     'AnimatedMorphCube.gltf',
//     {
//         lng: 114.01,
//         lat: 30.58,
//         h: 0,
//         scale: 1000000.0
//     }
// );

// scene.add(AnimatedMorphCube);

const RiggedSimple = new GLoader(
    'http://localhost:5500/examples/GLTFS/RiggedSimple/',
    'RiggedSimple.gltf',
    {
        lng: 114.01,
        lat: 30.58,
        h: 0,
        scale: 10000.0
    }
);

scene.add(RiggedSimple);

// const InterpolationTest = new GLoader(
//     'http://localhost:5500/examples/GLTFS/InterpolationTest/',
//     'InterpolationTest.gltf',
//     {
//         lng: 114.01,
//         lat: 30.58,
//         h: 0,
//         scale: 1000000.0
//     }
// );

// scene.add(InterpolationTest);

// const Monster = new GLoader(
//     'http://localhost:5500/examples/Monster/',
//     'Monster.gltf',
//     {
//         lng: 114.01,
//         lat: 30.58,
//         h: 0,
//         scale: 100000.0
//     }
// );

// scene.add(Monster);

// const BoxAnimated = new GLoader(
//     'http://localhost:5500/examples/BoxAnimated/',
//     'BoxAnimated.gltf',
//     {
//         lng: 114.012,
//         lat: 33.58,
//         h: 0,
//         scale: 1000000.0
//     }
// );

// scene.add(BoxAnimated);

// const ATrangle = new GLoader(
//     'http://localhost:5500/examples/ATrangle/',
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

// const castle = new GLoader(
//     'http://localhost:5500/examples/Castle/',
//     'model.gltf',
//     {
//         lng: 114.01,
//         lat: 30.58,
//         h: 0,
//         scale: 1000000.0
//     }
// );

// scene.add(castle);

const update = function () {
    scene.render();
    requestAnimationFrame(update);
};

update();