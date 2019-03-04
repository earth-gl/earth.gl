const Global = earth.gl.scene.Global,
    Surface = earth.gl.scene.Surface,
    GLTFLoader = earth.gl.Loader.GLTFLoader;

const canvas = document.getElementById('mapCanvas');

const width = window.innerWidth-20;
const height = window.innerHeight-20;

canvas.style.width = `${width}px`;
canvas.style.height = `${height}px`;


const scene = new Global({
    canvas: canvas,
    width: width,
    height: height
});

const surface = new Surface();

scene.add(surface);

const RiggedSimple = new GLTFLoader(
    'http://localhost:5500/examples/GLTFS/RiggedSimple/',
    'RiggedSimple.gltf',
    {
        lng: 115.01,
        lat: 30.58,
        h: 0,
        scale: 50000.0
    }
);

scene.add(RiggedSimple);

const CesiumMan = new GLTFLoader(
    'http://localhost:5500/examples/GLTFS/CesiumMan/',
    'CesiumMan.gltf',
    {
        lng: 114.01,
        lat: 30.58,
        h: 0,
        scale: 500000.0
    }
);

scene.add(CesiumMan);

const Monster = new GLTFLoader(
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

const BoxAnimated = new GLTFLoader(
    'http://localhost:5500/examples/GLTFS/BoxAnimated/',
    'BoxAnimated.gltf',
    {
        lng: 114.01,
        lat: 37.58,
        h: 0.0,
        scale: 100000.0
    }
);

scene.add(BoxAnimated);

const ElmTree = new GLTFLoader(
    'http://localhost:5500/examples/GLTFS/ElmTree/',
    'ElmTree.gltf',
    {
        lng: 114.01,
        lat: 30.58,
        h: 0,
        scale: 10000.0
    }
);

scene.add(ElmTree);

const update = function () {
    scene.render();
    requestAnimationFrame(update);
};

update();