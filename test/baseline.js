/**
 * build document environment
 */
const webgl = require("webgl-raub");
const { Document } = require("glfw-raub");
Document.setWebgl(webgl);
const doc = new Document();
global.document = global.window = doc;

/**
 * 
 */