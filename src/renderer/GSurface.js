
const PI_OVER_TWO = Math.PI / 2,
    glslify = require("glslify"),
    isNode = require("./../utils/isNode"),
    QuadtreeTile = require("./../core/QuadtreeTile"),
    ellipsoid_wgs84 = require("./../core/Ellipsoid").WGS84,
    equal14 = require("./../utils/revise").equal14,
    BoundingSphere = require("./../core/BoundingSphere"),
    maximumRadius = require("./../core/Ellipsoid").WGS84.maximumRadius,
    { createTypedArrayFromArrayBuffer, getStringFromTypedArray } = require("./../utils/typedArray"),
    { Vec3, Mat4, Vec2} = require("kiwi.matrix"),
    decode = require("./../utils/decode"),
    clamp = require("./../utils/clamp"),
    GUniform = require("./GUniform"),
    GProgram = require("./GProgram"),
    GBuffer = require("./GBuffer"),
    { fetchArrayBuffer } = require("./../utils/resource");
const fetch = require('node-fetch');
// const url = "http://127.0.0.1:8002/tilesets/test1/12/6185/2047.terrain";
const url = "http://127.0.0.1:8002/tilesets/test1/2/6/1.terrain";
//
const fragText = isNode ? glslify.file("./../shader/glsl-earth-gl-terrain-fs.glsl") : require("./../shader/glsl-earth-gl-terrain-fs.glsl");
const vertText = isNode ? glslify.file("./../shader/glsl-earth-gl-terrain-vs.glsl") : require("./../shader/glsl-earth-gl-terrain-vs.glsl");
/**
 * request terrain data for cesium server
 * @class
 */
class GSurface {
    /**
     * @typedef {import("./../core/Quadtree")} Quadtree
     * @param {Quadtree} quadtree 
     */
    constructor(gl, quadtree) {
        /**
         * @type {WebGLRenderingContext}
         */
        this._gl = gl;
        /**
         * @type Quadtree
         */
        this._quadtree = quadtree;
        /**
         * @type {Object[]}
         * key-value: key=level-x-y, value:{program,buffer}
         */
        this._surfaces = [];
    }
    /**
     * 
     * @param {*} tile 
     */
    _request(tile) {
        const quadtreeTile = new QuadtreeTile({ x: 6, y: 1, level: 2 }),
            that = this,
            surfaces = this._surfaces;
        fetch(url, {
            method: "GET",
            headers: {
                "Accept": "application/vnd.quantized-mesh,application/octet-stream;q=0.9,*/*;q=0.01,*/*;",
            },
            responseType: "arraybuffer",
        }).then(function (res) {
            return res.arrayBuffer();
        }).then(function (buffer) {
            const width = height = 65
            const heightBufferLenght = width * height;
            const heightBuffer = new Uint16Array(buffer, 0, heightBufferLenght);
            const childTileMask = new Uint8Array(buffer, heightBufferLenght, 1)[0];
            const waterMask = new Uint8Array(buffer, heightBufferLenght + 1, buffer.byteLength - heightBufferLenght - 1);
            const isGeographic = true;
            const relativeToCenter = new Vec3();
            const exaggeration = 1.0;
         
        });
    }
    /**
     * 
     * @param {Float32Array} vertices 
     * @param {Unit8Array} indices 
     */
    _createSufraceElement(vertices, indices) {
        //
        const processVertices = [];
        const processIndices = indices;
        const lengthOfIndices = processIndices.length;
        const gl = this._gl;
        const program = new GProgram(gl, vertText, fragText);
        program.useProgram();
        //
        const verticesBuffer = new GBuffer(program, gl.ARRAY_BUFFER, gl.STATIC_DRAW, "a_position");
        // transform data
        verticesBuffer.bindBuffer();
        verticesBuffer.bufferData(new Float32Array(vertices));
        verticesBuffer.linkAndEnableAttribPointer(3, gl.FLOAT, false, 0, 0);
        // transform index data
        const indicesBuffer = new GBuffer(program, gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW);
        indicesBuffer.bindBuffer();
        indicesBuffer.bufferData(indices);
        //
        const u_projectionMatrix = new GUniform(program, "u_projectionMatrix"),
            u_viewMatrix = new GUniform(program, "u_viewMatrix"),
            u_modelMatrix = new GUniform(program, "u_modelMatrix");
        //
        return {
            program,
            indicesBuffer,
            verticesBuffer,
            u_projectionMatrix,
            u_viewMatrix,
            u_modelMatrix,
            lengthOfIndices,
        };
    }
    /**
     * 
     * @param {*} camera 
     */
    render(camera) {
        const gl = this._gl;
        for (var i = 0, len = this._surfaces.length; i < len; i++) {
            const surface = this._surfaces[i],
                { u_projectionMatrix, u_viewMatrix, u_modelMatrix, program, verticesBuffer, indicesBuffer, lengthOfIndices } = surface;
            program.useProgram();
            verticesBuffer.bindBuffer();
            verticesBuffer.linkAndEnableAttribPointer(3, gl.FLOAT, false, 0, 0);
            indicesBuffer.bindBuffer();
            //set camera
            u_projectionMatrix.assignValue(camera.ProjectionMatrix);
            u_viewMatrix.assignValue(camera.ViewMatrix);
            u_modelMatrix.assignValue(camera.IdentityMatrix);
            //gl draw
            gl.drawElements(gl.TRIANGLES, lengthOfIndices, gl.UNSIGNED_SHORT, 0);
        }
    }
    /**
     * 
     */
    update() {
        this._request();
        //1. culling volume
        //2. wait rendering tile collection
        //3. combine arrybuffer
    }
}

module.exports = GSurface;

