const node3d = require("3d-core-raub");
const { Screen, Image } = node3d;
//map global object
global.document = global.window = node3d.doc;
global.Image = Image;
const requestAnimationFrame = window.requestAnimationFrame;
/**
 * @type {WebGLRenderingContext}
 */
const gl = node3d.gl;
const screen = new Screen();

module.exports = {
    gl,
    screen,
    document,
    requestAnimationFrame,
    Image
};
