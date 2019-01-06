const glslify = require("glslify");
const node3d = require("3d-core-raub");
global.document = global.window = node3d.doc;
const requestAnimationFrame = window.requestAnimationFrame;
const { Screen } = node3d;
/**
 * @type {WebGLRenderingContext}
 */
const gl = node3d.gl;
const screen = new Screen();

module.exports = {
    gl,
    screen,
    document,
    requestAnimationFrame
};
