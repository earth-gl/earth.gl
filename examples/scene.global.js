const { gl, screen, document, requestAnimationFrame } = require("./common");
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
    const position = scene._camera.position;
    scene._camera.position = [position.x,position.y,position.z-100]
    //}{ node debug
    requestAnimationFrame(update);
    screen.draw();
};

update();

