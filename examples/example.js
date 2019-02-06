const GScene = earth.gl.renderer.GScene,
    GLoader = earth.gl.GLoader;

const canvas = document.getElementById('mapCanvas');

const scene = new GScene({
    canvas: canvas,
    width: 800,
    height: 600
});

// const gltf = new GLoader(
//     'http://139.129.7.130/models/DamagedHelmet/glTF/',
//     'DamagedHelmet.gltf',
//     {
//         lng: 114.1111,
//         lat: 33.1111
//     });

// scene.add(gltf);

const update = function () {
    scene.render();
    requestAnimationFrame(update);
};

update();