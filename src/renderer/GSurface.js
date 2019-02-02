
const requestImage = require('./../utils/requestImage'),
    PI_OVER_TWO = Math.PI / 2,
    QuadtreeTile = require("./../core/QuadtreeTile"),
    ellipsoid_wgs84 = require("./../core/Ellipsoid").WGS84,
    equal14 = require("./../utils/revise").equal14,
    BoundingSphere = require("./../core/BoundingSphere"),
    maximumRadius = require("./../core/Ellipsoid").WGS84.maximumRadius,
    { Vec3, Mat4, Vec2 } = require("kiwi.matrix"),
    clamp = require("./../utils/clamp"),
    GUniform = require("./GUniform"),
    GProgram = require("./GProgram"),
    GBuffer = require("./GBuffer");
//
const fragText = require("./../shader/surface_fs.glsl");
const vertText = require("./../shader/surface_vs.glsl");
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
         * @type {Quadtree}
         */
        this._quadtree = quadtree;
        /**
         * @type {Object[]}
         * key-value: key=level-x-y, value:{program,buffer}
         */
        this._surfaces = [];
        /**
         * listen to quadtree fire events
         */
        this._registerEvents();
    }
    /**
     * 
     */
    _registerEvents() {
        const quadtree = this._quadtree;
        quadtree.on('updatedTiles', this._updateTiles, this);
    }
    /**
     * @param o
     */
    _updateTiles(o) {
        const { waitRendering } = o;
        const sss = '';
    }
    /**
     * 
     * @param {*} tile 
     */
    _request(tile) {
        // const quadtreeTile = new QuadtreeTile({ x: 6, y: 1, level: 2 }),
        //     that = this,
        //     surfaces = this._surfaces;
        // fetch(url, {
        //     method: "GET",
        //     headers: {
        //         "Accept": "application/vnd.quantized-mesh,application/octet-stream;q=0.9,*/*;q=0.01,*/*;",
        //     },
        //     responseType: "arraybuffer",
        // }).then(function (res) {
        //     return res.arrayBuffer();
        // }).then(function (buffer) {
        //     //}{debug 
        // });
    }
    /**
     * 
     * @param {Float32Array} vertices 
     * @param {Unit8Array} indices 
     */
    _createSufraceElement(vertices, indices) {
        const processVertices = [];
        const processIndices = indices;
        const lengthOfIndices = processIndices.length;
        const gl = this._gl;
        const program = new GProgram(gl, vertText, fragText);
        program.useProgram();
        // const u_projectionMatrix = new GUniform(program, "u_projectionMatrix"),
        //     u_viewMatrix = new GUniform(program, "u_viewMatrix"),
        //     u_modelMatrix = new GUniform(program, "u_modelMatrix");
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
