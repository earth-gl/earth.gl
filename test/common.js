const node3d = require('3d-core-raub');
// const gl = require('webgl-raub');
const { Screen, Image , doc } = node3d;
// Document.setWebgl(gl);

//map global object
global.document = global.window = doc;
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
