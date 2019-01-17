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
    //}{ node debug
    scene.render();
    requestAnimationFrame(update);
    screen.draw();
};

update();

