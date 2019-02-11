const GScene = earth.gl.renderer.GScene,
    GLoader = earth.gl.GLoader;
    
const canvas = document.getElementById('mapCanvas');

const scene = new GScene({
    canvas: canvas,
    width: 1000,
    height: 625
});

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

const Monster = new GLoader(
    'http://localhost:5500/examples/Monster/',
    'Monster.gltf',
    {
        lng: 114.33,
        lat: 30.58
    }
);

scene.add(Monster);

// const BoxAnimated = new GLoader(
//     'http://localhost:5500/examples/BoxAnimated/',
//     'BoxAnimated.gltf',
//     {
//         lng: 114.33,
//         lat: 30.58
//     }
// );

// scene.add(BoxAnimated);

const update = function () {
    scene.render();
    requestAnimationFrame(update);
};

update();