const GScene = earth.gl.renderer.GScene;

const canvas = document.getElementById('mapCanvas');

const scene = new GScene({
    canvas: canvas,
    width: 800,
    height: 600
});

const update = function () {
    scene.render();
    requestAnimationFrame(update);
};

update();