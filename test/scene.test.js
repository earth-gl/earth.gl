const { gl, screen, document, requestAnimationFrame } = require("./common");
/**
 * --------------------------------------------------------------------------
 */
const GScene = require("./../src/renderer/GScene");

const scene = new GScene({
    gl: gl,
    width: document.clientWidth,
    height: document.clientHeight
});

const update = function () {
    scene.render();
    //}{ node debug
    requestAnimationFrame(update);
    screen.draw();
};

update();

